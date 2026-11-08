import { createHash } from 'node:crypto';
import { isNotFound, isPreconditionFailed } from './store.mjs';
import { futureExpiry } from './validation.mjs';

export const ROLE_ID = 'legal-product-specialist';
export const ROLE_TITLE = 'Legal Product Specialist';
export const JOB_VERSION = 'provisional-v2';
export const APPLICATIONS_PREFIX = 'applications/';
export const QUOTA_PREFIX = 'quota/';
const DAY_MS = 86_400_000;
const CAS_ATTEMPTS = 8;

const sha256 = (...parts) => {
  const hash = createHash('sha256');
  for (const part of parts) hash.update(part);
  return hash.digest('hex');
};

// Opaque reference: paths never contain candidate names or emails.
export const applicationIdFor = idempotencyKey => sha256(idempotencyKey);
export const applicationPaths = id => ({ cv: `${APPLICATIONS_PREFIX}${id}/cv.pdf`, record: `${APPLICATIONS_PREFIX}${id}/application.json` });

// Quota days follow the recruiters' calendar, not UTC.
const romeDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' });
export const quotaDay = now => romeDate.format(new Date(now));
export const quotaPath = day => `${QUOTA_PREFIX}${day}.json`;

export function expiryFor(fields, now, currentRetentionDays) {
  const current = new Date(now + currentRetentionDays * DAY_MS);
  if (fields.futureConsent !== 'true') return current;
  // Future consent extends retention to 24 months; it never shortens the current selection.
  return new Date(Math.max(current.getTime(), futureExpiry(now).getTime()));
}

// The daily counter lives in custom metadata of quota/<day>.json and changes only
// with a metageneration precondition. The object is created on first use, so the
// API never needs to read objects that might not exist.
async function quotaState(store, day) {
  const name = quotaPath(day);
  try {
    await store.create(name, '{}', { contentType: 'application/json', metadata: { count: '0' } });
  } catch (error) {
    if (!isPreconditionFailed(error)) throw error;
  }
  const meta = await store.getMetadata(name);
  if (!meta) throw Object.assign(new Error('quota object vanished'), { code: 'quota_missing' });
  return { meta, count: Number(meta.metadata.count) || 0 };
}

export async function quotaAvailable(store, day, max) {
  return (await quotaState(store, day)).count < max;
}

async function changeQuota(store, day, compute) {
  for (let attempt = 0; attempt < CAS_ATTEMPTS; attempt++) {
    const { meta, count } = await quotaState(store, day);
    const next = compute(count);
    if (next === null) return false;
    try {
      await store.updateMetadata(meta.name, { count: String(next) }, { ifMetagenerationMatch: meta.metageneration });
      return true;
    } catch (error) {
      if (!isPreconditionFailed(error) && !isNotFound(error)) throw error;
    }
  }
  throw Object.assign(new Error('quota contention'), { code: 'quota_contention' });
}

export const reserveQuota = (store, day, max) => changeQuota(store, day, count => (count >= max ? null : count + 1));
const releaseQuota = (store, day) => changeQuota(store, day, count => Math.max(0, count - 1)).catch(() => false);

// Create cv.pdf once. A retry with the same key and content reuses an orphan left
// by an earlier failed attempt and refreshes lastAttemptAt: the metageneration
// change makes a concurrent orphan cleanup fail its precondition.
async function persistCv(store, path, pdf, submissionDigest, pdfSha256, nowIso) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const created = await store.create(path, pdf, {
        contentType: 'application/pdf',
        contentDisposition: 'attachment; filename="cv.pdf"',
        metadata: { submissionDigest, sha256: pdfSha256 },
      });
      return { cv: created, existed: false };
    } catch (error) {
      if (!isPreconditionFailed(error)) throw error;
    }
    const existing = await store.getMetadata(path);
    if (!existing) continue;
    if (existing.metadata.submissionDigest !== submissionDigest) return { conflict: true };
    try {
      const touched = await store.updateMetadata(path, { lastAttemptAt: nowIso }, { ifMetagenerationMatch: existing.metageneration });
      return { cv: touched, existed: true };
    } catch (error) {
      if (!isPreconditionFailed(error) && !isNotFound(error)) throw error;
    }
  }
  throw Object.assign(new Error('cv contention'), { code: 'cv_contention' });
}

const replayResult = (record, id, submissionDigest) =>
  record.metadata.submissionDigest === submissionDigest ? { status: 200, applicationId: id } : { status: 409 };

/**
 * Persist an application. application.json is the commit point: success is
 * reported only after both objects exist. Returns { status, applicationId }:
 * 201 new, 200 identical retry, 409 same key with different content, 429 daily limit.
 */
export async function commitApplication({ store, config, now, idempotencyKey, fields, pdf }) {
  const id = applicationIdFor(idempotencyKey);
  const paths = applicationPaths(id);
  const pdfSha256 = sha256(pdf);
  const submissionDigest = sha256(JSON.stringify(fields), pdf);
  const nowIso = new Date(now).toISOString();

  const persisted = await persistCv(store, paths.cv, pdf, submissionDigest, pdfSha256, nowIso);
  if (persisted.conflict) return { status: 409 };
  if (persisted.existed) {
    // Possibly a retry of a committed application: answer without consuming quota.
    // Any read error falls through to the conditional create below, which is authoritative.
    const record = await store.getMetadata(paths.record).catch(() => null);
    if (record) return replayResult(record, id, submissionDigest);
  }

  const day = quotaDay(now);
  if (!(await reserveQuota(store, day, config.maxApplicationsPerDay))) return { status: 429 };

  const futureConsent = fields.futureConsent === 'true';
  const expiresAt = expiryFor(fields, now, config.currentRetentionDays).toISOString();
  const record = {
    schemaVersion: 1,
    applicationId: id,
    roleId: ROLE_ID,
    jobVersion: JOB_VERSION,
    createdAt: nowIso,
    expiresAt,
    retention: { currentRetentionDays: config.currentRetentionDays, futureConsentMonths: futureConsent ? 24 : 0 },
    candidate: { name: fields.name, email: fields.email, linkedin: fields.linkedin, motivation: fields.motivation, locale: fields.locale },
    consents: { privacyAcknowledged: true, privacyVersion: fields.privacyVersion, futureConsent, futureConsentAt: futureConsent ? nowIso : null },
    cv: { object: paths.cv, generation: persisted.cv.generation, sha256: pdfSha256, bytes: pdf.length, contentType: 'application/pdf' },
    submissionDigest,
  };
  try {
    await store.create(paths.record, JSON.stringify(record, null, 2), {
      contentType: 'application/json',
      // Mutable notification state lives in metadata; the JSON content is immutable.
      metadata: { submissionDigest, expiresAt, notificationStatus: 'pending', notificationAttempts: '0', notificationEpoch: '0' },
    });
  } catch (error) {
    // Other errors may hide a completed write: keep the reservation (over-counting is safe).
    if (!isPreconditionFailed(error)) throw error;
    await releaseQuota(store, day);
    const existing = await store.getMetadata(paths.record);
    if (!existing) throw Object.assign(new Error('record vanished'), { code: 'record_missing' });
    return replayResult(existing, id, submissionDigest);
  }
  return { status: 201, applicationId: id };
}
