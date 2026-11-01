import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HelpCircle, Clock, Award, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      subject: true,
      unit: true,
      _count: { select: { questions: true, attempts: true } },
    },
  });

  if (!quiz) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/quizzes"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-3 hover:text-brand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Quizzes
        </Link>
      </div>

      {/* Main Quiz Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-surface border border-line shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-soft text-brand">
            {quiz.subject.code}: {quiz.subject.name}
          </span>
          <span className="text-xs text-ink-3 font-medium">
            {quiz._count.attempts} students completed this quiz
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-black text-ink">
            {quiz.title}
          </h1>
          <p className="text-sm text-ink-2 leading-relaxed">
            {quiz.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-surface-2 border border-line">
          <div className="text-center p-2">
            <div className="text-xs text-ink-3 font-medium">Questions</div>
            <div className="text-xl font-bold text-ink mt-0.5">
              {quiz._count.questions} MCQs
            </div>
          </div>
          <div className="text-center p-2">
            <div className="text-xs text-ink-3 font-medium">Duration</div>
            <div className="text-xl font-bold text-brand mt-0.5">
              {quiz.durationMinutes} Mins
            </div>
          </div>
          <div className="text-center p-2">
            <div className="text-xs text-ink-3 font-medium">Total Marks</div>
            <div className="text-xl font-bold text-ink mt-0.5">
              {quiz.totalMarks} Marks
            </div>
          </div>
          <div className="text-center p-2">
            <div className="text-xs text-ink-3 font-medium">Pass Criteria</div>
            <div className="text-xl font-bold text-ok mt-0.5">
              {quiz.passingMarks} Marks
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand" /> Test Instructions
          </h3>
          <ul className="space-y-2 text-xs text-ink-2">
            <li className="flex items-start gap-2">
              <span className="font-bold text-brand">•</span>
              <span>The timer begins as soon as you click &ldquo;Begin Test Now&rdquo;.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-brand">•</span>
              <span>You can freely jump between questions using the question palette.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-brand">•</span>
              <span>
                {quiz.negativeMarkingRate > 0
                  ? `Negative marking of ${quiz.negativeMarkingRate} marks applies for incorrect choices. Unattempted questions incur no penalty.`
                  : "No negative marking applies for this practice quiz."}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-brand">•</span>
              <span>The test will automatically submit when the countdown expires.</span>
            </li>
          </ul>
        </div>

        {/* Start Button */}
        <div className="pt-6 border-t border-line flex justify-center">
          <Link
            href={`/quizzes/${quiz.id}/attempt`}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold bg-warn hover:bg-warn text-white shadow-lg shadow-warn/30 transition-all hover:scale-105 text-center"
          >
            Begin Test Now →
          </Link>
        </div>
      </div>
    </div>
  );
}
