import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId");
    const semesterId = searchParams.get("semesterId");
    const yearNumber = searchParams.get("year");
    const featured = searchParams.get("featured");

    const where: any = {};
    if (branchId) where.branchId = branchId;
    if (semesterId) where.semesterId = semesterId;
    if (featured === "true") where.isFeatured = true;

    if (yearNumber) {
      where.semester = { academicYear: { yearNumber: parseInt(yearNumber) } };
    }

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        branch: { select: { id: true, name: true, code: true } },
        semester: { select: { id: true, title: true, semesterNumber: true } },
        units: { select: { id: true, title: true, unitNumber: true } },
        _count: {
          select: { notes: true, videos: true, quizzes: true },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Fetch subjects error:", error);
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { code, name, description, credits, syllabus, semesterId, branchId, isFeatured } = await req.json();

    if (!code || !name || !semesterId || !branchId) {
      return NextResponse.json(
        { error: "Code, name, semester, and branch are required" },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const subject = await prisma.subject.create({
      data: {
        code: code.toUpperCase().trim(),
        name: name.trim(),
        slug,
        description,
        credits: parseInt(credits || 4),
        syllabus,
        semesterId,
        branchId,
        isFeatured: Boolean(isFeatured),
      },
    });

    return NextResponse.json({ success: true, subject });
  } catch (error) {
    console.error("Create subject error:", error);
    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 });
  }
}
