import { createApp } from './app.mjs';
import { isOpen, missingConfig, notificationsConfigured, readConfig } from './config.mjs';
import { log } from './log.mjs';
import { sendWithResend } from './notifications.mjs';
import { clamscan } from './scanner.mjs';
import { createGcsStore } from './store.mjs';

const config = readConfig();
const store = config.bucket ? createGcsStore(config.bucket) : null;
const app = createApp({ config, store, scan: clamscan, send: sendWithResend, log });
app.listen(process.env.PORT || 8080, () => {
  log('INFO', 'startup', { open: isOpen(config, Date.now()), missingConfig: missingConfig(config), notificationsConfigured: notificationsConfigured(config) });
});
