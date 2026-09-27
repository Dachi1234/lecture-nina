import type { Readable } from "node:stream";

export type StorageObject = {
  stream: Readable;
  size: number;
  contentType: string;
};

export interface StorageDriver {
  put(key: string, stream: Readable, opts: { contentType: string }): Promise<{ size: number; checksum: string }>;
  get(key: string, range?: { start: number; end?: number }): Promise<StorageObject>;
  head(key: string): Promise<{ size: number; contentType: string } | null>;
  delete(key: string): Promise<void>;
}
