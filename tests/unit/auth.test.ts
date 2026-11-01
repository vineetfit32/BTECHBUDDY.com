import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

beforeAll(() => {
  process.env.JWT_SECRET = "x".repeat(48);
});

describe("auth tokens", () => {
  it("round-trips a signed session including the token version", async () => {
    const { signJWT, verifyJWT } = await import("@/lib/auth");
    const token = await signJWT({ id: "u1", email: "a@b.in", role: "STUDENT", name: "A", tv: 3 });
    const payload = await verifyJWT(token);
    expect(payload?.id).toBe("u1");
    expect(payload?.tv).toBe(3);
  });

  it("rejects tampered tokens", async () => {
    const { signJWT, verifyJWT } = await import("@/lib/auth");
    const token = await signJWT({ id: "u1", email: "a@b.in", role: "STUDENT", name: "A", tv: 0 });
    const [h, p, s] = token.split(".");
    const forged = JSON.parse(Buffer.from(p, "base64url").toString());
    forged.role = "SUPER_ADMIN";
    const tampered = [h, Buffer.from(JSON.stringify(forged)).toString("base64url"), s].join(".");
    expect(await verifyJWT(tampered)).toBeNull();
  });

  it("hashes and verifies passwords", async () => {
    const { hashPassword, verifyPassword } = await import("@/lib/auth");
    const hash = await hashPassword("deadlock-coffman-4");
    expect(await verifyPassword("deadlock-coffman-4", hash)).toBe(true);
    expect(await verifyPassword("wrong-password-1", hash)).toBe(false);
  });
});

describe("getJwtSecret", () => {
  it("refuses to run without a strong secret", async () => {
    vi.resetModules();
    const saved = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "short";
    const { getJwtSecret } = await import("@/lib/auth");
    expect(() => getJwtSecret()).toThrow(/JWT_SECRET/);
    process.env.JWT_SECRET = saved;
  });
});
