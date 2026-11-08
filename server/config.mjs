// Runtime configuration. Cloud Run fixes env vars per revision, so it is read once.
const positiveInt = value => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
};

export function readConfig(env = process.env) {
  return {
    project: env.GOOGLE_CLOUD_PROJECT || '',
    bucket: env.CV_BUCKET || '',
    allowedOrigin: env.ALLOWED_ORIGIN || '',
    hiringEnabled: env.HIRING_ENABLED === 'true',
    legalApproved: env.LEGAL_APPROVED === 'true',
    currentRetentionDays: positiveInt(env.CURRENT_RETENTION_DAYS),
    // Unparseable deadlines become NaN and keep the form closed.
    deadline: env.DEADLINE ? Date.parse(env.DEADLINE) : null,
    resendApiKey: env.RESEND_API_KEY || '',
    notificationFrom: env.NOTIFICATION_FROM || '',
    notificationTo: env.NOTIFICATION_TO || '',
    maxApplicationsPerDay: positiveInt(env.MAX_APPLICATIONS_PER_DAY),
  };
}

export const notificationsConfigured = config => Boolean(config.resendApiKey && config.notificationFrom && config.notificationTo);

// Names only, never values: safe to log at startup. Resend is optional: without it
// applications are still accepted and notifications stay pending for the job.
export function missingConfig(config) {
  const required = {
    HIRING_ENABLED: config.hiringEnabled,
    LEGAL_APPROVED: config.legalApproved,
    CV_BUCKET: config.bucket,
    ALLOWED_ORIGIN: config.allowedOrigin,
    CURRENT_RETENTION_DAYS: config.currentRetentionDays,
    MAX_APPLICATIONS_PER_DAY: config.maxApplicationsPerDay,
  };
  return Object.entries(required).filter(([, value]) => !value).map(([name]) => name);
}

export const acceptingConfigured = config => missingConfig(config).length === 0;

export function deadlinePassed(config, now) {
  return config.deadline !== null && !(now < config.deadline);
}

export const isOpen = (config, now) => acceptingConfigured(config) && !deadlinePassed(config, now);
