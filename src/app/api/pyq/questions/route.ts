import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const unitId = searchParams.get("unitId");
    const paperId = searchParams.get("paperId");
    const isImportant = searchParams.get("isImportant");
    const difficulty = searchParams.get("difficulty");
    const topic = searchParams.get("topic");

    const user = await getCurrentUser();

    const where: any = {};
    if (subjectId) where.subjectId = subjectId;
    if (unitId) where.unitId = unitId;
    if (paperId) where.paperId = paperId;
    if (isImportant === "true") where.isImportant = true;
    if (difficulty) where.difficulty = difficulty;
    if (topic) where.topicTag = { contains: topic };

    const questions = await prisma.questionBank.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        unit: { select: { id: true, unitNumber: true, title: true } },
        paper: {
          select: {
            id: true,
            title: true,
            examYear: true,
            examType: true,
            university: { select: { code: true, name: true } },
          },
        },
        attempts: user
          ? {
              where: { userId: user.id },
              select: { id: true, attemptedAt: true, notes: true },
            }
          : false,
        bookmarks: user
          ? {
              where: { userId: user.id },
              select: { id: true, createdAt: true },
            }
          : false,
      },
      orderBy: [{ frequencyCount: "desc" }, { createdAt: "desc" }],
    });

    const transformed = questions.map((q) => ({
      ...q,
      isAttempted: Boolean(q.attempts && q.attempts.length > 0),
      isBookmarked: Boolean(q.bookmarks && q.bookmarks.length > 0),
      studentNotes: q.attempts?.[0]?.notes || null,
    }));

    return NextResponse.json({ questions: transformed });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      paperId,
      subjectId,
      unitId,
      topicTag,
      questionText,
      marks,
      difficulty,
      frequencyCount,
      isImportant,
      solutionText,
      solutionVideoUrl,
    } = body;

    if (!subjectId || !topicTag || !questionText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const question = await prisma.questionBank.create({
      data: {
        paperId: paperId || null,
        subjectId,
        unitId: unitId || null,
        topicTag,
        questionText,
        marks: marks ? Number(marks) : 10,
        difficulty: difficulty || "MEDIUM",
        frequencyCount: frequencyCount ? Number(frequencyCount) : 1,
        isImportant: Boolean(isImportant),
        solutionText: solutionText || null,
        solutionVideoUrl: solutionVideoUrl || null,
      },
    });

    await logActivity({
      userId: user.id,
      action: "CREATE_QUESTION_BANK",
      entityType: "QuestionBank",
      entityId: question.id,
      details: { topicTag, marks, subjectId },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}
