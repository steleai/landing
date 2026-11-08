// Structured Cloud Logging lines. Callers must never pass names, emails, IPs,
// CV contents or secrets: application ids are opaque references.
export function log(severity, message, fields = {}) {
  const line = `${JSON.stringify({ severity, message, ...fields })}\n`;
  (severity === 'ERROR' || severity === 'WARNING' ? process.stderr : process.stdout).write(line);
}

export const errorCode = error => String(error?.code ?? error?.name ?? 'unknown');
