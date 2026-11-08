import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';

test('unconfigured API stays closed and rejects foreign origins without cloud credentials', async () => {
  const socket = net.createServer(); socket.listen(0, '127.0.0.1'); await once(socket, 'listening');
  const port = socket.address().port; await new Promise(resolve => socket.close(resolve));
  const child = spawn(process.execPath, ['index.mjs'], { cwd: new URL('.', import.meta.url), env: { ...process.env, PORT: String(port), HIRING_ENABLED: 'false', ALLOWED_ORIGIN: 'https://stele.it.com' }, stdio: 'pipe' });
  const base = `http://127.0.0.1:${port}`;
  let errors = '';
  child.stderr.on('data', chunk => { errors += chunk; });
  try {
    let ready = false;
    for (let i = 0; i < 600; i++) {
      try { ready = (await fetch(`${base}/healthz`)).ok; } catch { /* waiting for listener */ }
      if (ready) break;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    assert.equal(ready, true, errors);
    assert.deepEqual(await (await fetch(`${base}/v1/hiring`)).json(), { open: false });
    assert.equal((await fetch(`${base}/v1/applications`, { method: 'POST' })).status, 503);
    assert.equal((await fetch(`${base}/v1/hiring`, { headers: { Origin: 'https://evil.example' } })).status, 403);
    const preflight = await fetch(`${base}/v1/applications`, { method: 'OPTIONS', headers: { Origin: 'https://stele.it.com' } });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), 'https://stele.it.com');
  } finally { child.kill(); await once(child, 'exit'); }
});

