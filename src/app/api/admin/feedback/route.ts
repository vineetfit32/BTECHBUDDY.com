import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enforceRateLimits, getClientIp } from "@/lib/rate-limit";
import { email, parseJson, text, z } from "@/lib/validation";

const schema = z.object({
  name: text(80, "Name"),
  email,
  subject: text(160, "Subject"),
  message: text(5000, "Message"),
});

export async function POST(req: Request) {
  const limited = enforceRateLimits(
    [{ key: `feedback:ip:${getClientIp(req)}`, limit: 5, windowMs: 60 * 60_000 }],
    "You've sent several messages already. Please try again in an hour."
  );
  if (limited) return limited;

  const parsed = await parseJson(req, schema);
  if (parsed.error) return parsed.error;

  try {
    const feedback = await prisma.feedback.create({ data: parsed.data, select: { id: true } });
    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return NextResponse.json({ error: "Failed to record inquiry" }, { status: 500 });
  }
}
