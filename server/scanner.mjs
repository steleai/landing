import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

export class InfectedFileError extends Error {}

// Fail closed: a missing scanner, stale definitions (>2 days) or a timeout reject
// the upload as unavailable; exit code 1 means a signature matched.
export async function clamscan(buffer) {
  const dir = await mkdtemp(join(tmpdir(), 'cv-'));
  try {
    const path = join(dir, 'cv.pdf');
    await writeFile(path, buffer);
    await promisify(execFile)('clamscan', ['--no-summary', '--fail-if-cvd-older-than=2', path], { timeout: 60_000 });
  } catch (error) {
    if (error?.code === 1) throw new InfectedFileError('infected');
    throw error;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
