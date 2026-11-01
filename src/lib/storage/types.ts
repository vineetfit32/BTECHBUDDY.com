import type { Readable } from "node:stream";

export interface ObjectStat {
  size: number;
  contentType: string;
  lastModified: Date;
  etag?: string;
}

export interface StoredObject {
  stat: ObjectStat;
  body: Readable;
}

export interface StorageDriver {
  name: "local" | "s3";
  put(key: string, body: Buffer | Readable, contentType: string, size?: number): Promise<void>;
  putFile(key: string, filePath: string, contentType: string): Promise<void>;
  stat(key: string): Promise<ObjectStat | null>;
  get(key: string, range?: { start: number; end: number }): Promise<StoredObject | null>;
  delete(key: string): Promise<void>;
  deletePrefix(prefix: string): Promise<void>;
  /** Absolute path when the object is on local disk (lets ffmpeg read it directly). */
  localPath?(key: string): string;
}
