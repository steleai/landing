import test from 'node:test';
import assert from 'node:assert/strict';
import { applicationIdFor, applicationPaths, commitApplication } from './applications.mjs';
import { notifyApplication, RECONCILE_AFTER_MS, sendWithResend } from './notifications.mjs';
import { baseConfig, fakeSender, fields, MemoryStore } from './testing/memory-store.mjs';

const NOW = Date.parse('2026-11-08T10:00:00Z');
const KEY = '7b0f8f7e-1d2c-4c7e-9a43-0c5b2f0e9d11';
const ID = applicationIdFor(KEY);
const RECORD = applicationPaths(ID).record;

async function setup() {
  let clock = NOW;
  const store = new MemoryStore({ now: () => clock });
  await commitApplication({ store, config: baseConfig, now: NOW, idempotencyKey: KEY, fields, pdf: Buffer.from('%PDF-1.7') });
  return { store, advance: ms => { clock += ms; }, now: () => clock };
}
const notify = (ctx, send, extra = {}) => notifyApplication({ store: ctx.store, config: baseConfig, id: ID, now: ctx.now, send, timeoutMs: 1000, ...extra });
const state = ctx => ctx.store.objects.get(RECORD).metadata;

test('sends a minimal email once with a stable idempotency key', async () => {
  const ctx = await setup();
  const { send, calls } = fakeSender();
  assert.equal(await notify(ctx, send), 'sent');
  assert.equal(await notify(ctx, send), 'sent');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].idempotencyKey, `stele-hiring/${ID}/0`);
  const { payload } = calls[0];
  assert.deepEqual(payload.to, ['info@stele.it.com']);
  assert.ok(payload.text.includes(ID));
  assert.ok(!payload.attachments);
  assert.ok(!/mario|rossi|example\.com|motivazione/i.test(JSON.stringify(payload)));
  assert.equal(state(ctx).notificationStatus, 'sent');
  assert.equal(state(ctx).notificationProviderId, 'email-1');
  assert.equal(state(ctx).notificationLeaseUntil, undefined);
});

test('an ambiguous attempt is retried with the same key and identical payload', async () => {
  const ctx = await setup();
  const { send, calls } = fakeSender([{ outcome: 'ambiguous', reason: 'network' }]);
  assert.equal(await notify(ctx, send), 'pending');
  assert.equal(state(ctx).notificationAmbiguousSince, new Date(NOW).toISOString());
  ctx.advance(3_600_000);
  assert.equal(await notify(ctx, send), 'sent');
  assert.equal(calls[1].idempotencyKey, calls[0].idempotencyKey);
  assert.deepEqual(calls[1].payload, calls[0].payload);
  assert.equal(state(ctx).notificationAmbiguousSince, undefined);
});

test('a definitive rejection moves to a fresh key, unless an ambiguity is unresolved', async () => {
  const ctx = await setup();
  const { send, calls } = fakeSender([{ outcome: 'rejected', reason: 'validation_error' }, { outcome: 'ambiguous', reason: 'http_500' }, { outcome: 'rejected', reason: 'rate_limit_exceeded' }]);
  await notify(ctx, send);
  await notify(ctx, send);
  await notify(ctx, send);
  await notify(ctx, send);
  assert.deepEqual(calls.map(call => call.idempotencyKey.split('/').pop()), ['0', '1', '1', '1']);
  assert.equal(state(ctx).notificationStatus, 'sent');
});

test('past the provider deduplication window an ambiguous notification needs reconciliation', async () => {
  const ctx = await setup();
  const { send, calls } = fakeSender([{ outcome: 'ambiguous', reason: 'network' }]);
  await notify(ctx, send);
  ctx.advance(RECONCILE_AFTER_MS + 1);
  assert.equal(await notify(ctx, send), 'reconcile');
  assert.equal(calls.length, 1);
  assert.equal(state(ctx).notificationStatus, 'reconcile');
});

test('an active lease blocks a concurrent sender; a lapsed one is treated as ambiguous', async () => {
  const ctx = await setup();
  await ctx.store.updateMetadata(RECORD, { notificationStatus: 'sending', notificationLeaseUntil: new Date(NOW + 30_000).toISOString(), notificationLastAttemptAt: new Date(NOW).toISOString() });
  const { send, calls } = fakeSender();
  assert.equal(await notify(ctx, send), 'leased');
  assert.equal(calls.length, 0);
  ctx.advance(120_000);
  assert.equal(await notify(ctx, send), 'sent');
  assert.equal(calls[0].idempotencyKey, `stele-hiring/${ID}/0`);
});

test('a lapsed lease past the window is not resent', async () => {
  const ctx = await setup();
  await ctx.store.updateMetadata(RECORD, { notificationStatus: 'sending', notificationLeaseUntil: new Date(NOW + 60_000).toISOString(), notificationLastAttemptAt: new Date(NOW).toISOString() });
  ctx.advance(RECONCILE_AFTER_MS + 1);
  const { send, calls } = fakeSender();
  assert.equal(await notify(ctx, send), 'reconcile');
  assert.equal(calls.length, 0);
});

test('expired applications and payload conflicts are never sent', async () => {
  const expired = await setup();
  expired.advance(91 * 86_400_000);
  const first = fakeSender();
  assert.equal(await notify(expired, first.send), 'expired');
  assert.equal(first.calls.length, 0);

  const conflicted = await setup();
  const second = fakeSender([{ outcome: 'conflict', reason: 'invalid_idempotent_request' }]);
  assert.equal(await notify(conflicted, second.send), 'reconcile');
  assert.equal(await notify(conflicted, second.send), 'reconcile');
  assert.equal(second.calls.length, 1);
});

test('without Resend configuration nothing is attempted', async () => {
  const ctx = await setup();
  const { send, calls } = fakeSender();
  assert.equal(await notify(ctx, send, { config: { ...baseConfig, resendApiKey: '' } }), 'unconfigured');
  assert.equal(calls.length, 0);
  assert.equal(state(ctx).notificationStatus, 'pending');
});

test('Resend responses map to delivery outcomes', async () => {
  const respond = (status, body) => async () => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  const call = fetchImpl => sendWithResend({ apiKey: 'k', payload: {}, idempotencyKey: 'x', timeoutMs: 1000, fetchImpl });
  let request;
  assert.deepEqual(await call(async (url, init) => { request = { url, init }; return respond(200, { id: 'abc' })(); }), { outcome: 'sent', id: 'abc' });
  assert.equal(request.url, 'https://api.resend.com/emails');
  assert.equal(request.init.headers['Idempotency-Key'], 'x');
  assert.equal(request.init.headers.Authorization, 'Bearer k');
  assert.equal((await call(respond(409, { name: 'concurrent_idempotent_requests' }))).outcome, 'ambiguous');
  assert.equal((await call(respond(409, { name: 'invalid_idempotent_request' }))).outcome, 'conflict');
  assert.equal((await call(respond(500, {}))).outcome, 'ambiguous');
  assert.equal((await call(respond(422, { name: 'validation_error' }))).outcome, 'rejected');
  assert.equal((await call(respond(429, { name: 'rate_limit_exceeded' }))).outcome, 'rejected');
  assert.equal((await call(async () => { throw new TypeError('fetch failed'); })).outcome, 'ambiguous');
  assert.equal((await call(respond(200, {}))).outcome, 'ambiguous');
});
