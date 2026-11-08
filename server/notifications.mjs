import { applicationPaths, ROLE_TITLE } from './applications.mjs';
import { notificationsConfigured } from './config.mjs';
import { isPreconditionFailed } from './store.mjs';

const RESEND_URL = 'https://api.resend.com/emails';
const LEASE_MS = 60_000;
// Resend deduplicates an Idempotency-Key for 24 hours. Past this margin an
// ambiguous attempt may already have been delivered: reconcile, never resend blindly.
export const RECONCILE_AFTER_MS = 23 * 3_600_000;
export const MAX_ATTEMPTS = 50;
const iso = ms => new Date(ms).toISOString();

/**
 * One POST to Resend. Outcomes:
 * - sent: accepted, with provider id;
 * - rejected: definitive refusal, nothing was sent (4xx, including 429);
 * - ambiguous: timeout, network or 5xx; delivery unknown, retry with the same key;
 * - conflict: the key was used with a different payload; needs reconciliation.
 */
export async function sendWithResend({ apiKey, payload, idempotencyKey, timeoutMs, fetchImpl = fetch }) {
  let response;
  let body = null;
  try {
    response = await fetchImpl(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey, 'User-Agent': 'stele-hiring-api' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    });
    body = await response.json().catch(() => null);
  } catch {
    return { outcome: 'ambiguous', reason: 'network' };
  }
  if (response.ok) return body?.id ? { outcome: 'sent', id: String(body.id) } : { outcome: 'ambiguous', reason: 'malformed_response' };
  const name = typeof body?.name === 'string' ? body.name : '';
  if (response.status === 409) {
    return name === 'concurrent_idempotent_requests' ? { outcome: 'ambiguous', reason: name } : { outcome: 'conflict', reason: name || 'http_409' };
  }
  if (response.status >= 500) return { outcome: 'ambiguous', reason: `http_${response.status}` };
  return { outcome: 'rejected', reason: name || `http_${response.status}` };
}

// Deterministic from the immutable record and configuration: retries with the
// same Idempotency-Key must send an identical payload. No CV, name or email.
export function buildNotification(record, config) {
  const folder = `applications/${record.applicationId}/`;
  const consoleUrl = `https://console.cloud.google.com/storage/browser/${config.bucket}/${folder}${config.project ? `?project=${config.project}` : ''}`;
  return {
    from: config.notificationFrom,
    to: [config.notificationTo],
    subject: `Stele: nuova candidatura ${ROLE_TITLE} (${record.applicationId.slice(0, 12)})`,
    text: [
      `È stata ricevuta una nuova candidatura per ${ROLE_TITLE}.`,
      '',
      `Riferimento: ${record.applicationId}`,
      `Ricevuta: ${record.createdAt}`,
      `Da cancellare entro: ${record.expiresAt}`,
      '',
      'Il CV non è allegato e questa email non contiene dati del candidato.',
      "Per consultarla accedi con l'account aziendale autorizzato alla console Google Cloud:",
      `bucket ${config.bucket}, cartella ${folder}`,
      `${consoleUrl} (richiede autenticazione)`,
      '',
      "Non copiare né inoltrare il CV fuori dall'archivio riservato.",
    ].join('\n'),
  };
}

async function setState(store, path, metadata, metageneration) {
  try {
    await store.updateMetadata(path, metadata, { ifMetagenerationMatch: metageneration });
    return true;
  } catch (error) {
    if (isPreconditionFailed(error)) return false;
    throw error;
  }
}

/**
 * Durable, lease-protected notification shared by the API (first attempt) and
 * the maintenance job (retries). State lives in application.json metadata:
 * notificationStatus pending|sending|sent|reconcile|failed, a lease, the attempt
 * count, the idempotency epoch and the first unresolved ambiguous attempt.
 * Returns the resulting state, or why nothing was attempted.
 */
