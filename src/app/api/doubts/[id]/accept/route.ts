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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: postId } = await params;
    const body = await req.json();
    const { answerId } = body;

    const doubt = await prisma.doubtPost.findUnique({
      where: { id: postId },
    });

    if (!doubt) {
      return NextResponse.json({ error: "Doubt not found" }, { status: 404 });
    }

    // Only the question author or an admin can accept an answer
    if (doubt.userId !== user.id && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only the question author can accept an answer" }, { status: 403 });
    }

    // Unaccept all other answers for this post first
    await prisma.doubtAnswer.updateMany({
      where: { postId },
      data: { isAccepted: false },
    });

    // Mark this answer as accepted
    const acceptedAnswer = await prisma.doubtAnswer.update({
      where: { id: answerId },
      data: { isAccepted: true },
    });

    // Mark post as resolved
    await prisma.doubtPost.update({
      where: { id: postId },
      data: { isResolved: true },
    });

    // Award bonus 35 XP to the answer author
    await prisma.xpTransaction.create({
      data: {
        userId: acceptedAnswer.userId,
        amount: 35,
        action: "ACCEPTED_ANSWER_BONUS",
      },
    });

    return NextResponse.json({ success: true, acceptedAnswer });
  } catch (error) {
    console.error("Error accepting answer:", error);
    return NextResponse.json({ error: "Failed to accept answer" }, { status: 500 });
  }
}
