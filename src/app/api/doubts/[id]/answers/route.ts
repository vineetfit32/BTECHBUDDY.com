import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { enforceRateLimits } from "@/lib/rate-limit";
import { ownedFileUrl, parseJson, text, z } from "@/lib/validation";

const body = z.object({
  content: text(10_000, "Answer"),
  imageUrl: ownedFileUrl,
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to answer" }, { status: 401 });
  }

  const limited = enforceRateLimits(
    [{ key: `answer:${user.id}`, limit: 20, windowMs: 10 * 60_000 }],
    "You're answering very quickly. Please wait a few minutes."
  );
  if (limited) return limited;

  const parsed = await parseJson(req, body);
  if (parsed.error) return parsed.error;

  try {
    const { id: postId } = await params;
    const doubt = await prisma.doubtPost.findUnique({ where: { id: postId } });
    if (!doubt) {
      return NextResponse.json({ error: "Doubt post not found" }, { status: 404 });
    }

    const isInstructor = ["INSTRUCTOR", "ADMIN", "SUPER_ADMIN"].includes(user.role);

    const answer = await prisma.doubtAnswer.create({
      data: {
        postId,
        userId: user.id,
        content: parsed.data.content,
        imageUrl: parsed.data.imageUrl ?? null,
        isVerified: isInstructor,
      },
    });

    await prisma.xpTransaction.create({
      data: { userId: user.id, amount: 20, action: "ANSWER_DOUBT" },
    });

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
