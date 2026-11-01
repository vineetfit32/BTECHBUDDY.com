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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-3">
        <div>
          <h1 className="text-2xl font-black text-ink">
            Manage Quizzes & Online Tests
          </h1>
          <p className="text-xs text-ink-3">
            Configure examination timers, multiple choice questions, passing criteria, and review submissions
          </p>
        </div>
        <div className="text-xs font-bold text-ink-3">
          Total Tests: <span className="text-danger font-extrabold">{quizzes.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map((q) => (
          <div
            key={q.id}
            className="p-6 rounded-2xl bg-surface border border-line shadow-2xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand">
                  {q.subject.code}: {q.subject.name}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-surface-2 text-ink-2">
                  {q._count.questions} MCQs
                </span>
              </div>
              <h3 className="text-base font-bold text-ink mt-1">
                {q.title}
              </h3>
              <p className="text-xs text-ink-3 mt-1 line-clamp-2">{q.description}</p>
              <div className="pt-2 flex items-center gap-4 text-xs text-ink-3">
                <span>{q.durationMinutes} Minutes</span>
                <span>•</span>
                <span>Pass: {q.passingMarks} / {q.totalMarks}</span>
                {q.negativeMarkingRate > 0 && <span>• Neg: -{q.negativeMarkingRate}</span>}
              </div>
            </div>

            <div className="pt-3 border-t border-line flex items-center justify-between text-xs">
              <span className="text-ink-3">{q._count.attempts} Student Submissions</span>
              <Link
                href={`/quizzes/${q.id}`}
                className="font-bold text-danger hover:underline"
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
