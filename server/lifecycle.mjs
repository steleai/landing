import { APPLICATIONS_PREFIX, QUOTA_PREFIX, quotaDay } from './applications.mjs';
import { errorCode } from './log.mjs';
import { notifyApplication } from './notifications.mjs';
import { isPreconditionFailed } from './store.mjs';

export const ORPHAN_GRACE_MS = 86_400_000;
const OBJECT_PATTERN = /^applications\/([0-9a-f]{64})\/(cv\.pdf|application\.json)$/;
const QUOTA_PATTERN = /^quota\/(\d{4}-\d{2}-\d{2})\.json$/;

async function expiryOf(store, record) {
  const fromMetadata = Date.parse(record.metadata.expiresAt);
  if (Number.isFinite(fromMetadata)) return fromMetadata;
  const content = JSON.parse((await store.read(record.name)).toString('utf8'));
  return Date.parse(content.expiresAt);
}

/**
 * Hourly private job. Safe to overlap with the API and with itself: deletions
 * are idempotent, orphan cleanup is conditional on the metageneration seen when
 * listing, and notifications take a per-application lease.
 */
export async function runMaintenance({ store, config, now = Date.now, send, log = () => {}, timeoutMs = 15_000 }) {
  const summary = { applications: 0, expiredDeleted: 0, notified: 0, notificationPending: 0, notificationReconcile: 0, orphansDeleted: 0, quotaDeleted: 0, unknownObjects: 0, errors: 0 };
  const groups = new Map();
  for await (const object of store.list(APPLICATIONS_PREFIX)) {
    const match = OBJECT_PATTERN.exec(object.name);
    if (!match) { summary.unknownObjects++; continue; }
    const group = groups.get(match[1]) ?? {};
    group[match[2] === 'cv.pdf' ? 'cv' : 'record'] = object;
    groups.set(match[1], group);
  }

  for (const [id, { cv, record }] of groups) {
    try {
      if (record) {
        summary.applications++;
        const startedAt = now();
        const expiresAt = await expiryOf(store, record);
        if (!Number.isFinite(expiresAt)) throw Object.assign(new Error('missing expiry'), { code: 'missing_expiry' });
        if (expiresAt <= startedAt) {
          // PDF first: if the run stops here the record survives and the next run finishes.
          if (cv) await store.delete(cv.name);
          await store.delete(record.name);
          summary.expiredDeleted++;
          continue;
        }
        if (!cv) {
          summary.errors++;
          log('ERROR', 'application_without_cv', { applicationId: id });
        }
        const status = record.metadata.notificationStatus;
        if (status === 'sent') continue;
        if (status === 'reconcile' || status === 'failed') {
          summary.notificationReconcile++;
          log('WARNING', 'notification_requires_operator', { applicationId: id, status });
          continue;
        }
        const result = await notifyApplication({ store, config, id, now, send, log, timeoutMs });
        if (result === 'sent') summary.notified++;
        else if (result === 'reconcile' || result === 'failed') summary.notificationReconcile++;
        else if (result !== 'expired' && result !== 'missing') summary.notificationPending++;
      } else if (cv) {
        // Upload without commit: give retries 24 hours from the last attempt.
        const lastAttempt = Math.max(Date.parse(cv.timeCreated), Date.parse(cv.metadata.lastAttemptAt) || 0);
        if (now() - lastAttempt <= ORPHAN_GRACE_MS) continue;
        try {
          if (await store.delete(cv.name, { ifGenerationMatch: cv.generation, ifMetagenerationMatch: cv.metageneration })) summary.orphansDeleted++;
        } catch (error) {
          if (!isPreconditionFailed(error)) throw error; // touched by a retry after listing
        }
      }
    } catch (error) {
      summary.errors++;
      log('ERROR', 'maintenance_item_failed', { applicationId: id, error: errorCode(error) });
    }
  }

  const yesterday = quotaDay(now() - 86_400_000);
  for await (const object of store.list(QUOTA_PREFIX)) {
    const match = QUOTA_PATTERN.exec(object.name);
    if (!match) { summary.unknownObjects++; continue; }
    if (match[1] >= yesterday) continue;
    try {
      if (await store.delete(object.name, { ifGenerationMatch: object.generation })) summary.quotaDeleted++;
    } catch (error) {
      summary.errors++;
      log('ERROR', 'quota_cleanup_failed', { error: errorCode(error) });
    }
  }
  return summary;
}
