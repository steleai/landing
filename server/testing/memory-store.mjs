// In-memory object store with GCS precondition semantics, for tests only.
const failure = code => Object.assign(new Error(`HTTP ${code}`), { code });

export class MemoryStore {
  constructor({ now = () => Date.now() } = {}) {
    this.now = now;
    this.objects = new Map();
    this.nextGeneration = 1;
    this.hooks = {};
  }

  view(object) {
    return { name: object.name, generation: String(object.generation), metageneration: String(object.metageneration), timeCreated: object.timeCreated, size: object.data.length, metadata: { ...object.metadata } };
  }

  async create(name, data, { contentType, metadata = {} } = {}) {
    await this.hooks.create?.(name);
    if (this.objects.has(name)) throw failure(412);
    const object = { name, data: Buffer.from(data), contentType, metadata: { ...metadata }, generation: this.nextGeneration++, metageneration: 1, timeCreated: new Date(this.now()).toISOString() };
    this.objects.set(name, object);
    return this.view(object);
  }

  async getMetadata(name) {
    const object = this.objects.get(name);
    return object ? this.view(object) : null;
  }

  async updateMetadata(name, metadata, { ifMetagenerationMatch } = {}) {
    await this.hooks.updateMetadata?.(name, metadata);
    const object = this.objects.get(name);
    if (!object) throw failure(404);
    if (ifMetagenerationMatch !== undefined && String(ifMetagenerationMatch) !== String(object.metageneration)) throw failure(412);
    for (const [key, value] of Object.entries(metadata)) {
      if (value === null) delete object.metadata[key];
      else object.metadata[key] = String(value);
    }
    object.metageneration++;
    return this.view(object);
  }

  async read(name) {
    const object = this.objects.get(name);
    if (!object) throw failure(404);
    return Buffer.from(object.data);
  }

  async delete(name, { ifGenerationMatch, ifMetagenerationMatch } = {}) {
    await this.hooks.delete?.(name);
    const object = this.objects.get(name);
    if (!object) return false;
    if (ifGenerationMatch !== undefined && String(ifGenerationMatch) !== String(object.generation)) throw failure(412);
    if (ifMetagenerationMatch !== undefined && String(ifMetagenerationMatch) !== String(object.metageneration)) throw failure(412);
    this.objects.delete(name);
    return true;
  }

  async *list(prefix) {
    const names = [...this.objects.keys()].filter(name => name.startsWith(prefix)).sort();
    for (const name of names) {
      const object = this.objects.get(name);
      if (object) yield this.view(object);
    }
  }

  json(name) {
    return JSON.parse(this.objects.get(name).data.toString('utf8'));
  }
}

export const baseConfig = {
  project: 'test-project',
  bucket: 'test-bucket',
  allowedOrigin: 'https://stele.it.com',
  hiringEnabled: true,
  legalApproved: true,
  currentRetentionDays: 90,
  deadline: null,
  resendApiKey: 're_test',
  notificationFrom: 'Stele Careers <noreply@example.test>',
  notificationTo: 'info@stele.it.com',
  maxApplicationsPerDay: 3,
};

export const fields = {
  name: 'Mario Rossi',
  email: 'mario.rossi@example.com',
  linkedin: '',
  motivation: 'Motivazione di prova',
  locale: 'it',
  privacyAcknowledged: 'true',
  privacyVersion: 'candidate-privacy-v1',
  futureConsent: 'false',
};

// Records every send and answers with scripted outcomes (default: sent).
export function fakeSender(outcomes = []) {
  const calls = [];
  const send = async request => {
    calls.push(request);
    const next = outcomes.shift() ?? { outcome: 'sent', id: `email-${calls.length}` };
    if (next instanceof Error) throw next;
    return next;
  };
  return { send, calls };
}
