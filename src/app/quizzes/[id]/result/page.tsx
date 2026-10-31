"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import Breadcrumbs from "@/components/design-system/Breadcrumbs";

export default function QuizResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: quizId } = use(params);
  const router = useRouter();
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem(`quiz_result_${quizId}`);
    if (cached) {
      try {
        setResult(JSON.parse(cached));
      } catch (err) {
        console.error("Failed to parse cached result", err);
      }
    }
  }, [quizId]);

  if (!result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          No active test submission found
        </h2>
        <p className="font-mono text-xs text-slate-400">
          Your test session may have expired or was opened in another window.
        </p>
        <Link
          href={`/quizzes/${quizId}`}
          className="inline-block px-5 py-2.5 rounded-xl font-mono text-xs font-bold bg-primary-violet text-white shadow-glow-sm"
        >
          Take Quiz Now
        </Link>
      </div>
    );
  }

  const { score, totalMarks, percentage, passed, timeTakenSeconds, feedback } = result;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs
        items={[
          { label: "Quizzes", href: "/quizzes" },
          { label: "Test Results" },
        ]}
      />

      {/* Result Card Banner */}
      <div
        className={`p-8 sm:p-10 rounded-3xl text-center space-y-4 desk-card shadow-glow-sm relative overflow-hidden ${
          passed
            ? "border-accent-emerald/40"
            : "border-rose-500/40"
        }`}
      >
        <div className="inline-flex p-3 rounded-2xl desk-card shadow-md mx-auto">
          {passed ? (
            <Award className="w-10 h-10 text-accent-emerald" />
          ) : (
            <HelpCircle className="w-10 h-10 text-rose-500" />
          )}
        </div>

        <div className="space-y-1">
          <span
            className={`inline-block px-3 py-1 rounded-full font-mono text-xs font-bold uppercase tracking-wider ${
              passed
                ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
            }`}
          >
            {passed ? "Assessment Passed" : "Needs Review"}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            {passed ? "Excellent Performance!" : "Good Effort, Keep Practicing!"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            {passed
              ? "You demonstrated strong conceptual mastery in this subject area."
              : "Review the question explanations below to solidify your exam readiness."}
          </p>
        </div>

        {/* Big Score Numbers */}
        <div className="flex justify-center items-center gap-6 pt-4">
          <div className="text-center">
            <div className="font-mono text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
              {score} / {totalMarks}
            </div>
            <div className="font-mono text-xs text-slate-400 font-semibold mt-1">Final Score</div>
          </div>
          <div className="h-12 w-px bg-desk-border" />
          <div className="text-center">
            <div className="font-mono text-3xl sm:text-5xl font-black text-primary-violet">
              {percentage}%
            </div>
            <div className="font-mono text-xs text-slate-400 font-semibold mt-1">Accuracy</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <Link
            href={`/quizzes/${quizId}/attempt`}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-mono text-xs font-bold bg-primary-violet hover:bg-primary-violet/90 text-white shadow-glow-sm transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Retake Test
          </Link>
          <Link
            href="/quizzes"
            className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold desk-card text-slate-300 hover:border-primary-violet transition-colors"
          >
            All Practice Quizzes
          </Link>
        </div>
      </div>

      {/* Question Feedback Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Detailed Solutions & Conceptual Explanations
        </h2>

        <div className="space-y-4">
          {feedback.map((item: any, idx: number) => (
            <div
              key={item.questionId}
              className={`p-6 rounded-2xl desk-card transition-all ${
                item.isCorrect
                  ? "border-accent-emerald/40"
                  : "border-rose-500/40"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg font-mono desk-card text-slate-300 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </span>
                  <span
                    className={`font-mono text-xs font-bold flex items-center gap-1 ${
                      item.isCorrect ? "text-accent-emerald" : "text-rose-400"
                    }`}
                  >
                    {item.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Correct Answer (+{item.marks})
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" /> Incorrect Answer
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 leading-relaxed">
                {item.questionText}
              </div>

              {/* In-depth explanation box */}
              {item.explanation && (
                <div className="p-4 rounded-xl desk-card border-primary-violet/30 text-xs text-slate-300 space-y-1">
                  <div className="font-mono font-bold text-primary-violet flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent-cyan" /> Conceptual Explanation
                  </div>
                  <p className="leading-relaxed text-slate-300">{item.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
