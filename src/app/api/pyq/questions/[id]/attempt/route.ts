import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }

    const { id: questionId } = await params;
    const body = await req.json().catch(() => ({}));
    const { notes } = body;

    const existing = await prisma.studentAttemptedQuestion.findUnique({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId,
        },
      },
    });

    if (existing) {
      // Toggle off / remove attempt
      await prisma.studentAttemptedQuestion.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ attempted: false });
    } else {
      // Mark as attempted
      await prisma.studentAttemptedQuestion.create({
        data: {
          userId: user.id,
          questionId,
          notes: notes || null,
        },
      });

      // Award XP for solving/attempting question
      await prisma.xpTransaction.create({
        data: {
          userId: user.id,
          amount: 15,
          action: "QUESTION_ATTEMPT",
        },
      });

      return NextResponse.json({ attempted: true, xpEarned: 15 });
    }
  } catch (error) {
    console.error("Error toggling question attempt:", error);
    return NextResponse.json({ error: "Failed to update attempt" }, { status: 500 });
  }
}
