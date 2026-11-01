import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, sessionCookie, signJWT } from "@/lib/auth";
import { enforceRateLimits, getClientIp } from "@/lib/rate-limit";
import { email, optionalInt, optionalText, parseJson, password, text, z } from "@/lib/validation";

const schema = z.object({
  name: text(80, "Name"),
  email,
  password,
  college: optionalText(160),
  branch: optionalText(16),
  semester: optionalInt(1, 8),
});

export async function POST(req: Request) {
  const limited = enforceRateLimits(
    [{ key: `register:ip:${getClientIp(req)}`, limit: 5, windowMs: 60 * 60_000 }],
    "Too many accounts created from this network. Please try again later."
  );
  if (limited) return limited;

  const parsed = await parseJson(req, schema);
  if (parsed.error) return parsed.error;
  const { name, email: cleanEmail, password: rawPassword, college, branch, semester } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash: await hashPassword(rawPassword),
        role: "STUDENT",
        college: college ?? null,
        branch: branch ?? null,
        semester: semester ?? null,
      },
    });

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
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 });
  }
}
