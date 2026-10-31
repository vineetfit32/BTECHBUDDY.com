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

    const existing = await prisma.studentBookmarkQuestion.findUnique({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId,
        },
      },
    });

    if (existing) {
      await prisma.studentBookmarkQuestion.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ bookmarked: false });
    } else {
      await prisma.studentBookmarkQuestion.create({
        data: {
          userId: user.id,
          questionId,
        },
      });
      return NextResponse.json({ bookmarked: true });
    }
  } catch (error) {
    console.error("Error toggling question bookmark:", error);
    return NextResponse.json({ error: "Failed to update bookmark" }, { status: 500 });
  }
}
