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
      return NextResponse.json({ error: "Please log in to vote" }, { status: 401 });
    }

    const { id: targetId } = await params;
    const body = await req.json();
    const { type } = body; // "DOUBT" or "ANSWER"

    if (type === "ANSWER") {
      const updated = await prisma.doubtAnswer.update({
        where: { id: targetId },
        data: { upvotes: { increment: 1 } },
      });
      return NextResponse.json({ upvotes: updated.upvotes });
    } else {
      const updated = await prisma.doubtPost.update({
        where: { id: targetId },
        data: { upvotes: { increment: 1 } },
      });
      return NextResponse.json({ upvotes: updated.upvotes });
    }
  } catch (error) {
    console.error("Error updating vote:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
