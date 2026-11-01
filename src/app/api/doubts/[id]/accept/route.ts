import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { id, parseJson, z } from "@/lib/validation";

const body = z.object({ answerId: id });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = await parseJson(req, body);
  if (parsed.error) return parsed.error;

  try {
    const { id: postId } = await params;
    const doubt = await prisma.doubtPost.findUnique({ where: { id: postId } });
    if (!doubt) {
      return NextResponse.json({ error: "Doubt not found" }, { status: 404 });
    }

    if (doubt.userId !== user.id && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only the question author can accept an answer" }, { status: 403 });
    }

    const answer = await prisma.doubtAnswer.findUnique({ where: { id: parsed.data.answerId } });
    if (!answer || answer.postId !== postId) {
      return NextResponse.json({ error: "That answer doesn't belong to this doubt" }, { status: 400 });
    }
    if (answer.isAccepted) {
      return NextResponse.json({ success: true, acceptedAnswer: answer });
    }

    const [, acceptedAnswer] = await prisma.$transaction([
      prisma.doubtAnswer.updateMany({ where: { postId }, data: { isAccepted: false } }),
      prisma.doubtAnswer.update({ where: { id: answer.id }, data: { isAccepted: true } }),
      prisma.doubtPost.update({ where: { id: postId }, data: { isResolved: true } }),
      prisma.xpTransaction.create({
        data: { userId: answer.userId, amount: 35, action: "ACCEPTED_ANSWER_BONUS" },
      }),
    ]);

    return NextResponse.json({ success: true, acceptedAnswer });
  } catch (error) {
    console.error("Error accepting answer:", error);
    return NextResponse.json({ error: "Failed to accept answer" }, { status: 500 });
  }
}
