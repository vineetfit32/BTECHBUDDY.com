import { beforeEach, describe, expect, it } from "vitest";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { validatePassword } from "@/lib/password-policy";
import { detectFileType, mimeFromKey } from "@/lib/file-type";
import { isSafeKey, fileUrl } from "@/lib/storage";
import { createResetToken, hashResetToken } from "@/lib/reset-token";

describe("rateLimit", () => {
  beforeEach(() => resetRateLimit());

  it("allows up to the limit inside the window, then blocks", () => {
    const opts = { limit: 3, windowMs: 1000 };
    const t = 1_000_000;
    expect(rateLimit("k", opts, t).ok).toBe(true);
    expect(rateLimit("k", opts, t + 1).ok).toBe(true);
    expect(rateLimit("k", opts, t + 2).remaining).toBe(0);
    const blocked = rateLimit("k", opts, t + 3);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("frees capacity once old hits slide out of the window", () => {
    const opts = { limit: 1, windowMs: 1000 };
    expect(rateLimit("slide", opts, 0).ok).toBe(true);
    expect(rateLimit("slide", opts, 500).ok).toBe(false);
    expect(rateLimit("slide", opts, 1001).ok).toBe(true);
  });

  it("keeps buckets independent", () => {
    const opts = { limit: 1, windowMs: 1000 };
    expect(rateLimit("a", opts, 0).ok).toBe(true);
    expect(rateLimit("b", opts, 0).ok).toBe(true);
  });
});

describe("validatePassword", () => {
  it("rejects short, letter-only, digit-only and common passwords", () => {
    expect(validatePassword("ab1")).toMatch(/8 characters/);
    expect(validatePassword("abcdefghij")).toMatch(/number/);
    expect(validatePassword("1234567890")).toMatch(/letter/);
    expect(validatePassword("Password123")).toMatch(/too common/);
  });

  it("accepts a reasonable password", () => {
    expect(validatePassword("deadlock-coffman-4")).toBeNull();
  });
});

describe("detectFileType", () => {
  const bytes = (...values: number[]) => new Uint8Array(values);
  const ascii = (s: string) => new TextEncoder().encode(s);

  it("identifies files from magic bytes", () => {
    expect(detectFileType(ascii("%PDF-1.7 rest"))?.ext).toBe(".pdf");
    expect(detectFileType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))?.mime).toBe("image/png");
    expect(detectFileType(bytes(0xff, 0xd8, 0xff, 0xe0))?.ext).toBe(".jpg");
    expect(detectFileType(ascii("RIFF\0\0\0\0WEBPVP8 "))?.mime).toBe("image/webp");
    expect(detectFileType(ascii("\0\0\0\x18ftypisom"))?.kind).toBe("VIDEO");
  });

  it("rejects HTML and SVG disguised as images", () => {
    expect(detectFileType(ascii("<html><script>alert(1)</script>"))).toBeNull();
    expect(detectFileType(ascii('<svg xmlns="http://www.w3.org/2000/svg">'))).toBeNull();
  });

  it("maps HLS keys to the right content types", () => {
    expect(mimeFromKey("videos/a/hls/master.m3u8")).toBe("application/vnd.apple.mpegurl");
    expect(mimeFromKey("videos/a/hls/720/seg_001.ts")).toBe("video/mp2t");
    expect(mimeFromKey("weird.exe")).toBe("application/octet-stream");
  });
});

describe("storage keys", () => {
  it("rejects traversal and absolute keys", () => {
    expect(isSafeKey("uploads/2026/11/a.pdf")).toBe(true);
    expect(isSafeKey("../etc/passwd")).toBe(false);
    expect(isSafeKey("uploads/../../secret")).toBe(false);
    expect(isSafeKey("/abs/path")).toBe(false);
    expect(isSafeKey("uploads\\win")).toBe(false);
    expect(isSafeKey("")).toBe(false);
  });

  it("builds encoded public URLs", () => {
    expect(fileUrl("uploads/2026/a b.pdf")).toBe("/api/files/uploads/2026/a%20b.pdf");
  });
});

describe("reset tokens", () => {
  it("stores only a hash and verifies by re-hashing", () => {
    const { token, tokenHash } = createResetToken();
    expect(token.length).toBeGreaterThanOrEqual(40);
    expect(tokenHash).not.toContain(token);
    expect(hashResetToken(token)).toBe(tokenHash);
  });
});
