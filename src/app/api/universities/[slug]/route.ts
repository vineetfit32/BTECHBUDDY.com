import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const university = await prisma.university.findUnique({
      where: { slug },
      include: {
        papers: {
          include: {
            subject: true,
            branch: true,
            semester: true,
          },
          orderBy: { examYear: "desc" },
        },
        _count: {
          select: { students: true, papers: true },
        },
      },
    });

    if (!university) {
      return NextResponse.json({ error: "University not found" }, { status: 404 });
    }

    return NextResponse.json({ university });
  } catch (error) {
    console.error("Error fetching university details:", error);
    return NextResponse.json({ error: "Failed to fetch university" }, { status: 500 });
  }
}