test('multipart applications: commit, idempotent retry and every rejection path', async t => {
  const { PDFDocument } = await import('pdf-lib');
  const { createApp } = await import('./app.mjs');
  const { InfectedFileError } = await import('./scanner.mjs');
  const { MemoryStore, baseConfig, fakeSender, fields } = await import('./testing/memory-store.mjs');
  const doc = await PDFDocument.create(); doc.addPage();
  const pdf = Buffer.from(await doc.save());
  const store = new MemoryStore();
  const sender = fakeSender();
  let scanResult = null;
  let config = { ...baseConfig };
  const app = createApp({ config: new Proxy({}, { get: (_target, key) => config[key] }), store, send: sender.send, scan: async () => { if (scanResult) throw scanResult; } });
  const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = ({ key = '7b0f8f7e-1d2c-4c7e-9a43-0c5b2f0e9d11', body = fields, file = pdf, name = 'cv.pdf', type = 'application/pdf', origin = 'https://stele.it.com' } = {}) => {
    const form = new FormData();
    for (const [field, value] of Object.entries(body)) form.set(field, value);
    if (file) form.set('cv', new Blob([file], { type }), name);
    return fetch(`${base}/v1/applications`, { method: 'POST', headers: { 'Idempotency-Key': key, Origin: origin }, body: form });
  };

  assert.deepEqual(await (await fetch(`${base}/v1/hiring`)).json(), { open: true });
  const created = await post();
  assert.equal(created.status, 201);
  assert.equal(created.headers.get('Access-Control-Allow-Origin'), 'https://stele.it.com');
  const { applicationId } = await created.json();
  assert.match(applicationId, /^[0-9a-f]{64}$/);
  assert.equal(sender.calls.length, 1);
  assert.equal(store.objects.get(`applications/${applicationId}/application.json`).metadata.notificationStatus, 'sent');

  const retried = await post();
  assert.equal(retried.status, 200);
  assert.deepEqual(await retried.json(), { applicationId });
  assert.equal(sender.calls.length, 1);
  assert.equal((await post({ body: { ...fields, motivation: 'diversa' } })).status, 409);

  assert.equal((await post({ key: 'not-a-uuid' })).status, 400);
  assert.equal((await post({ key: '00000000-0000-4000-8000-000000000001', body: { ...fields, privacyAcknowledged: 'false' } })).status, 400);
  assert.equal((await post({ key: '00000000-0000-4000-8000-000000000002', body: { ...fields, extra: 'x' } })).status, 400);
  assert.equal((await post({ key: '00000000-0000-4000-8000-000000000003', file: Buffer.from('%PDF-garbage') })).status, 400);
  assert.equal((await post({ key: '00000000-0000-4000-8000-000000000004', file: null })).status, 400);
  assert.equal((await post({ key: '00000000-0000-4000-8000-000000000005', file: Buffer.alloc(5 * 1024 * 1024 + 1, 0x25) })).status, 413);
  scanResult = new InfectedFileError('infected');
  assert.equal((await post({ key: '00000000-0000-4000-8000-000000000006' })).status, 400);
  scanResult = Object.assign(new Error('clamscan missing'), { code: 'ENOENT' });
  assert.equal((await post({ key: '00000000-0000-4000-8000-000000000007' })).status, 503);
  scanResult = null;
  assert.equal((await post({ origin: 'https://evil.example' })).status, 403);

  // Resend down: the application is still received, the notification stays pending.
  const failingSender = fakeSender([{ outcome: 'ambiguous', reason: 'network' }]);
  const failingApp = createApp({ config: baseConfig, store, send: failingSender.send, scan: async () => {} });
  const failingServer = failingApp.listen(0, '127.0.0.1'); await once(failingServer, 'listening');
  t.after(() => failingServer.close());
  const failingForm = new FormData();
  for (const [field, value] of Object.entries(fields)) failingForm.set(field, value);
  failingForm.set('cv', new Blob([pdf], { type: 'application/pdf' }), 'cv.pdf');
  const pending = await fetch(`http://127.0.0.1:${failingServer.address().port}/v1/applications`, { method: 'POST', headers: { 'Idempotency-Key': '00000000-0000-4000-8000-000000000008' }, body: failingForm });
  assert.equal(pending.status, 201);
  const pendingId = (await pending.json()).applicationId;
  assert.equal(store.objects.get(`applications/${pendingId}/application.json`).metadata.notificationStatus, 'pending');

  config = { ...baseConfig, maxApplicationsPerDay: 2 };
  assert.equal((await post({ key: '00000000-0000-4000-8000-000000000009' })).status, 429);
  assert.equal((await post()).status, 200, 'committed retries are answered after the daily limit');
  config = { ...baseConfig, deadline: Date.parse('2020-01-01T00:00:00Z') };
  assert.equal((await post({ key: '00000000-0000-4000-8000-000000000010' })).status, 410);
  assert.deepEqual(await (await fetch(`${base}/v1/hiring`)).json(), { open: false });
  config = { ...baseConfig, legalApproved: false };
  assert.equal((await post({ key: '00000000-0000-4000-8000-000000000011' })).status, 503);
});

test('without Resend the form stays open and notifications remain pending', async t => {
  const { PDFDocument } = await import('pdf-lib');
  const { createApp } = await import('./app.mjs');
  const { MemoryStore, baseConfig, fakeSender, fields } = await import('./testing/memory-store.mjs');
  const doc = await PDFDocument.create(); doc.addPage();
  const store = new MemoryStore();
  const sender = fakeSender();
  const config = { ...baseConfig, resendApiKey: '', notificationFrom: '', notificationTo: '' };
  const server = createApp({ config, store, send: sender.send, scan: async () => {} }).listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.deepEqual(await (await fetch(`${base}/v1/hiring`)).json(), { open: true });
  const form = new FormData();
  for (const [field, value] of Object.entries(fields)) form.set(field, value);
  form.set('cv', new Blob([Buffer.from(await doc.save())], { type: 'application/pdf' }), 'cv.pdf');
  const response = await fetch(`${base}/v1/applications`, { method: 'POST', headers: { 'Idempotency-Key': '00000000-0000-4000-8000-0000000000aa' }, body: form });
  assert.equal(response.status, 201);
  const { applicationId } = await response.json();
  assert.equal(sender.calls.length, 0);
  assert.equal(store.objects.get(`applications/${applicationId}/application.json`).metadata.notificationStatus, 'pending');
});
