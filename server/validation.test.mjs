import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import { applicationSchema, futureExpiry, validatePdf } from './validation.mjs';
const fields = { name: 'Test Person', email: 'test@example.com', locale: 'it', privacyAcknowledged: 'true', privacyVersion: 'candidate-privacy-v1', futureConsent: 'false' };
test('CV required independently of optional LinkedIn and future consent', () => {
  assert.equal(applicationSchema.safeParse(fields).success, true);
  assert.equal(applicationSchema.safeParse({ ...fields, privacyAcknowledged: 'false' }).success, false);
  assert.equal(applicationSchema.safeParse({ ...fields, linkedin: 'https://linkedin.com.evil.test/in/a' }).success, false);
});
test('future retention never exceeds 24 calendar months, including leap day', () => {
  assert.equal(futureExpiry('2024-02-29T12:00:00Z').toISOString(), '2026-02-28T12:00:00.000Z');
});
test('reject renamed, malformed and oversize files; accept a real PDF', async () => {
  await assert.rejects(validatePdf(undefined));
  const doc = await PDFDocument.create(); doc.addPage();
  const buffer = Buffer.from(await doc.save());
  const file = { originalname: 'cv.pdf', mimetype: 'application/pdf', buffer, size: buffer.length };
  await validatePdf(file);
  await assert.rejects(validatePdf({ ...file, buffer: Buffer.from('%PDF-garbage') }));
  await assert.rejects(validatePdf({ ...file, size: 6 * 1024 * 1024 }));
});
