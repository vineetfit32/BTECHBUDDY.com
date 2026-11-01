import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const AUTH_COOKIE_NAME = "btechbuddy_token";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

let cachedSecret: Uint8Array | null = null;

export function getJwtSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret;
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set to a random string of at least 32 characters.");
  }
  cachedSecret = new TextEncoder().encode(secret);
  return cachedSecret;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  college?: string | null;
  branch?: string | null;
  semester?: number | null;
  avatar?: string | null;
}

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  name: string;
  tv: number;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

let dummyHash: Promise<string> | null = null;

// Equalises response time for unknown emails so login can't be used to enumerate accounts.
export async function burnPasswordCheck(password: string): Promise<void> {
  dummyHash ??= bcrypt.hash("btechbuddy-timing-guard", 12);
  await bcrypt.compare(password, await dummyHash);
}

export async function signJWT(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyJWT(token: string): Promise<TokenPayload | null> {
  try {
    const verified = await jwtVerify(token, getJwtSecret());
    return verified.payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export function sessionCookie(token: string) {
  return {
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifyJWT(token);
    if (!payload?.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        college: true,
        branch: true,
        semester: true,
        avatar: true,
        isActive: true,
        tokenVersion: true,
      },
    });

    if (!user || !user.isActive) return null;
    if ((payload.tv ?? 0) !== user.tokenVersion) return null;

    const { isActive: _active, tokenVersion: _tv, ...session } = user;
    return session;
  } catch {
    return null;
  }
}

export function isAuthorized(role: string, allowedRoles: string[]): boolean {
  if (role === "SUPER_ADMIN") return true;
  return allowedRoles.includes(role);
}
