import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const doubt = await prisma.doubtPost.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatar: true, branch: true, college: true, role: true } },
        subject: { select: { id: true, name: true, code: true } },
        answers: {
          include: {
            user: { select: { id: true, name: true, avatar: true, role: true, branch: true, college: true } },
          },
          orderBy: [{ isAccepted: "desc" }, { upvotes: "desc" }, { createdAt: "asc" }],
        },
      },
    });

    if (!doubt) {
      return NextResponse.json({ error: "Doubt not found" }, { status: 404 });
    }

    return NextResponse.json({ doubt });
  } catch (error) {
    console.error("Error fetching single doubt:", error);
    return NextResponse.json({ error: "Failed to fetch doubt" }, { status: 500 });
  }
}
