import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId");
    const semesterId = searchParams.get("semesterId");
    const subjectId = searchParams.get("subjectId");
    const yearNumber = searchParams.get("year");
    const search = searchParams.get("search");
    const isPYQ = searchParams.get("isPYQ");
    const featured = searchParams.get("featured");

    const where: any = { isPublished: true };

    if (branchId) where.branchId = branchId;
    if (semesterId) where.semesterId = semesterId;
    if (subjectId) where.subjectId = subjectId;
    if (isPYQ === "true") where.isPYQ = true;
    if (featured === "true") where.isFeatured = true;

    if (yearNumber) {
      where.academicYear = { yearNumber: parseInt(yearNumber) };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
        { subject: { name: { contains: search } } },
      ];
    }

    const notes = await prisma.note.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        branch: { select: { id: true, name: true, code: true } },
        semester: { select: { id: true, title: true, semesterNumber: true } },
        unit: { select: { id: true, title: true, unitNumber: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Fetch notes error:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR"])) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      fileUrl,
      fileSize,
      fileType,
      subjectId,
      unitId,
      branchId,
      semesterId,
      academicYearId,
      isFeatured,
      isPYQ,
      yearPYQ,
      tags,
    } = body;

    if (!title || !fileUrl || !subjectId) {
      return NextResponse.json(
        { error: "Title, file URL, and subject are required" },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        title,
        description,
        fileUrl,
        fileSize: fileSize || "1.5 MB",
        fileType: fileType || "PDF",
        subjectId,
        unitId: unitId || null,
        branchId: branchId || null,
        semesterId: semesterId || null,
        academicYearId: academicYearId || null,
        isFeatured: Boolean(isFeatured),
        isPYQ: Boolean(isPYQ),
        yearPYQ: yearPYQ || null,
        tags: tags || null,
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error("Create note error:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
