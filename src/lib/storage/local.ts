import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { mimeFromKey } from "../file-type";
import type { StorageDriver } from "./types";

function root() {
  return path.resolve(process.env.STORAGE_DIR ?? path.join(process.cwd(), "storage"));
}

function resolveKey(key: string) {
  const base = root();
  const full = path.resolve(base, key);
  if (!full.startsWith(base + path.sep)) throw new Error("Invalid storage key");
  return full;
}

async function writeMeta(full: string, contentType: string) {
  await fsp.writeFile(`${full}.meta.json`, JSON.stringify({ contentType }));
}

async function readContentType(full: string, key: string) {
  try {
    const meta = JSON.parse(await fsp.readFile(`${full}.meta.json`, "utf8"));
    if (typeof meta.contentType === "string") return meta.contentType as string;
  } catch {}
  return mimeFromKey(key);
}

export const localDriver: StorageDriver = {
  name: "local",

  async put(key, body, contentType) {
    const full = resolveKey(key);
    await fsp.mkdir(path.dirname(full), { recursive: true });
    if (Buffer.isBuffer(body)) await fsp.writeFile(full, body);
    else await pipeline(body as Readable, fs.createWriteStream(full));
    await writeMeta(full, contentType);
  },

  async putFile(key, filePath, contentType) {
    const full = resolveKey(key);
    await fsp.mkdir(path.dirname(full), { recursive: true });
    if (path.resolve(filePath) !== full) await fsp.copyFile(filePath, full);
    await writeMeta(full, contentType);
  },

  async stat(key) {
    const full = resolveKey(key);
    try {
      const s = await fsp.stat(full);
      if (!s.isFile()) return null;
      return {
        size: s.size,
        contentType: await readContentType(full, key),
        lastModified: s.mtime,
        etag: `"${s.size.toString(16)}-${s.mtimeMs.toString(16)}"`,
      };
    } catch {
      return null;
    }
  },

  async get(key, range) {
    const stat = await this.stat(key);
    if (!stat) return null;
    const body = fs.createReadStream(resolveKey(key), range ? { start: range.start, end: range.end } : undefined);
    return { stat, body };
  },

  async delete(key) {
    const full = resolveKey(key);
    await fsp.rm(full, { force: true });
    await fsp.rm(`${full}.meta.json`, { force: true });
  },

  async deletePrefix(prefix) {
    await fsp.rm(resolveKey(prefix), { recursive: true, force: true });
  },

  localPath(key) {
    return resolveKey(key);
  },
};
