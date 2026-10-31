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
      return NextResponse.json({ error: "Please log in to answer" }, { status: 401 });
    }

    const { id: postId } = await params;
    const body = await req.json();
    const { content, imageUrl } = body;

    if (!content) {
      return NextResponse.json({ error: "Answer content cannot be empty" }, { status: 400 });
    }

    const doubt = await prisma.doubtPost.findUnique({
      where: { id: postId },
    });

    if (!doubt) {
      return NextResponse.json({ error: "Doubt post not found" }, { status: 404 });
    }

    const isInstructor = user.role === "INSTRUCTOR" || user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    const answer = await prisma.doubtAnswer.create({
      data: {
        postId,
        userId: user.id,
        content,
        imageUrl: imageUrl || null,
        isVerified: isInstructor,
      },
    });

    // Award XP to the student who answered
    await prisma.xpTransaction.create({
      data: {
        userId: user.id,
        amount: 20,
        action: "ANSWER_DOUBT",
      },
    });

    // Notify question author if different user
    if (doubt.userId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: doubt.userId,
          title: "New Answer on your Doubt!",
          message: `${user.name} posted an answer to your doubt: "${doubt.title.slice(0, 40)}..."`,
          link: `/doubts/${postId}`,
        },
      });
    }

    return NextResponse.json({ answer, xpEarned: 20 }, { status: 201 });
  } catch (error) {
    console.error("Error posting answer:", error);
    return NextResponse.json({ error: "Failed to post answer" }, { status: 500 });
  }
}
