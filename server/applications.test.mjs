import test from 'node:test';
import assert from 'node:assert/strict';
import { applicationIdFor, applicationPaths, commitApplication, quotaDay, quotaPath } from './applications.mjs';
import { baseConfig, fields, MemoryStore } from './testing/memory-store.mjs';

const NOW = Date.parse('2026-11-08T10:00:00Z');
const KEY = '7b0f8f7e-1d2c-4c7e-9a43-0c5b2f0e9d11';
const pdf = Buffer.from('%PDF-1.7 synthetic');
const commit = (store, overrides = {}) => commitApplication({ store, config: baseConfig, now: NOW, idempotencyKey: KEY, fields, pdf, ...overrides });
const quotaCount = store => Number(store.objects.get(quotaPath(quotaDay(NOW))).metadata.count);

test('commits PDF then JSON under opaque paths with pending notification state', async () => {
  const store = new MemoryStore({ now: () => NOW });
  const result = await commit(store);
  const id = applicationIdFor(KEY);
  assert.deepEqual(result, { status: 201, applicationId: id });
  const paths = applicationPaths(id);
  assert.deepEqual([...store.objects.keys()].sort(), [paths.cv, paths.record, quotaPath('2026-11-08')].sort());
  for (const name of store.objects.keys()) assert.ok(!/mario|rossi|example\.com/i.test(name), name);

  const record = store.json(paths.record);
  assert.equal(record.candidate.email, fields.email);
  assert.equal(record.consents.privacyVersion, 'candidate-privacy-v1');
  assert.equal(record.consents.futureConsent, false);
  assert.equal(record.createdAt, '2026-11-08T10:00:00.000Z');
  assert.equal(record.expiresAt, '2027-02-06T10:00:00.000Z');
  assert.equal(record.cv.generation, store.objects.get(paths.cv).generation.toString());
  assert.equal(record.cv.bytes, pdf.length);
  assert.match(record.submissionDigest, /^[0-9a-f]{64}$/);

  const meta = store.objects.get(paths.record).metadata;
  assert.equal(meta.notificationStatus, 'pending');
  assert.equal(meta.expiresAt, record.expiresAt);
  assert.equal(store.objects.get(paths.cv).metadata.submissionDigest, record.submissionDigest);
  assert.equal(quotaCount(store), 1);
});

test('identical retry returns the same reference without a second application or quota', async () => {
  const store = new MemoryStore({ now: () => NOW });
  const first = await commit(store);
  const second = await commit(store);
  assert.deepEqual(second, { status: 200, applicationId: first.applicationId });
  assert.equal([...store.objects.keys()].filter(name => name.endsWith('application.json')).length, 1);
  assert.equal(quotaCount(store), 1);
});

test('same key with different content is a conflict', async () => {
  const store = new MemoryStore({ now: () => NOW });
  await commit(store);
  assert.deepEqual(await commit(store, { fields: { ...fields, motivation: 'altro' } }), { status: 409 });
  assert.deepEqual(await commit(store, { pdf: Buffer.from('%PDF-1.7 other') }), { status: 409 });
});

test('a retry completes an orphan upload and refreshes its last attempt', async () => {
  const store = new MemoryStore({ now: () => NOW });
  let failRecord = true;
  store.hooks.create = name => { if (name.endsWith('application.json') && failRecord) { failRecord = false; throw Object.assign(new Error('boom'), { code: 503 }); } };
  await assert.rejects(commit(store));
  const paths = applicationPaths(applicationIdFor(KEY));
  const orphan = store.objects.get(paths.cv);
  assert.ok(orphan && !store.objects.has(paths.record));

  const later = NOW + 3_600_000;
  const result = await commit(store, { now: later });
  assert.equal(result.status, 201);
  assert.equal(store.objects.get(paths.cv).generation, orphan.generation);
  assert.equal(store.objects.get(paths.cv).metadata.lastAttemptAt, new Date(later).toISOString());
});

test('daily limit refuses new applications but still answers committed retries', async () => {
  const store = new MemoryStore({ now: () => NOW });
  const config = { ...baseConfig, maxApplicationsPerDay: 1 };
  const first = await commit(store, { config });
  assert.equal(first.status, 201);
  assert.deepEqual(await commit(store, { config, idempotencyKey: '00000000-0000-4000-8000-000000000000' }), { status: 429 });
  assert.equal([...store.objects.keys()].filter(name => name.endsWith('application.json')).length, 1);
  assert.deepEqual(await commit(store, { config }), { status: 200, applicationId: first.applicationId });
});

test('a concurrent commit of the same application releases the extra reservation', async () => {
  const store = new MemoryStore({ now: () => NOW });
  await commit(store);
  const paths = applicationPaths(applicationIdFor(KEY));
  // Hide the record from the replay shortcut so the conditional create decides.
  const original = store.getMetadata.bind(store);
  let hidden = true;
  store.getMetadata = async name => (name === paths.record && hidden ? (hidden = false, null) : original(name));
  assert.equal((await commit(store)).status, 200);
  assert.equal(quotaCount(store), 1);
});

test('future consent keeps the profile for 24 calendar months', async () => {
  const store = new MemoryStore({ now: () => NOW });
  await commit(store, { fields: { ...fields, futureConsent: 'true' } });
  const record = store.json(applicationPaths(applicationIdFor(KEY)).record);
  assert.equal(record.expiresAt, '2028-11-08T10:00:00.000Z');
  assert.equal(record.consents.futureConsentAt, '2026-11-08T10:00:00.000Z');
});

test('quota days follow Europe/Rome', () => {
  assert.equal(quotaDay(Date.parse('2026-11-08T23:30:00Z')), '2026-11-09');
});
