import { Client } from "minio";
import type { Readable } from "node:stream";
import { mimeFromKey } from "../file-type";
import type { StorageDriver } from "./types";

export function createS3Driver(): StorageDriver {
  const endpoint = new URL(process.env.S3_ENDPOINT ?? "http://localhost:9000");
  const bucket = process.env.S3_BUCKET ?? "btechbuddy";
  const client = new Client({
    endPoint: endpoint.hostname,
    port: endpoint.port ? Number(endpoint.port) : endpoint.protocol === "https:" ? 443 : 80,
    useSSL: endpoint.protocol === "https:",
    accessKey: process.env.S3_ACCESS_KEY ?? "",
    secretKey: process.env.S3_SECRET_KEY ?? "",
    region: process.env.S3_REGION || "us-east-1",
  });

  let ensured: Promise<void> | null = null;
  const ensureBucket = () =>
    (ensured ??= (async () => {
      if (!(await client.bucketExists(bucket))) await client.makeBucket(bucket, process.env.S3_REGION || "us-east-1");
    })());

  return {
    name: "s3",

    async put(key, body, contentType, size) {
      await ensureBucket();
      await client.putObject(bucket, key, body as Buffer | Readable, size, { "Content-Type": contentType });
    },

    async putFile(key, filePath, contentType) {
      await ensureBucket();
      await client.fPutObject(bucket, key, filePath, { "Content-Type": contentType });
    },

    async stat(key) {
      await ensureBucket();
      try {
        const s = await client.statObject(bucket, key);
        const meta = s.metaData as Record<string, string>;
        return {
          size: s.size,
          contentType: meta["content-type"] ?? mimeFromKey(key),
          lastModified: s.lastModified,
          etag: `"${s.etag}"`,
        };
      } catch {
        return null;
      }
    },

    async get(key, range) {
      const stat = await this.stat(key);
      if (!stat) return null;
      const body = range
        ? await client.getPartialObject(bucket, key, range.start, range.end - range.start + 1)
        : await client.getObject(bucket, key);
      return { stat, body };
    },

    async delete(key) {
      await ensureBucket();
      await client.removeObject(bucket, key);
    },

    async deletePrefix(prefix) {
      await ensureBucket();
      const names: string[] = [];
      const stream = client.listObjectsV2(bucket, prefix.endsWith("/") ? prefix : `${prefix}/`, true);
      for await (const item of stream as AsyncIterable<{ name?: string }>) {
        if (item.name) names.push(item.name);
      }
      if (names.length) await client.removeObjects(bucket, names);
    },
  };
}
