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
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div>
          <h1 className="text-2xl font-black text-ink">
            My Quiz Attempts & Scores
          </h1>
          <p className="text-xs text-ink-3">
            Performance scorecards and conceptual breakdown for all completed mock tests
          </p>
        </div>
        <Link
          href="/quizzes"
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-warn hover:bg-warn text-white"
        >
          Take New Test
        </Link>
      </div>

      {attempts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface border border-line space-y-3">
          <Award className="w-10 h-10 text-ink-3 mx-auto" />
          <h3 className="text-sm font-bold text-ink">No Quizzes Attempted</h3>
          <p className="text-xs text-ink-3 max-w-sm mx-auto">
            Take timed chapter quizzes to test your engineering concepts before semester exams.
          </p>
          <Link
            href="/quizzes"
            className="inline-block px-4 py-2 rounded-xl text-xs font-bold bg-warn text-white"
          >
            Practice Now
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {attempts.map((att) => (
            <div
              key={att.id}
              className="p-5 rounded-2xl bg-surface border border-line shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brand">
                  {att.quiz.subject.code}: {att.quiz.subject.name}
                </span>
                <h3 className="text-base font-bold text-ink">
                  {att.quiz.title}
                </h3>
                <div className="text-xs text-ink-3 flex items-center gap-3">
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
                      ? "bg-ok-soft text-ok"
                      : "bg-danger-soft text-danger"
                  }`}
                >
                  {att.passed ? "Passed" : "Needs Review"}
                </span>
                <Link
                  href={`/quizzes/${att.quizId}/attempt`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-surface-2 hover:bg-surface-3 text-ink-2"
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
