import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enforceRateLimits, getClientIp } from "@/lib/rate-limit";
import { createResetToken, RESET_TOKEN_TTL_MS } from "@/lib/reset-token";
import { passwordResetEmail, sendMail } from "@/lib/mailer";
import { email, parseJson, z } from "@/lib/validation";

const schema = z.object({ email });

const GENERIC_RESPONSE = {
  success: true,
  message: "If an account exists for that email, a reset link is on its way.",
};

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const ipLimited = enforceRateLimits([{ key: `forgot:ip:${ip}`, limit: 5, windowMs: 15 * 60_000 }]);
  if (ipLimited) return ipLimited;

  const parsed = await parseJson(req, schema);
  if (parsed.error) return parsed.error;

  const emailLimited = enforceRateLimits([{ key: `forgot:email:${parsed.data.email}`, limit: 3, windowMs: 60 * 60_000 }]);
  if (emailLimited) return NextResponse.json(GENERIC_RESPONSE);

  try {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (user?.isActive) {
      const { token, tokenHash } = createResetToken();
      await prisma.$transaction([
        prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
        prisma.passwordResetToken.create({
          data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
        }),
      ]);
      const base = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
      const link = `${base.replace(/\/$/, "")}/reset-password?token=${token}`;
      await sendMail({ to: user.email, ...passwordResetEmail(user.name, link) });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
