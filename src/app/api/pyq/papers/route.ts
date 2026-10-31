import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const universityId = searchParams.get("universityId");
    const branchId = searchParams.get("branchId");
    const subjectId = searchParams.get("subjectId");
    const semesterId = searchParams.get("semesterId");
    const examYear = searchParams.get("examYear");
    const examType = searchParams.get("examType");

    const where: any = {};
    if (universityId) where.universityId = universityId;
    if (branchId) where.branchId = branchId;
    if (subjectId) where.subjectId = subjectId;
    if (semesterId) where.semesterId = semesterId;
    if (examYear) where.examYear = examYear;
    if (examType) where.examType = examType;

    const papers = await prisma.examPaper.findMany({
      where,
      include: {
        university: true,
        branch: true,
        subject: true,
        semester: true,
        _count: {
          select: { questions: true },
        },
      },
      orderBy: [{ examYear: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ papers });
  } catch (error) {
    console.error("Error fetching PYQ papers:", error);
    return NextResponse.json({ error: "Failed to fetch papers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { universityId, branchId, subjectId, semesterId, examYear, examType, title, pdfUrl, fileSize } = body;

    if (!universityId || !branchId || !subjectId || !examYear || !title || !pdfUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const paper = await prisma.examPaper.create({
      data: {
        universityId,
        branchId,
        subjectId,
        semesterId: semesterId || null,
        examYear,
        examType: examType || "END_TERM",
        title,
        pdfUrl,
        fileSize: fileSize || "1.8 MB",
      },
    });

    await logActivity({
      userId: user.id,
      action: "CREATE_EXAM_PAPER",
      entityType: "ExamPaper",
      entityId: paper.id,
      details: { title, examYear, subjectId },
    });

    return NextResponse.json({ paper }, { status: 201 });
  } catch (error) {
    console.error("Error creating PYQ paper:", error);
    return NextResponse.json({ error: "Failed to create paper" }, { status: 500 });
  }
}
