import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");

    const where: any = { isPublished: true };
    if (subjectId) where.subjectId = subjectId;

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        unit: { select: { id: true, title: true, unitNumber: true } },
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error("Fetch quizzes error:", error);
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
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
      subjectId,
      unitId,
      durationMinutes,
      totalMarks,
      passingMarks,
      negativeMarkingRate,
      questions,
    } = body;

    if (!title || !subjectId || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Title, subject, and questions are required" },
        { status: 400 }
      );
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        subjectId,
        unitId: unitId || null,
        durationMinutes: parseInt(durationMinutes || 20),
        totalMarks: parseInt(totalMarks || questions.length),
        passingMarks: parseInt(passingMarks || Math.ceil(questions.length * 0.4)),
        negativeMarkingRate: parseFloat(negativeMarkingRate || 0),
      },
    });

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const createdQ = await prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          questionText: q.questionText,
          marks: q.marks || 1,
          explanation: q.explanation || null,
          order: i + 1,
        },
      });

      if (q.options && Array.isArray(q.options)) {
        for (const opt of q.options) {
          await prisma.quizOption.create({
            data: {
              questionId: createdQ.id,
              optionText: opt.optionText,
              isCorrect: Boolean(opt.isCorrect),
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, quizId: quiz.id });
  } catch (error) {
    console.error("Create quiz error:", error);
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 });
  }
}
