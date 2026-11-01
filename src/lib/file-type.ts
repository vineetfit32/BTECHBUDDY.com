export interface DetectedFileType {
  mime: string;
  ext: string;
  kind: "PDF" | "IMAGE" | "VIDEO";
}

function startsWith(bytes: Uint8Array, signature: number[], offset = 0) {
  if (bytes.length < offset + signature.length) return false;
  return signature.every((b, i) => bytes[offset + i] === b);
}

function ascii(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.subarray(start, end));
}

/** Identifies a file from its leading bytes, ignoring the client-supplied name and MIME type. */
export function detectFileType(bytes: Uint8Array): DetectedFileType | null {
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return { mime: "application/pdf", ext: ".pdf", kind: "PDF" };
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: "image/png", ext: ".png", kind: "IMAGE" };
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { mime: "image/jpeg", ext: ".jpg", kind: "IMAGE" };
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") {
    return { mime: "image/webp", ext: ".webp", kind: "IMAGE" };
  }
  if (bytes.length >= 12 && ascii(bytes, 4, 8) === "ftyp") {
    const brand = ascii(bytes, 8, 12);
    if (brand.startsWith("qt")) return { mime: "video/quicktime", ext: ".mov", kind: "VIDEO" };
    return { mime: "video/mp4", ext: ".mp4", kind: "VIDEO" };
  }
  if (startsWith(bytes, [0x1a, 0x45, 0xdf, 0xa3])) return { mime: "video/webm", ext: ".webm", kind: "VIDEO" };
  return null;
}

const MIME_BY_EXT: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
  ".m3u8": "application/vnd.apple.mpegurl",
  ".ts": "video/mp2t",
  ".m4s": "video/iso.segment",
  ".vtt": "text/vtt",
  ".json": "application/json",
};

export function mimeFromKey(key: string): string {
  const dot = key.lastIndexOf(".");
  if (dot === -1) return "application/octet-stream";
  return MIME_BY_EXT[key.slice(dot).toLowerCase()] ?? "application/octet-stream";
}
