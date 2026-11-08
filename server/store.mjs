import { Storage } from '@google-cloud/storage';

// Minimal object-store contract shared by the GCS adapter and the test fake.
// Every mutation is conditional so API and maintenance can coordinate without
// a database: create only if absent, update/delete only at a known
// (meta)generation. The IAM roles grant no content overwrite.
export const isPreconditionFailed = error => error?.code === 412;
export const isNotFound = error => error?.code === 404;

const toMeta = metadata => ({
  name: metadata.name,
  generation: String(metadata.generation),
  metageneration: String(metadata.metageneration),
  timeCreated: metadata.timeCreated,
  size: Number(metadata.size),
  metadata: { ...(metadata.metadata || {}) },
});

export function createGcsStore(bucketName, storage = new Storage()) {
  const bucket = storage.bucket(bucketName);
  return {
    async create(name, data, { contentType, contentDisposition, metadata = {} } = {}) {
      const file = bucket.file(name);
      await file.save(data, {
        resumable: false,
        preconditionOpts: { ifGenerationMatch: 0 },
        metadata: { contentType, cacheControl: 'no-store', ...(contentDisposition && { contentDisposition }), metadata },
      });
      if (file.metadata?.generation) return toMeta(file.metadata);
      const [metadataAfter] = await file.getMetadata();
      return toMeta(metadataAfter);
    },
    async getMetadata(name) {
      try {
        const [metadata] = await bucket.file(name).getMetadata();
        return toMeta(metadata);
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
    },
    // A null value removes that custom metadata key.
    async updateMetadata(name, metadata, { ifMetagenerationMatch } = {}) {
      const options = ifMetagenerationMatch === undefined ? {} : { ifMetagenerationMatch };
      const [updated] = await bucket.file(name).setMetadata({ metadata }, options);
      return toMeta(updated);
    },
    async read(name) {
      const [buffer] = await bucket.file(name).download();
      return buffer;
    },
    async delete(name, preconditions = {}) {
      try {
        await bucket.file(name).delete(preconditions);
        return true;
      } catch (error) {
        if (isNotFound(error)) return false;
        throw error;
      }
    },
    async *list(prefix) {
      let pageToken;
      do {
        const [files, next] = await bucket.getFiles({ prefix, autoPaginate: false, maxResults: 500, pageToken });
        for (const file of files) yield toMeta(file.metadata);
        pageToken = next?.pageToken;
      } while (pageToken);
    },
  };
}
