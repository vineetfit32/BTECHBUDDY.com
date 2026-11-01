import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { parseJson, z } from "@/lib/validation";

const body = z.object({
  answers: z.record(z.string().max(64), z.string().max(64).nullable()).default({}),
  timeTakenSeconds: z.coerce.number().int().min(0).max(24 * 3600).default(0),
});

const PASS_XP = 30;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to submit your quiz attempt" }, { status: 401 });
  }
  const parsed = await parseJson(req, body);
  if (parsed.error) return parsed.error;
  const { answers, timeTakenSeconds } = parsed.data;

  try {
    const { id: quizId } = await params;
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { include: { options: true } } },
    });
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    let rawScore = 0;
    let totalMarks = 0;
    const answerRecords: { questionId: string; selectedOptionId: string | null; isCorrect: boolean }[] = [];
    const feedback = [];

    for (const question of quiz.questions) {
      totalMarks += question.marks;
      const chosen = answers[question.id] ?? null;
      const selectedOptionId = chosen && question.options.some((o) => o.id === chosen) ? chosen : null;
      const correctOption = question.options.find((opt) => opt.isCorrect);
      const isCorrect = Boolean(selectedOptionId && correctOption && selectedOptionId === correctOption.id);

      if (isCorrect) rawScore += question.marks;
      else if (selectedOptionId && quiz.negativeMarkingRate > 0) rawScore -= question.marks * quiz.negativeMarkingRate;

      answerRecords.push({ questionId: question.id, selectedOptionId, isCorrect });
      feedback.push({
        questionId: question.id,
        questionText: question.questionText,
        selectedOptionId,
        correctOptionId: correctOption?.id,
        isCorrect,
        explanation: question.explanation,
        marks: question.marks,
      });
    }

    const finalScore = Math.max(0, parseFloat(rawScore.toFixed(2)));
    const percentage = totalMarks > 0 ? parseFloat(((finalScore / totalMarks) * 100).toFixed(1)) : 0;
    const passed = finalScore >= quiz.passingMarks;

    const priorPass = passed
      ? await prisma.quizAttempt.findFirst({ where: { quizId, userId: user.id, passed: true }, select: { id: true } })
      : null;

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId: user.id,
        score: finalScore,
        totalMarks,
        percentage,
        passed,
        timeTakenSeconds,
        answers: { create: answerRecords },
      },
    });

    let xpEarned = 0;
    const newBadges: string[] = [];
    if (passed && !priorPass) {
      xpEarned = PASS_XP;
      await prisma.xpTransaction.create({ data: { userId: user.id, amount: PASS_XP, action: `QUIZ_PASS:${quizId}` } });
    }
    if (percentage >= 90) {
      const created = await prisma.userBadge.createMany({
        data: [{ userId: user.id, badgeCode: "QUIZ_WHIZ" }],
        skipDuplicates: true,
      });
      if (created.count) newBadges.push("QUIZ_WHIZ");
    }

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score: finalScore,
      totalMarks,
      percentage,
      passed,
      timeTakenSeconds,
      feedback,
      xpEarned,
      newBadges,
    });
  } catch (error) {
    console.error("Quiz submission error:", error);
    return NextResponse.json({ error: "Failed to evaluate quiz" }, { status: 500 });
  }
}
