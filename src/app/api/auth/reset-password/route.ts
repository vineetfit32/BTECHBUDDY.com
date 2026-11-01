import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { enforceRateLimits, getClientIp } from "@/lib/rate-limit";
import { hashResetToken } from "@/lib/reset-token";
import { parseJson, password, z } from "@/lib/validation";

const schema = z.object({
  token: z.string().min(20).max(200),
  password,
});

export async function POST(req: Request) {
  const limited = enforceRateLimits([{ key: `reset:ip:${getClientIp(req)}`, limit: 10, windowMs: 15 * 60_000 }]);
  if (limited) return limited;

  const parsed = await parseJson(req, schema);
  if (parsed.error) return parsed.error;

  try {
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashResetToken(parsed.data.token) },
    });
    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "This reset link is invalid or has expired. Request a new one." }, { status: 400 });
    }

    const passwordHash = await hashPassword(parsed.data.password);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash, tokenVersion: { increment: 1 } },
      }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      prisma.passwordResetToken.deleteMany({ where: { userId: record.userId, usedAt: null } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Could not reset password. Please try again." }, { status: 500 });
  }
}
