import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { burnPasswordCheck, sessionCookie, signJWT, verifyPassword } from "@/lib/auth";
import { enforceRateLimits, getClientIp, resetRateLimit } from "@/lib/rate-limit";
import { email, parseJson, z } from "@/lib/validation";

const schema = z.object({
  email,
  password: z.string().min(1, "Password is required").max(128),
});

const INVALID = () => NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const ipLimited = enforceRateLimits(
    [{ key: `login:ip:${ip}`, limit: 30, windowMs: 15 * 60_000 }],
    "Too many sign-in attempts. Please wait a few minutes."
  );
  if (ipLimited) return ipLimited;

  const parsed = await parseJson(req, schema);
  if (parsed.error) return parsed.error;
  const { email: cleanEmail, password } = parsed.data;

  const accountKey = `login:account:${ip}:${cleanEmail}`;
  const accountLimited = enforceRateLimits(
    [{ key: accountKey, limit: 8, windowMs: 15 * 60_000 }],
    "Too many sign-in attempts for this account. Please wait 15 minutes or reset your password."
  );
  if (accountLimited) return accountLimited;

  try {
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      await burnPasswordCheck(password);
      return INVALID();
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) return INVALID();

    if (!user.isActive) {
      return NextResponse.json(
        { error: "This account has been deactivated. Please contact support." },
        { status: 403 }
      );
    }

    resetRateLimit(accountKey);

    const token = await signJWT({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      tv: user.tokenVersion,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        branch: user.branch,
        semester: user.semester,
      },
    });
    response.cookies.set(sessionCookie(token));
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during login." }, { status: 500 });
  }
}
