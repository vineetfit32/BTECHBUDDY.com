import { Readable } from "node:stream";
import { getStorage, isSafeKey } from "@/lib/storage";

const INLINE_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/vnd.apple.mpegurl",
  "video/mp2t",
  "video/iso.segment",
  "text/vtt",
]);

function parseRange(header: string | null, size: number): { start: number; end: number } | null | "invalid" {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return "invalid";
  let start: number;
  let end: number;
  if (match[1] === "") {
    const suffix = Number(match[2]);
    if (!suffix) return "invalid";
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === "" ? size - 1 : Math.min(Number(match[2]), size - 1);
  }
  if (start > end || start >= size) return "invalid";
  return { start, end };
}

async function serve(req: Request, params: Promise<{ key: string[] }>, headOnly: boolean) {
  const { key: parts } = await params;
  const key = parts.map(decodeURIComponent).join("/");
  if (!isSafeKey(key)) return new Response("Not found", { status: 404 });

  const storage = await getStorage();
  const stat = await storage.stat(key);
  if (!stat) return new Response("Not found", { status: 404 });

  const contentType = INLINE_TYPES.has(stat.contentType) ? stat.contentType : "application/octet-stream";
  const headers = new Headers({
    "Content-Type": contentType,
    "Accept-Ranges": "bytes",
    "Last-Modified": stat.lastModified.toUTCString(),
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": key.endsWith(".m3u8") ? "public, max-age=10" : "public, max-age=31536000, immutable",
  });
  if (stat.etag) headers.set("ETag", stat.etag);
  if (contentType === "application/octet-stream") headers.set("Content-Disposition", "attachment");

  if (stat.etag && req.headers.get("if-none-match") === stat.etag) {
    return new Response(null, { status: 304, headers });
  }

  const range = parseRange(req.headers.get("range"), stat.size);
  if (range === "invalid") {
    headers.set("Content-Range", `bytes */${stat.size}`);
    return new Response(null, { status: 416, headers });
  }

  const length = range ? range.end - range.start + 1 : stat.size;
  headers.set("Content-Length", String(length));
  if (range) headers.set("Content-Range", `bytes ${range.start}-${range.end}/${stat.size}`);

  if (headOnly) return new Response(null, { status: range ? 206 : 200, headers });

  const object = await storage.get(key, range ?? undefined);
  if (!object) return new Response("Not found", { status: 404 });

  return new Response(Readable.toWeb(object.body) as ReadableStream, { status: range ? 206 : 200, headers });
}

export async function GET(req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  return serve(req, params, false);
}

export async function HEAD(req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  return serve(req, params, true);
}
