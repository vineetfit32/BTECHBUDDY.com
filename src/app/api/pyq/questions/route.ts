import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";
import { id, optionalId, optionalText, parseJson, parseQuery, text, z } from "@/lib/validation";

const difficulty = z.enum(["EASY", "MEDIUM", "HARD"]);

const listQuery = z.object({
  subjectId: optionalId,
  unitId: optionalId,
  paperId: optionalId,
  isImportant: z.enum(["true", "false"]).optional(),
  difficulty: difficulty.optional(),
  topic: optionalText(80),
});

const createBody = z.object({
  paperId: optionalId,
  subjectId: id,
  unitId: optionalId,
  topicTag: text(80, "Topic"),
  questionText: text(10_000, "Question"),
  marks: z.coerce.number().int().min(1).max(30).default(10),
  difficulty: difficulty.default("MEDIUM"),
  frequencyCount: z.coerce.number().int().min(1).max(50).default(1),
  isImportant: z.boolean().default(false),
  solutionText: optionalText(20_000),
  solutionVideoUrl: z
    .preprocess((v) => (v === "" || v === null ? undefined : v), z.string().regex(/^\/videos\/[\w-]+$/, "Link a BTECHBUDDY lecture, e.g. /videos/<id>").optional()),
});

export async function GET(req: NextRequest) {
  const parsed = parseQuery(req, listQuery);
  if (parsed.error) return parsed.error;
  const { subjectId, unitId, paperId, isImportant, difficulty: level, topic } = parsed.data;

  try {
    const user = await getCurrentUser();
    const questions = await prisma.questionBank.findMany({
      where: {
        ...(subjectId && { subjectId }),
        ...(unitId && { unitId }),
        ...(paperId && { paperId }),
        ...(isImportant === "true" && { isImportant: true }),
        ...(level && { difficulty: level }),
        ...(topic && { topicTag: { contains: topic, mode: "insensitive" as const } }),
      },
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
        attempts: user ? { where: { userId: user.id }, select: { id: true, attemptedAt: true, notes: true } } : false,
        bookmarks: user ? { where: { userId: user.id }, select: { id: true, createdAt: true } } : false,
      },
      orderBy: [{ frequencyCount: "desc" }, { createdAt: "desc" }],
      take: 500,
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
  const user = await getCurrentUser();
  if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const parsed = await parseJson(req, createBody);
  if (parsed.error) return parsed.error;
  const input = parsed.data;

  try {
    const question = await prisma.questionBank.create({
      data: {
        ...input,
        paperId: input.paperId ?? null,
        unitId: input.unitId ?? null,
        solutionText: input.solutionText ?? null,
        solutionVideoUrl: input.solutionVideoUrl ?? null,
      },
    });
    await logActivity({
      userId: user.id,
      action: "CREATE_QUESTION_BANK",
      entityType: "QuestionBank",
      entityId: question.id,
      details: { topicTag: input.topicTag, marks: input.marks, subjectId: input.subjectId },
    });
    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}
