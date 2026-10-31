import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to submit your quiz attempt" }, { status: 401 });
    }

    const { id: quizId } = await params;
    const { answers, timeTakenSeconds } = await req.json();

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    let rawScore = 0;
    let totalMarks = 0;
    const answerRecords: { questionId: string; selectedOptionId: string | null; isCorrect: boolean }[] = [];
    const detailedFeedback: any[] = [];

    for (const question of quiz.questions) {
      totalMarks += question.marks;
      const selectedOptionId = answers ? answers[question.id] : null;
      const correctOption = question.options.find((opt) => opt.isCorrect);

      let isCorrect = false;
      if (selectedOptionId && correctOption && selectedOptionId === correctOption.id) {
        isCorrect = true;
        rawScore += question.marks;
      } else if (selectedOptionId && quiz.negativeMarkingRate > 0) {
        // Negative marking applies only if attempted and wrong
        rawScore -= question.marks * quiz.negativeMarkingRate;
      }

      answerRecords.push({
        questionId: question.id,
        selectedOptionId: selectedOptionId || null,
        isCorrect,
      });

      detailedFeedback.push({
        questionId: question.id,
        questionText: question.questionText,
        selectedOptionId,
        correctOptionId: correctOption?.id,
        isCorrect,
        explanation: question.explanation,
        marks: question.marks,
      });
    }

    // Floor at 0 marks
    const finalScore = Math.max(0, parseFloat(rawScore.toFixed(2)));
    const percentage = totalMarks > 0 ? parseFloat(((finalScore / totalMarks) * 100).toFixed(1)) : 0;
    const passed = finalScore >= quiz.passingMarks;

    // Save attempt to database
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId: user.id,
        score: finalScore,
        totalMarks,
        percentage,
        passed,
        timeTakenSeconds: timeTakenSeconds || 0,
        answers: {
          create: answerRecords,
        },
      },
    });

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score: finalScore,
      totalMarks,
      percentage,
      passed,
      timeTakenSeconds,
      feedback: detailedFeedback,
    });
  } catch (error) {
    console.error("Quiz submission error:", error);
    return NextResponse.json({ error: "Failed to evaluate quiz" }, { status: 500 });
  }
}
