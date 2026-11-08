import { notificationsConfigured, readConfig } from './config.mjs';
import { runMaintenance } from './lifecycle.mjs';
import { log } from './log.mjs';
import { sendWithResend } from './notifications.mjs';
import { createGcsStore } from './store.mjs';

// Private Cloud Run Job, hourly via Cloud Scheduler. Never expose it publicly.
// Runs with `node maintenance.mjs`: no HTTP server and no ClamAV update.
// Deletion of expired data continues even when the form is closed.
const config = readConfig();
if (!config.bucket) {
  log('ERROR', 'maintenance_misconfigured', { missingConfig: ['CV_BUCKET'] });
  process.exit(1);
}
if (!notificationsConfigured(config)) log('WARNING', 'notifications_unconfigured');
const summary = await runMaintenance({ store: createGcsStore(config.bucket), config, send: sendWithResend, log });
const attention = summary.notificationPending > 0 || summary.notificationReconcile > 0;
log(summary.errors ? 'ERROR' : attention ? 'WARNING' : 'INFO', 'maintenance_summary', summary);
process.exitCode = summary.errors ? 1 : 0;
