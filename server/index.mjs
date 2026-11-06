import express from 'express';
import multer from 'multer';
import { Firestore, Timestamp } from '@google-cloud/firestore';
import { Storage } from '@google-cloud/storage';
import { createHash, createHmac } from 'node:crypto';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { applicationSchema, futureExpiry, MAX_CV_BYTES, validatePdf } from './validation.mjs';

const db = new Firestore();
const storage = new Storage();
const app = express();
app.disable('x-powered-by');
const enabled = () => process.env.HIRING_ENABLED === 'true' && process.env.LEGAL_APPROVED === 'true' && process.env.CV_BUCKET && process.env.RATE_LIMIT_SECRET && Number(process.env.CURRENT_RETENTION_DAYS) > 0 && process.env.NOTIFICATION_FROM && process.env.SMTP_HOST;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_CV_BYTES, files: 1, fields: 8, fieldSize: 8192, parts: 9 } });
app.use((req, res, next) => {
  res.set({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  const origin = req.get('Origin');
  if (origin && origin !== process.env.ALLOWED_ORIGIN) return res.status(403).json({ error: 'origin' });
  if (origin) res.set({ 'Access-Control-Allow-Origin': origin, Vary: 'Origin', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Idempotency-Key' });
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.get('/healthz', (_req, res) => res.json({ ok: true }));
app.get('/v1/hiring', (_req, res) => res.json({ open: Boolean(enabled()) && (!process.env.DEADLINE || Date.now() < Date.parse(process.env.DEADLINE)) }));

// Apply a distributed quota before buffering any file. Do not trust client X-Forwarded-For.
app.post('/v1/applications', async (req, res, next) => {
  if (!enabled()) return res.status(503).json({ error: 'closed' });
  if (process.env.DEADLINE && Date.now() >= Date.parse(process.env.DEADLINE)) return res.status(410).json({ error: 'closed' });
  const key = req.get('Idempotency-Key');
  if (!key || !/^[0-9a-f-]{36}$/i.test(key)) return res.status(400).json({ error: 'idempotency_key' });
  const day = new Date().toISOString().slice(0, 10);
  const hash = createHmac('sha256', process.env.RATE_LIMIT_SECRET).update(`${day}:${req.socket.remoteAddress}`).digest('hex');
  try {
    const allowed = await db.runTransaction(async tx => {
      const ref = db.collection('hiringQuotas').doc(hash);
      const snap = await tx.get(ref);
      const count = snap.data()?.count || 0;
      if (count >= 20) return false;
      tx.set(ref, { count: count + 1, expiresAt: Timestamp.fromMillis(Date.now() + 86400000) });
      return true;
    });
    if (!allowed) return res.status(429).set('Retry-After', '3600').json({ error: 'rate_limit' });
    next();
  } catch { res.status(503).json({ error: 'unavailable' }); }
}, upload.single('cv'), async (req, res) => {
  const parsed = applicationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_fields' });
  try { await validatePdf(req.file); } catch { return res.status(400).json({ error: 'invalid_pdf' }); }
  const fields = parsed.data;
  const digest = createHash('sha256').update(JSON.stringify(fields)).update(req.file.buffer).digest('hex');
  const id = createHash('sha256').update(req.get('Idempotency-Key')).digest('hex');
  const ref = db.collection('applications').doc(id);
  let dir;
  try {
    const previous = await ref.get();
    if (previous.exists) return res.status(previous.data().digest === digest ? 200 : 409).json(previous.data().digest === digest ? { applicationId: id } : { error: 'idempotency_conflict' });
    // Fail closed: scanner missing, stale database, encrypted/corrupt files never enter the bucket.
    dir = await mkdtemp(join(tmpdir(), 'cv-'));
    const path = join(dir, 'cv.pdf');
    await writeFile(path, req.file.buffer);
    await promisify(execFile)('clamscan', ['--no-summary', '--fail-if-cvd-older-than=2', path], { timeout: 30000 });
    const object = storage.bucket(process.env.CV_BUCKET).file(`applications/${id}/cv.pdf`);
    await object.save(req.file.buffer, { resumable: false, preconditionOpts: { ifGenerationMatch: 0 }, metadata: { contentType: 'application/pdf', cacheControl: 'no-store', contentDisposition: 'attachment; filename="cv.pdf"', metadata: { submissionDigest: digest } } }).catch(error => { if (error.code !== 412) throw error; });
    const [objectMetadata] = await object.getMetadata();
    if (objectMetadata.metadata?.submissionDigest !== digest) return res.status(409).json({ error: 'idempotency_conflict' });
    const now = new Date();
    const expires = fields.futureConsent === 'true' ? futureExpiry(now) : new Date(now.getTime() + Number(process.env.CURRENT_RETENTION_DAYS) * 86400000);
    try {
      await ref.create({ ...fields, futureConsent: fields.futureConsent === 'true', privacyAcknowledged: true, digest, roleId: 'legal-product-specialist', jobVersion: 'provisional-v2', createdAt: Timestamp.fromDate(now), expiresAt: Timestamp.fromDate(expires), futureConsentAt: fields.futureConsent === 'true' ? Timestamp.fromDate(now) : null, objectPath: object.name, notification: 'pending', status: 'received' });
    } catch (error) {
      if (error.code !== 6) throw error;
      const concurrent = await ref.get();
      if (concurrent.data()?.digest !== digest) return res.status(409).json({ error: 'idempotency_conflict' });
    }
    res.status(201).json({ applicationId: id });
  } catch { res.status(503).json({ error: 'temporarily_unavailable' }); }
  finally { if (dir) await rm(dir, { recursive: true, force: true }); }
});
app.use((error, _req, res, _next) => res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: 'invalid_upload' }));
app.listen(process.env.PORT || 8080);
