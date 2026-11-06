import { z } from 'zod';
import { PDFDocument } from 'pdf-lib';
export const MAX_CV_BYTES = 5 * 1024 * 1024;
export const applicationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  linkedin: z.union([z.literal(''), z.string().url().max(500).refine(value => {
    const url = new URL(value);
    return url.protocol === 'https:' && ['linkedin.com', 'www.linkedin.com'].includes(url.hostname) && !url.username && !url.password;
  })]).default(''),
  motivation: z.string().trim().max(2000).default(''),
  locale: z.enum(['it', 'en']), privacyAcknowledged: z.literal('true'),
  privacyVersion: z.literal('candidate-privacy-v1'), futureConsent: z.enum(['true', 'false']),
}).strict();
export function futureExpiry(now) {
  const date = new Date(now);
  const day = date.getUTCDate();
  date.setUTCDate(1); date.setUTCMonth(date.getUTCMonth() + 24);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date;
}
export async function validatePdf(file) {
  if (!file || file.size === 0 || file.size > MAX_CV_BYTES || file.mimetype !== 'application/pdf' || !file.originalname.toLowerCase().endsWith('.pdf') || file.buffer.subarray(0, 5).toString() !== '%PDF-') throw new Error('invalid_pdf');
  const doc = await PDFDocument.load(file.buffer, { updateMetadata: false });
  if (doc.isEncrypted || !doc.getPageCount()) throw new Error('invalid_pdf');
}
