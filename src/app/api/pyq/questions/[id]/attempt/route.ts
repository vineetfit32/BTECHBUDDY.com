import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { optionalText, parseOptionalJson, z } from "@/lib/validation";

const body = z.object({ notes: optionalText(5000) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in" }, { status: 401 });
  }
  const parsed = await parseOptionalJson(req, body);
  if (parsed.error) return parsed.error;

  try {
    const { id: questionId } = await params;
    const existing = await prisma.studentAttemptedQuestion.findUnique({
      where: { userId_questionId: { userId: user.id, questionId } },
    });

    if (existing) {
      await prisma.studentAttemptedQuestion.delete({ where: { id: existing.id } });
      return NextResponse.json({ attempted: false });
    }

    await prisma.studentAttemptedQuestion.create({
      data: { userId: user.id, questionId, notes: parsed.data.notes ?? null },
    });

    const action = `QUESTION_ATTEMPT:${questionId}`;
    const rewarded = await prisma.xpTransaction.findFirst({ where: { userId: user.id, action }, select: { id: true } });
    if (rewarded) return NextResponse.json({ attempted: true, xpEarned: 0 });

    await prisma.xpTransaction.create({ data: { userId: user.id, amount: 15, action } });
    return NextResponse.json({ attempted: true, xpEarned: 15 });
  } catch (error) {
    console.error("Error toggling question attempt:", error);
    return NextResponse.json({ error: "Failed to update attempt" }, { status: 500 });
  }
}
