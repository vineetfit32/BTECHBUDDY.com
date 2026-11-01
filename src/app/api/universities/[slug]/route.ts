import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "@/lib/validation";

const slugSchema = z.string().regex(/^[a-z0-9-]{1,120}$/);

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const slug = slugSchema.safeParse((await params).slug);
  if (!slug.success) return NextResponse.json({ error: "University not found" }, { status: 404 });

  try {
    const university = await prisma.university.findUnique({
      where: { slug: slug.data },
      include: {
        papers: { include: { subject: true, branch: true, semester: true }, orderBy: { examYear: "desc" } },
        _count: { select: { students: true, papers: true } },
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
