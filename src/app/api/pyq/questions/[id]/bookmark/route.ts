import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { id } from "@/lib/validation";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in" }, { status: 401 });
  }
  const questionId = id.safeParse((await params).id);
  if (!questionId.success) return NextResponse.json({ error: "Invalid question id" }, { status: 400 });

  try {
    const key = { userId_questionId: { userId: user.id, questionId: questionId.data } };
    const existing = await prisma.studentBookmarkQuestion.findUnique({ where: key });

    if (existing) {
      await prisma.studentBookmarkQuestion.delete({ where: { id: existing.id } });
      return NextResponse.json({ bookmarked: false });
    }
    await prisma.studentBookmarkQuestion.create({ data: { userId: user.id, questionId: questionId.data } });
    return NextResponse.json({ bookmarked: true });
  } catch (error) {
    console.error("Error toggling question bookmark:", error);
    return NextResponse.json({ error: "Failed to update bookmark" }, { status: 500 });
  }
}
