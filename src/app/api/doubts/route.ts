import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const resolved = searchParams.get("resolved");

    const where: any = {};
    if (subjectId) where.subjectId = subjectId;
    if (tag) where.tags = { contains: tag };
    if (resolved === "true") where.isResolved = true;
    if (resolved === "false") where.isResolved = false;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { tags: { contains: search } },
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
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to ask a doubt" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, subjectId, tags, imageUrl } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const doubt = await prisma.doubtPost.create({
      data: {
        userId: user.id,
        title,
        content,
        subjectId: subjectId || null,
        tags: tags || null,
        imageUrl: imageUrl || null,
      },
    });

    // Award XP for engaging in community Q&A
    await prisma.xpTransaction.create({
      data: {
        userId: user.id,
        amount: 10,
        action: "POST_DOUBT",
      },
    });

    return NextResponse.json({ doubt }, { status: 201 });
  } catch (error) {
    console.error("Error creating doubt:", error);
    return NextResponse.json({ error: "Failed to create doubt" }, { status: 500 });
  }
}
