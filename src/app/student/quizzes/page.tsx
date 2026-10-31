import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Award, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudentQuizzesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const attempts = await prisma.quizAttempt.findMany({
    where: { userId: user.id },
    include: {
      quiz: { include: { subject: true } },
    },
    orderBy: { completedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            My Quiz Attempts & Scores
          </h1>
          <p className="text-xs text-slate-500">
            Performance scorecards and conceptual breakdown for all completed mock tests
          </p>
        </div>
        <Link
          href="/quizzes"
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white"
        >
          Take New Test
        </Link>
      </div>

      {attempts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800 space-y-3">
          <Award className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Quizzes Attempted</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Take timed chapter quizzes to test your engineering concepts before semester exams.
          </p>
          <Link
            href="/quizzes"
            className="inline-block px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white"
          >
            Practice Now
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {attempts.map((att) => (
            <div
              key={att.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  {att.quiz.subject.code}: {att.quiz.subject.name}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {att.quiz.title}
                </h3>
                <div className="text-xs text-slate-400 flex items-center gap-3">
                  <span>Score: {att.score} / {att.totalMarks}</span>
                  <span>•</span>
                  <span>Accuracy: {att.percentage}%</span>
                  <span>•</span>
                  <span>Completed {formatDate(att.completedAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    att.passed
                      ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600"
                      : "bg-rose-50 dark:bg-rose-950 text-rose-600"
                  }`}
                >
                  {att.passed ? "Passed" : "Needs Review"}
                </span>
                <Link
                  href={`/quizzes/${att.quizId}/attempt`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
