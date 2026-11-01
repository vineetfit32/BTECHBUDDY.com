import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { enforceRateLimits } from "@/lib/rate-limit";
import { ownedFileUrl, optionalId, optionalText, parseJson, parseQuery, text, z } from "@/lib/validation";

const listQuery = z.object({
  subjectId: optionalId,
  tag: optionalText(40),
  search: optionalText(120),
  resolved: z.enum(["true", "false"]).optional(),
});

const createBody = z.object({
  title: text(200, "Title"),
  content: text(10_000, "Content"),
  subjectId: optionalId,
  tags: optionalText(200),
  imageUrl: ownedFileUrl,
});

export async function GET(req: NextRequest) {
  const parsed = parseQuery(req, listQuery);
  if (parsed.error) return parsed.error;
  const { subjectId, tag, search, resolved } = parsed.data;

  try {
    const where: Record<string, unknown> = {};
    if (subjectId) where.subjectId = subjectId;
    if (tag) where.tags = { contains: tag, mode: "insensitive" };
    if (resolved) where.isResolved = resolved === "true";
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } },
      ];
    }

    const doubts = await prisma.doubtPost.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true, branch: true, college: true } },
        subject: { select: { id: true, name: true, code: true } },
        _count: { select: { answers: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ doubts });
  } catch (error) {
    console.error("Error fetching doubts:", error);
    return NextResponse.json({ error: "Failed to fetch doubts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to ask a doubt" }, { status: 401 });
  }

  const limited = enforceRateLimits(
    [{ key: `doubt:${user.id}`, limit: 10, windowMs: 10 * 60_000 }],
    "You're posting very quickly. Take a breather and try again in a few minutes."
  );
  if (limited) return limited;

  const parsed = await parseJson(req, createBody);
  if (parsed.error) return parsed.error;
  const { title, content, subjectId, tags, imageUrl } = parsed.data;

  try {
    const doubt = await prisma.doubtPost.create({
      data: {
        userId: user.id,
        title,
        content,
        subjectId: subjectId ?? null,
        tags: tags ?? null,
        imageUrl: imageUrl ?? null,
      },
    });

    await prisma.xpTransaction.create({
      data: { userId: user.id, amount: 10, action: "POST_DOUBT" },
    });

    return NextResponse.json({ doubt, xpEarned: 10 }, { status: 201 });
  } catch (error) {
    console.error("Error creating doubt:", error);
    return NextResponse.json({ error: "Failed to create doubt" }, { status: 500 });
  }
}
