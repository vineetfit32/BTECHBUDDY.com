import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "btechbuddy_secure_jwt_secret_key_2026_super_long_random_engineering_token"
);

export const AUTH_COOKIE_NAME = "btechbuddy_token";

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

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signJWT(payload: { id: string; email: string; role: string; name: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as { id: string; email: string; role: string; name: string };
  } catch {
    return null;
  }
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
      },
    });

    if (!user || !user.isActive) return null;

    return user;
  } catch {
    return null;
  }
}

export function isAuthorized(role: string, allowedRoles: string[]): boolean {
  if (role === "SUPER_ADMIN") return true;
  return allowedRoles.includes(role);
}
