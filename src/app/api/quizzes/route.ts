import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";
import { id, optionalId, optionalText, parseJson, parseQuery, text, z } from "@/lib/validation";

const listQuery = z.object({ subjectId: optionalId });

const optionInput = z.object({
  optionText: text(1000, "Option"),
  isCorrect: z.boolean().default(false),
});

const questionInput = z
  .object({
    questionText: text(5000, "Question"),
    marks: z.coerce.number().int().min(1).max(20).default(1),
    explanation: optionalText(5000),
    options: z.array(optionInput).min(2, "Each question needs at least two options").max(8),
  })
  .refine((q) => q.options.filter((o) => o.isCorrect).length === 1, "Each question needs exactly one correct option");

const createBody = z.object({
  title: text(200, "Title"),
  description: optionalText(2000),
  subjectId: id,
  unitId: optionalId,
  durationMinutes: z.coerce.number().int().min(1).max(300).default(20),
  totalMarks: z.coerce.number().int().min(1).optional(),
  passingMarks: z.coerce.number().int().min(0).optional(),
  negativeMarkingRate: z.coerce.number().min(0).max(1).default(0),
  questions: z.array(questionInput).min(1, "Add at least one question").max(200),
});

export async function GET(req: Request) {
  const parsed = parseQuery(req, listQuery);
  if (parsed.error) return parsed.error;

  try {
    const quizzes = await prisma.quiz.findMany({
      where: { isPublished: true, ...(parsed.data.subjectId && { subjectId: parsed.data.subjectId }) },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        unit: { select: { id: true, title: true, unitNumber: true } },
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    });
    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error("Fetch quizzes error:", error);
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR"])) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }
  const parsed = await parseJson(req, createBody);
  if (parsed.error) return parsed.error;
  const input = parsed.data;
  const marksSum = input.questions.reduce((sum, q) => sum + q.marks, 0);

  try {
    const quiz = await prisma.quiz.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        subjectId: input.subjectId,
        unitId: input.unitId ?? null,
        durationMinutes: input.durationMinutes,
        totalMarks: input.totalMarks ?? marksSum,
        passingMarks: input.passingMarks ?? Math.ceil(marksSum * 0.4),
        negativeMarkingRate: input.negativeMarkingRate,
        questions: {
          create: input.questions.map((q, i) => ({
            questionText: q.questionText,
            marks: q.marks,
            explanation: q.explanation ?? null,
            order: i + 1,
            options: { create: q.options },
          })),
        },
      },
      select: { id: true },
    });
    return NextResponse.json({ success: true, quizId: quiz.id });
  } catch (error) {
    console.error("Create quiz error:", error);
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 });
  }
}
