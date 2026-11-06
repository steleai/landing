import { Firestore, Timestamp } from '@google-cloud/firestore';
import { Storage } from '@google-cloud/storage';
import nodemailer from 'nodemailer';

// Run as a private, non-overlapping Cloud Run Job, every hour. Never expose this as a public API.
const db = new Firestore();
const bucket = new Storage().bucket(process.env.CV_BUCKET);
const now = Timestamp.now();
const expired = await db.collection('applications').where('expiresAt', '<=', now).get();
for (const doc of expired.docs) {
  await bucket.file(doc.data().objectPath).delete({ ignoreNotFound: true });
  await doc.ref.delete();
}
if (process.env.SMTP_HOST) {
  const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 465), secure: process.env.SMTP_PORT !== '587', requireTLS: true, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } });
  const pending = await db.collection('applications').where('notification', '==', 'pending').get();
  for (const doc of pending.docs) {
    if (doc.data().expiresAt.toMillis() <= Date.now()) continue;
    await transport.sendMail({ from: process.env.NOTIFICATION_FROM, to: 'info@stele.it.com', subject: 'Stele: nuova candidatura Legal Product Specialist', text: `Nuova candidatura ricevuta. Riferimento: ${doc.id}\nAccedere all'archivio riservato Google Cloud con l'account aziendale. Nessun CV è allegato.`, messageId: `<hiring-${doc.id}@stele.it.com>` });
    await doc.ref.update({ notification: 'sent', notifiedAt: Timestamp.now() });
  }
}
// Clean orphan CVs left by a failed metadata write; allow 24 hours for retries.
for await (const file of bucket.getFilesStream({ prefix: 'applications/' })) {
  const [, id] = file.name.split('/');
  const age = Date.now() - Date.parse(file.metadata.timeCreated);
  if (age > 86400000 && !(await db.collection('applications').doc(id).get()).exists) await file.delete({ ignoreNotFound: true });
}
