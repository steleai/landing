import { z } from 'zod';

// Contact form → one Resend email to NOTIFICATION_TO. Nothing is stored: the
// message lives only in the email. Reply-To is the sender, so "Reply" just works.
export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100).regex(/^[^\r\n]*$/),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(1).max(1000),
  locale: z.enum(['it', 'en']).default('it'),
  // Honeypot: hidden in the page, only bots fill it.
  website: z.string().max(200).default(''),
}).strict();

export function buildContactEmail(fields, config) {
  return {
    from: config.notificationFrom,
    to: [config.notificationTo],
    reply_to: fields.email,
    subject: `Stele: nuovo messaggio dal sito da ${fields.name}`,
    text: [
      'Nuovo messaggio dal form contatti di stele.it.com.',
      '',
      `Nome: ${fields.name}`,
      `Email: ${fields.email}`,
      `Lingua: ${fields.locale}`,
      '',
      fields.message,
      '',
      '— Rispondi a questa email per scrivere direttamente al mittente.',
    ].join('\n'),
  };
}

// Per-instance fixed-window limiter. Cloud Run may run several instances, so it
// bounds abuse rather than enforcing an exact quota. Keys are never logged.
export function createRateLimiter({ limit, windowMs, now = Date.now }) {
  const hits = new Map();
  return key => {
    const t = now();
    for (const [k, v] of hits) if (v.resetAt <= t) hits.delete(k);
    const entry = hits.get(key) ?? { count: 0, resetAt: t + windowMs };
    entry.count += 1;
    hits.set(key, entry);
    return entry.count <= limit;
  };
}

// Cloud Run appends the real client address as the last X-Forwarded-For entry;
// earlier entries are client-supplied and not trusted.
export function clientKey(req) {
  const forwarded = req.get('X-Forwarded-For');
  const last = forwarded?.split(',').pop()?.trim();
  return last || req.socket.remoteAddress || 'unknown';
}
