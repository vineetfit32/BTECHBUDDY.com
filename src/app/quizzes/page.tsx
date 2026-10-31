import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HelpCircle, Clock, Award, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";

export default async function QuizzesPage() {
  const quizzes = await prisma.quiz.findMany({
    where: { isPublished: true },
    include: {
      subject: { select: { id: true, name: true, code: true } },
      unit: { select: { id: true, title: true, unitNumber: true } },
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-200/50 dark:border-amber-800/40">
          <HelpCircle className="w-3.5 h-3.5" /> Online Assessment Engine
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Practice Quizzes & Semester Mock Tests
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
          Assess your conceptual mastery before university mid-terms and finals. Timed multiple-choice tests with instant detailed explanations and performance analytics.
        </p>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="p-6 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between hover:shadow-xl hover:border-amber-500/40 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {quiz.subject.code}: {quiz.subject.name}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {quiz._count.questions} MCQs
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {quiz.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {quiz.description}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  {quiz.durationMinutes} Minutes
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-indigo-500" />
                  Total Marks: {quiz.totalMarks}
                </span>
                {quiz.negativeMarkingRate > 0 && (
                  <span className="flex items-center gap-1 text-rose-500 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    -{quiz.negativeMarkingRate} Neg
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {quiz._count.attempts} students attempted
              </span>
              <Link
                href={`/quizzes/${quiz.id}`}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all hover:scale-105"
              >
                Start Test →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
