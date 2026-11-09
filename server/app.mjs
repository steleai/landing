import express from 'express';
import multer from 'multer';
import { applicationIdFor, applicationPaths, commitApplication, quotaAvailable, quotaDay } from './applications.mjs';
import { acceptingConfigured, deadlinePassed, isOpen, notificationsConfigured } from './config.mjs';
import { buildContactEmail, clientKey, contactSchema, createRateLimiter } from './contact.mjs';
import { errorCode } from './log.mjs';
import { notifyApplication } from './notifications.mjs';
import { InfectedFileError } from './scanner.mjs';
import { applicationSchema, MAX_CV_BYTES, validatePdf } from './validation.mjs';

const IDEMPOTENCY_KEY = /^[0-9a-f-]{36}$/i;
const FIRST_NOTIFICATION_TIMEOUT_MS = 8_000;
const CONTACT_TIMEOUT_MS = 8_000;

export function createApp({ config, store, scan, send, now = Date.now, log = () => {} }) {
  const app = express();
  app.disable('x-powered-by');
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_CV_BYTES, files: 1, fields: 8, fieldSize: 8192, parts: 9 } });

  // CORS identifies browsers, it does not authenticate or limit abuse.
  app.use((req, res, next) => {
    res.set({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    const origin = req.get('Origin');
    if (origin && origin !== config.allowedOrigin) return res.status(403).json({ error: 'origin' });
    if (origin) res.set({ 'Access-Control-Allow-Origin': origin, Vary: 'Origin', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Idempotency-Key' });
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  // Contact form. Independent of hiring: needs only Resend and ALLOWED_ORIGIN.
  // Each client reuses its Idempotency-Key on retry, so Resend sends at most once.
  const contactPerClient = createRateLimiter({ limit: 5, windowMs: 3_600_000, now });
  const contactGlobal = createRateLimiter({ limit: 100, windowMs: 3_600_000, now });
  app.post('/v1/contact', express.json({ limit: '16kb' }), async (req, res) => {
    if (!notificationsConfigured(config) || !config.allowedOrigin) return res.status(503).json({ error: 'closed' });
    const key = req.get('Idempotency-Key');
    if (!key || !IDEMPOTENCY_KEY.test(key)) return res.status(400).json({ error: 'idempotency_key' });
    const parsed = contactSchema.safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ error: 'invalid_fields' });
    if (parsed.data.website) {
      log('WARNING', 'contact_honeypot');
      return res.status(202).json({ ok: true });
    }
    if (!contactPerClient(clientKey(req)) || !contactGlobal('all')) return res.status(429).set('Retry-After', '3600').json({ error: 'rate_limit' });
    let result;
    try {
      result = await send({ apiKey: config.resendApiKey, payload: buildContactEmail(parsed.data, config), idempotencyKey: `stele-contact/${key}`, timeoutMs: CONTACT_TIMEOUT_MS });
    } catch (error) {
      result = { outcome: 'ambiguous', reason: errorCode(error) };
    }
    if (result.outcome === 'sent') {
      log('INFO', 'contact_sent', { providerId: result.id });
      return res.status(202).json({ ok: true });
    }
    log('WARNING', 'contact_failed', { outcome: result.outcome, reason: result.reason });
    return res.status(503).json({ error: 'temporarily_unavailable' });
  });

  app.get('/healthz', (_req, res) => res.json({ ok: true }));
  app.get('/v1/hiring', (_req, res) => res.json({ open: isOpen(config, now()) }));

  // Cheap checks and the persisted daily limit run before buffering the upload.
  app.post('/v1/applications', async (req, res, next) => {
    if (!acceptingConfigured(config)) return res.status(503).json({ error: 'closed' });
    if (deadlinePassed(config, now())) return res.status(410).json({ error: 'closed' });
    const key = req.get('Idempotency-Key');
    if (!key || !IDEMPOTENCY_KEY.test(key)) return res.status(400).json({ error: 'idempotency_key' });
    try {
      if (!(await quotaAvailable(store, quotaDay(now()), config.maxApplicationsPerDay))) {
        // A retry of an application committed earlier today is still answered.
        const committed = await store.getMetadata(applicationPaths(applicationIdFor(key)).record).catch(() => null);
        if (!committed) return res.status(429).set('Retry-After', '3600').json({ error: 'rate_limit' });
      }
    } catch (error) {
      log('ERROR', 'quota_unavailable', { error: errorCode(error) });
      return res.status(503).json({ error: 'temporarily_unavailable' });
    }
    next();
  }, upload.single('cv'), async (req, res) => {
    const parsed = applicationSchema.safeParse({ ...req.body });
    if (!parsed.success) return res.status(400).json({ error: 'invalid_fields' });
    try { await validatePdf(req.file); } catch { return res.status(400).json({ error: 'invalid_pdf' }); }
    try {
      await scan(req.file.buffer);
    } catch (error) {
      if (error instanceof InfectedFileError) {
        log('WARNING', 'upload_rejected_by_scanner');
        return res.status(400).json({ error: 'invalid_pdf' });
      }
      log('ERROR', 'scanner_unavailable', { error: errorCode(error) });
      return res.status(503).json({ error: 'temporarily_unavailable' });
    }

    let result;
    try {
      result = await commitApplication({ store, config, now: now(), idempotencyKey: req.get('Idempotency-Key'), fields: parsed.data, pdf: req.file.buffer });
    } catch (error) {
      log('ERROR', 'application_commit_failed', { error: errorCode(error) });
      return res.status(503).json({ error: 'temporarily_unavailable' });
    }
    if (result.status === 409) return res.status(409).json({ error: 'idempotency_conflict' });
    if (result.status === 429) return res.status(429).set('Retry-After', '3600').json({ error: 'rate_limit' });

    // Committed. The first notification is bounded; failures stay pending for the job.
    // It runs before responding because request-billed Cloud Run throttles CPU afterwards.
    try {
      await notifyApplication({ store, config, id: result.applicationId, now, send, log, timeoutMs: FIRST_NOTIFICATION_TIMEOUT_MS });
    } catch (error) {
      log('WARNING', 'notification_deferred', { applicationId: result.applicationId, error: errorCode(error) });
    }
    log('INFO', 'application_received', { applicationId: result.applicationId, replay: result.status === 200 });
    return res.status(result.status).json({ applicationId: result.applicationId });
  });

  app.use((error, _req, res, _next) => res.status(error?.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: 'invalid_upload' }));
  return app;
}
