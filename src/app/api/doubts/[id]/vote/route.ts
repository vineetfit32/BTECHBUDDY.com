import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { id, parseJson, z } from "@/lib/validation";

const body = z.object({ type: z.enum(["DOUBT", "ANSWER"]).default("DOUBT") });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to vote" }, { status: 401 });
  }
  const parsed = await parseJson(req, body);
  if (parsed.error) return parsed.error;
  const targetId = id.safeParse((await params).id);
  if (!targetId.success) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const { type } = parsed.data;

  try {
    const upvotes = await prisma.$transaction(async (tx) => {
      const existing = await tx.doubtVote.findUnique({
        where: { userId_targetType_targetId: { userId: user.id, targetType: type, targetId: targetId.data } },
      });
      const delta = existing ? -1 : 1;
      if (existing) await tx.doubtVote.delete({ where: { id: existing.id } });
      else await tx.doubtVote.create({ data: { userId: user.id, targetType: type, targetId: targetId.data } });

      const updated =
        type === "ANSWER"
          ? await tx.doubtAnswer.update({ where: { id: targetId.data }, data: { upvotes: { increment: delta } } })
          : await tx.doubtPost.update({ where: { id: targetId.data }, data: { upvotes: { increment: delta } } });
      return { count: updated.upvotes, voted: !existing };
    });

    return NextResponse.json({ upvotes: upvotes.count, voted: upvotes.voted });
  } catch (error) {
    console.error("Error updating vote:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