export async function notifyApplication({ store, config, id, now = Date.now, timeoutMs, send = sendWithResend, log = () => {} }) {
  if (!notificationsConfigured(config)) return 'unconfigured';
  const path = applicationPaths(id).record;
  const meta = await store.getMetadata(path);
  if (!meta) return 'missing';
  const state = meta.metadata;
  const status = state.notificationStatus;
  const startedAt = now();
  if (status === 'sent' || status === 'reconcile' || status === 'failed') return status;
  if (!(Date.parse(state.expiresAt) > startedAt)) return 'expired';
  if (status === 'sending' && Date.parse(state.notificationLeaseUntil) > startedAt) return 'leased';

  // A lapsed 'sending' lease means a crash mid-request: delivery is unknown.
  const ambiguousSince = state.notificationAmbiguousSince || (status === 'sending' ? state.notificationLastAttemptAt : '') || '';
  if (ambiguousSince && startedAt - Date.parse(ambiguousSince) > RECONCILE_AFTER_MS) {
    await setState(store, path, { notificationStatus: 'reconcile', notificationLeaseUntil: null, notificationAmbiguousSince: ambiguousSince }, meta.metageneration);
    log('WARNING', 'notification_needs_reconciliation', { applicationId: id });
    return 'reconcile';
  }
  const attempts = Number(state.notificationAttempts) || 0;
  if (attempts >= MAX_ATTEMPTS) {
    await setState(store, path, { notificationStatus: 'failed', notificationLeaseUntil: null }, meta.metageneration);
    log('WARNING', 'notification_failed_permanently', { applicationId: id, attempts });
    return 'failed';
  }

  const record = JSON.parse((await store.read(path)).toString('utf8'));
  const payload = buildNotification(record, config);
  const epoch = Number(state.notificationEpoch) || 0;

  let leased;
  try {
    leased = await store.updateMetadata(path, {
      notificationStatus: 'sending',
      notificationLeaseUntil: iso(startedAt + LEASE_MS),
      notificationLastAttemptAt: iso(startedAt),
      notificationAttempts: String(attempts + 1),
      notificationAmbiguousSince: ambiguousSince || null,
    }, { ifMetagenerationMatch: meta.metageneration });
  } catch (error) {
    if (isPreconditionFailed(error)) return 'leased';
    throw error;
  }

  const result = await send({ apiKey: config.resendApiKey, payload, idempotencyKey: `stele-hiring/${id}/${epoch}`, timeoutMs: Math.min(timeoutMs, LEASE_MS / 2) });
  let update;
  if (result.outcome === 'sent') {
    update = { notificationStatus: 'sent', notificationSentAt: iso(now()), notificationProviderId: result.id, notificationLeaseUntil: null, notificationAmbiguousSince: null, notificationLastError: null };
  } else if (result.outcome === 'conflict') {
    update = { notificationStatus: 'reconcile', notificationLeaseUntil: null, notificationLastError: result.reason };
  } else if (result.outcome === 'rejected') {
    // Nothing was sent with this key. A fresh key avoids a cached error response,
    // unless an earlier attempt with the current key is still unresolved.
    update = { notificationStatus: 'pending', notificationLeaseUntil: null, notificationLastError: result.reason, ...(ambiguousSince ? {} : { notificationEpoch: String(epoch + 1) }) };
  } else {
    update = { notificationStatus: 'pending', notificationLeaseUntil: null, notificationLastError: result.reason, notificationAmbiguousSince: ambiguousSince || iso(startedAt) };
  }

  const saved = await setState(store, path, update, leased.metageneration);
  // 'sent' is terminal and true: record it even if the lease was disturbed.
  if (!saved && result.outcome === 'sent') await store.updateMetadata(path, update);
  const final = update.notificationStatus;
  log(final === 'sent' ? 'INFO' : 'WARNING', 'notification_attempt', { applicationId: id, outcome: result.outcome, reason: result.reason, attempt: attempts + 1 });
  return final;
}
