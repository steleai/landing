import test from 'node:test';
import assert from 'node:assert/strict';
import { applicationIdFor, applicationPaths, commitApplication, quotaPath } from './applications.mjs';
import { runMaintenance } from './lifecycle.mjs';
import { baseConfig, fakeSender, fields, MemoryStore } from './testing/memory-store.mjs';

const NOW = Date.parse('2026-11-08T10:00:00Z');
const DAY = 86_400_000;
const keys = ['11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333'];
const pathsFor = key => applicationPaths(applicationIdFor(key));

function world() {
  let clock = NOW;
  const store = new MemoryStore({ now: () => clock });
  const config = { ...baseConfig, maxApplicationsPerDay: 100 };
  const commit = (key, extra = {}) => commitApplication({ store, config, now: clock, idempotencyKey: key, fields: { ...fields, ...extra }, pdf: Buffer.from(`%PDF-1.7 ${key}`) });
  return { store, config, commit, now: () => clock, advance: ms => { clock += ms; } };
}

test('deletes expired PDF and JSON, notifies pending and skips sent applications', async () => {
  const w = world();
  await w.commit(keys[0]);
  await w.commit(keys[1], { futureConsent: 'true' });
  await w.store.updateMetadata(pathsFor(keys[1]).record, { notificationStatus: 'sent' });
  w.advance(91 * DAY);
  await w.commit(keys[2]);

  const { send, calls } = fakeSender();
  const summary = await runMaintenance({ store: w.store, config: w.config, now: w.now, send });
  assert.equal(summary.expiredDeleted, 1);
  assert.equal(summary.notified, 1);
  assert.equal(summary.errors, 0);
  assert.ok(!w.store.objects.has(pathsFor(keys[0]).cv) && !w.store.objects.has(pathsFor(keys[0]).record));
  assert.ok(w.store.objects.has(pathsFor(keys[1]).record));
  assert.equal(calls.length, 1);
  assert.ok(calls[0].payload.text.includes(applicationIdFor(keys[2])));
});

test('an interrupted expiry deletion finishes on the next run', async () => {
  const w = world();
  await w.commit(keys[0]);
  w.advance(91 * DAY);
  let fail = true;
  w.store.hooks.delete = name => { if (name.endsWith('application.json') && fail) { fail = false; throw Object.assign(new Error('boom'), { code: 503 }); } };
  const first = await runMaintenance({ store: w.store, config: w.config, now: w.now, send: fakeSender().send });
  assert.equal(first.errors, 1);
  assert.ok(!w.store.objects.has(pathsFor(keys[0]).cv));
  const second = await runMaintenance({ store: w.store, config: w.config, now: w.now, send: fakeSender().send });
  assert.equal(second.expiredDeleted, 1);
  assert.equal(second.errors, 0);
  assert.equal([...w.store.objects.keys()].filter(name => name.startsWith('applications/')).length, 0);
});

test('orphans are removed after 24 hours from the last attempt, never while being retried', async () => {
  const w = world();
  const orphan = pathsFor(keys[0]).cv;
  await w.store.create(orphan, '%PDF-1.7', { metadata: { submissionDigest: 'x' } });
  w.advance(23 * 3_600_000);
  assert.equal((await runMaintenance({ store: w.store, config: w.config, now: w.now })).orphansDeleted, 0);
  w.advance(2 * 3_600_000);
  // A retry touches the orphan after listing: the conditional delete must fail.
  w.store.hooks.delete = async name => { w.store.hooks.delete = undefined; await w.store.updateMetadata(name, { lastAttemptAt: new Date(w.now()).toISOString() }); };
  const raced = await runMaintenance({ store: w.store, config: w.config, now: w.now });
  assert.equal(raced.orphansDeleted, 0);
  assert.equal(raced.errors, 0);
  assert.ok(w.store.objects.has(orphan));
  w.advance(DAY + 1);
  assert.equal((await runMaintenance({ store: w.store, config: w.config, now: w.now })).orphansDeleted, 1);
  assert.ok(!w.store.objects.has(orphan));
});

test('removes quota records older than yesterday and keeps the current ones', async () => {
  const w = world();
  for (const day of ['2026-11-01', '2026-11-06', '2026-11-07', '2026-11-08']) await w.store.create(quotaPath(day), '{}', { metadata: { count: '1' } });
  const summary = await runMaintenance({ store: w.store, config: w.config, now: w.now });
  assert.equal(summary.quotaDeleted, 2);
  assert.deepEqual([...w.store.objects.keys()].sort(), [quotaPath('2026-11-07'), quotaPath('2026-11-08')]);
});

test('expiry deletion continues without Resend and failures do not stop other items', async () => {
  const w = world();
  await w.commit(keys[0]);
  await w.commit(keys[1]);
  w.advance(91 * DAY);
  const failing = pathsFor(keys[0]).cv;
  w.store.hooks.delete = name => { if (name === failing) throw Object.assign(new Error('boom'), { code: 503 }); };
  const summary = await runMaintenance({ store: w.store, config: { ...w.config, resendApiKey: '' }, now: w.now });
  assert.equal(summary.errors, 1);
  assert.equal(summary.expiredDeleted, 1);
  assert.ok(!w.store.objects.has(pathsFor(keys[1]).record));
});

test('pending notifications without configuration are reported, operator states are surfaced', async () => {
  const w = world();
  await w.commit(keys[0]);
  await w.commit(keys[1]);
  await w.store.updateMetadata(pathsFor(keys[1]).record, { notificationStatus: 'reconcile' });
  const summary = await runMaintenance({ store: w.store, config: { ...w.config, resendApiKey: '' }, now: w.now });
  assert.equal(summary.notificationPending, 1);
  assert.equal(summary.notificationReconcile, 1);
});
