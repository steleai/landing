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
