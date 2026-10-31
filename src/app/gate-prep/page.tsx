"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Download,
  BarChart2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function GatePrepPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [weightage, setWeightage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // User answers map: { [questionId]: selectedOption }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/placement/gate")
      .then((r) => r.json())
      .then((data) => {
        if (data?.questions) setQuestions(data.questions);
        if (data?.weightage) setWeightage(data.weightage);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSelectOption = (questionId: string, option: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: option }));
    setShowExplanation((prev) => ({ ...prev, [questionId]: true }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex flex-col font-sans transition-colors">
      
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-semibold mb-4 border border-white/10">
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>GATE CS & IT 2025 • High-Yield Topic Prep</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
              GATE Engineering Preparation Hub
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed mb-6">
              Official past year GATE 1-mark and 2-mark questions with step-by-step mathematical proofs,
              subject weightage distribution, and quick formula sheets.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/placement-hub"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-sm shadow-md hover:bg-emerald-50 transition-all"
              >
                Placement DSA Sheet
              </Link>
              <Link
                href="/pyq"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm transition-all border border-white/20"
              >
                University PYQ Papers
              </Link>
            </div>
          </div>
        </div>

        {/* Subject Weightage Breakdown */}
        <div className="bg-white dark:bg-[#1C2541] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-10">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              GATE CSE Subject Weightage Breakdown (Last 10 Years Average)
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {weightage.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800"
              >
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {item.subject}
                </div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {item.marks}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GATE Practice Questions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Previous Year GATE Questions
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              {questions.length} Questions Available
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-500 text-sm">Loading GATE questions...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {questions.map((q, idx) => {
                const selected = selectedAnswers[q.id];
                const isAnswered = Boolean(selected);
                const isCorrect = selected === q.answer;
                const isExpOpen = showExplanation[q.id];

                return (
                  <div
                    key={q.id}
                    className="bg-white dark:bg-[#1C2541] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs border border-emerald-200 dark:border-emerald-800">
                          GATE {q.year}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-800">
                          {q.marks} Mark{q.marks > 1 ? "s" : ""}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold">
                          {q.subject?.name} • {q.topic}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 leading-relaxed">
                      Q{idx + 1}. {q.question}
                    </p>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {q.options?.map((opt: string, optIdx: number) => {
                        let btnStyle =
                          "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80";

                        if (isAnswered) {
                          if (opt === q.answer) {
                            btnStyle =
                              "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold";
                          } else if (opt === selected) {
                            btnStyle =
                              "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300";
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(q.id, opt)}
                            className={`p-3 rounded-xl border text-left text-xs font-medium transition flex items-center justify-between ${btnStyle}`}
                          >
                            <span>
                              <strong>({String.fromCharCode(65 + optIdx)})</strong> {opt}
                            </span>
                            {isAnswered && opt === q.answer && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                            {isAnswered && opt === selected && opt !== q.answer && (
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation Toggle */}
                    {isAnswered && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() =>
                            setShowExplanation((prev) => ({
                              ...prev,
                              [q.id]: !prev[q.id],
                            }))
                          }
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          {isExpOpen ? (
                            <>
                              <ChevronUp className="w-4 h-4" /> Hide Detailed Explanation
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" /> Show Detailed Explanation
                            </>
                          )}
                        </button>

                        {isExpOpen && (
                          <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1.5">
                            <div className="font-bold text-emerald-600 dark:text-emerald-400 uppercase text-[11px]">
                              Correct Answer: {q.answer}
                            </div>
                            <p className="leading-relaxed whitespace-pre-line">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

          </div>
  );
}
