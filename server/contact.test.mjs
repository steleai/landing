import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from './app.mjs';
import { baseConfig, fakeSender, MemoryStore } from './testing/memory-store.mjs';

const message = { name: 'Mario Rossi', email: 'mario.rossi@example.com', message: 'Vorrei una demo di SprintAct.', locale: 'it' };

async function start(t, { config = baseConfig, outcomes = [], now } = {}) {
  const sender = fakeSender(outcomes);
  const app = createApp({ config, store: new MemoryStore(), send: sender.send, scan: async () => {}, ...(now ? { now } : {}) });
  const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;
  let n = 0;
  const post = ({ body = message, key = `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`, origin = 'https://stele.it.com', ip } = {}) =>
    fetch(`${base}/v1/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin, 'Idempotency-Key': key, ...(ip ? { 'X-Forwarded-For': ip } : {}) }, body: typeof body === 'string' ? body : JSON.stringify(body) });
  return { post, sender, base };
}

test('contact message is sent to NOTIFICATION_TO with the sender as Reply-To', async t => {
  const { post, sender } = await start(t);
  const res = await post({ key: '7b0f8f7e-1d2c-4c7e-9a43-0c5b2f0e9d11' });
  assert.equal(res.status, 202);
  assert.equal(res.headers.get('Access-Control-Allow-Origin'), 'https://stele.it.com');
  assert.equal(sender.calls.length, 1);
  const [{ payload, idempotencyKey, apiKey }] = sender.calls;
  assert.equal(apiKey, 're_test');
  assert.equal(idempotencyKey, 'stele-contact/7b0f8f7e-1d2c-4c7e-9a43-0c5b2f0e9d11');
  assert.deepEqual(payload.to, ['info@stele.it.com']);
  assert.equal(payload.from, baseConfig.notificationFrom);
  assert.equal(payload.reply_to, 'mario.rossi@example.com');
  assert.match(payload.subject, /Mario Rossi/);
  assert.match(payload.text, /Vorrei una demo di SprintAct\./);
});

test('contact works while hiring is closed, but not without Resend', async t => {
  const closed = await start(t, { config: { ...baseConfig, hiringEnabled: false, bucket: '' } });
  assert.equal((await closed.post()).status, 202);
  const noResend = await start(t, { config: { ...baseConfig, resendApiKey: '' } });
  assert.equal((await noResend.post()).status, 503);
  assert.equal(noResend.sender.calls.length, 0);
});

test('contact rejections: fields, key, origin, honeypot, provider failure', async t => {
  const { post, sender } = await start(t, { outcomes: [{ outcome: 'ambiguous', reason: 'network' }, { outcome: 'rejected', reason: 'validation_error' }] });
  assert.equal((await post({ body: { ...message, email: 'not-an-email' } })).status, 400);
  assert.equal((await post({ body: { ...message, message: '   ' } })).status, 400);
  assert.equal((await post({ body: { ...message, name: 'A\r\nBcc: x@y.z' } })).status, 400);
  assert.equal((await post({ body: { ...message, extra: 'x' } })).status, 400);
  assert.equal((await post({ body: { ...message, message: 'x'.repeat(1001) } })).status, 400);
  assert.equal((await post({ body: '{not json' })).status, 400);
  assert.equal((await post({ key: 'nope' })).status, 400);
  assert.equal((await post({ origin: 'https://evil.example' })).status, 403);
  assert.equal(sender.calls.length, 0);
  assert.equal((await post({ body: { ...message, website: 'http://spam' } })).status, 202);
  assert.equal(sender.calls.length, 0);
  assert.equal((await post()).status, 503);
  assert.equal((await post()).status, 503);
  assert.equal(sender.calls.length, 2);
});

test('contact is rate limited per client address', async t => {
  const { post, sender } = await start(t);
  for (let i = 0; i < 5; i++) assert.equal((await post({ ip: 'spoofed, 203.0.113.7' })).status, 202);
  assert.equal((await post({ ip: 'other, 203.0.113.7' })).status, 429);
  assert.equal((await post({ ip: '203.0.113.8' })).status, 202);
  assert.equal(sender.calls.length, 6);
});
