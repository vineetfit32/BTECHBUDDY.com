import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HelpCircle, Plus, Users, Clock, Award } from "lucide-react";

export default async function AdminQuizzesPage() {
  const quizzes = await prisma.quiz.findMany({
    include: {
      subject: true,
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Manage Quizzes & Online Tests
          </h1>
          <p className="text-xs text-slate-500">
            Configure examination timers, multiple choice questions, passing criteria, and review submissions
          </p>
        </div>
        <div className="text-xs font-bold text-slate-500">
          Total Tests: <span className="text-rose-500 font-extrabold">{quizzes.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map((q) => (
          <div
            key={q.id}
            className="p-6 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {q.subject.code}: {q.subject.name}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {q._count.questions} MCQs
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {q.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{q.description}</p>
              <div className="pt-2 flex items-center gap-4 text-xs text-slate-400">
                <span>{q.durationMinutes} Minutes</span>
                <span>•</span>
                <span>Pass: {q.passingMarks} / {q.totalMarks}</span>
                {q.negativeMarkingRate > 0 && <span>• Neg: -{q.negativeMarkingRate}</span>}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">{q._count.attempts} Student Submissions</span>
              <Link
                href={`/quizzes/${q.id}`}
                className="font-bold text-rose-600 hover:underline"
              >
                Inspect Test →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
