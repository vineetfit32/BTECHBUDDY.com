"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { reward } from "@/lib/reward";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  FileText,
  HelpCircle,
  Filter,
} from "lucide-react";

export default function SubjectImportantQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: subjectId } = use(params);
  const [subject, setSubject] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [repeatedTopics, setRepeatedTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedMarks, setSelectedMarks] = useState<string>("");
  const [onlyImportant, setOnlyImportant] = useState<boolean>(false);

  // Expanded solutions map
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});
  useEffect(() => {
    // Load subject details, questions, and repeated topics
    Promise.all([
      fetch(`/api/academic/subjects/${subjectId}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/pyq/questions?subjectId=${subjectId}`).then((r) => r.json()),
      fetch(`/api/pyq/repeated-topics?subjectId=${subjectId}`).then((r) => r.json()),
    ])
      .then(([subData, qData, topicsData]) => {
        if (subData?.subject) setSubject(subData.subject);
        if (qData?.questions) setQuestions(qData.questions);
        if (topicsData?.topics) setRepeatedTopics(topicsData.topics);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading subject important questions:", err);
        setLoading(false);
      });
  }, [subjectId]);

  const toggleSolution = (id: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleAttempt = async (questionId: string) => {
    try {
      const res = await fetch(`/api/pyq/questions/${questionId}/attempt`, {
        method: "POST",
      });
      if (res.status === 401) {
        alert("Please sign in to track your solved questions and earn XP!");
        return;
      }
      const data = await res.json();
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, isAttempted: data.attempted } : q))
      );
      if (data.attempted && data.xpEarned) {
        reward({ xp: data.xpEarned, reason: "Question practised" });
      }
    } catch (err) {
      console.error("Failed to toggle attempt:", err);
    }
  };

  const handleToggleBookmark = async (questionId: string) => {
    try {
      const res = await fetch(`/api/pyq/questions/${questionId}/bookmark`, {
        method: "POST",
      });
      if (res.status === 401) {
        alert("Please sign in to save bookmarks!");
        return;
      }
      const data = await res.json();
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, isBookmarked: data.bookmarked } : q))
      );
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (selectedUnit && q.unitId !== selectedUnit) return false;
    if (selectedDifficulty && q.difficulty !== selectedDifficulty) return false;
    if (selectedMarks && q.marks !== Number(selectedMarks)) return false;
    if (onlyImportant && !q.isImportant) return false;
    return true;
  });

  const attemptedCount = questions.filter((q) => q.isAttempted).length;
  const progressPercent = questions.length > 0 ? Math.round((attemptedCount / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-surface-2 flex flex-col font-sans transition-colors">
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Back Link */}
        <Link
          href={`/subjects/${subjectId}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-3 hover:text-brand mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Subject Overview
        </Link>

        {/* Hero Header */}
        <div className="bg-linear-to-r from-brand via-blue-700 to-brand rounded-3xl p-8 sm:p-10 text-white shadow-xl mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent text-xs font-semibold mb-3 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Repeated Exam Topics & Question Bank</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
                {subject?.name || "Subject Questions"} ({subject?.code || "..."})
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
                High-probability questions repeated across past university end-term examinations with
                verified step-by-step solutions and marks weighting.
              </p>
            </div>

            {/* Student Progress Pill */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 min-w-[200px] shrink-0 text-center">
              <span className="text-xs uppercase font-bold text-accent tracking-wider">
                Practice Progress
              </span>
              <div className="text-3xl font-black my-1">
                {attemptedCount} <span className="text-lg font-normal text-blue-200">/ {questions.length}</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-accent h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[11px] text-blue-200 mt-1.5 block">
                {progressPercent}% Questions Solved
              </span>
            </div>
          </div>
        </div>

        {/* Repeated Topics Analytics Section */}
        {repeatedTopics.length > 0 && (
          <div className="bg-surface rounded-2xl p-6 border border-line shadow-xs mb-10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-brand" />
              <h2 className="text-base font-bold text-ink">
                Most Repeated Exam Topics (Past 5 Years)
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {repeatedTopics.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-surface-2 border border-line/80 flex items-center justify-between"
                >
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold text-ink block truncate">
                      {item.topic}
                    </span>
                    <span className="text-[11px] text-ink-3">
                      Avg: {item.averageMarks} Marks
                    </span>
                  </div>
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-danger-soft text-danger text-xs font-extrabold shrink-0 border border-danger/35">
                    {item.frequency}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters Bar */}
        <div className="bg-surface rounded-2xl p-4 sm:p-5 border border-line shadow-xs mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Unit Filter */}
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-line bg-surface-2 text-ink-2"
            >
              <option value="">All Syllabus Units</option>
              {subject?.units?.map((u: any) => (
                <option key={u.id} value={u.id}>
                  Unit {u.unitNumber}: {u.title}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-line bg-surface-2 text-ink-2"
            >
              <option value="">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>

            {/* Marks Filter */}
            <select
              value={selectedMarks}
              onChange={(e) => setSelectedMarks(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-line bg-surface-2 text-ink-2"
            >
              <option value="">All Marks</option>
              <option value="5">5 Marks</option>
              <option value="10">10 Marks</option>
            </select>
          </div>

          {/* Only Important Checkbox */}
          <label className="flex items-center gap-2 text-xs font-bold text-ink-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyImportant}
              onChange={(e) => setOnlyImportant(e.target.checked)}
              className="rounded-sm border-line-strong text-brand focus:ring-brand w-4 h-4"
            />
            <span>Show Only High-Probability ⭐</span>
          </label>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-ink-3 text-sm">Loading questions...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="bg-surface rounded-2xl p-12 text-center border border-line">
            <HelpCircle className="w-12 h-12 text-ink-3 mx-auto mb-3" />
            <h3 className="text-base font-bold text-ink mb-1">
              No Questions Match Criteria
            </h3>
            <p className="text-xs text-ink-3">
              Clear your filters or select another syllabus unit.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => {
              const isExpanded = expandedSolutions[q.id];
              return (
                <div
                  key={q.id}
                  className={`bg-surface rounded-2xl border transition-all p-5 sm:p-6 ${
                    q.isAttempted
                      ? "border-ok/35 bg-ok/20"
                      : "border-line hover:border-line-strong"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-brand-soft text-brand border border-brand/35">
                        {q.topicTag}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-warn-soft text-warn border border-warn/80">
                        {q.marks} Marks
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-danger-soft text-danger border border-danger/80">
                        Appeared {q.frequencyCount}x in PYQs
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          q.difficulty === "HARD"
                            ? "bg-danger-soft text-danger"
                            : q.difficulty === "MEDIUM"
                            ? "bg-warn-soft text-warn"
                            : "bg-ok-soft text-ok"
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </div>

                    {/* Bookmark Button */}
                    <button
                      onClick={() => handleToggleBookmark(q.id)}
                      className={`p-2 rounded-xl transition ${
                        q.isBookmarked
                          ? "bg-warn-soft text-warn"
                          : "text-ink-3 hover:text-ink-2"
                      }`}
                      title={q.isBookmarked ? "Remove Bookmark" : "Save Question"}
                    >
                      {q.isBookmarked ? (
                        <BookmarkCheck className="w-5 h-5 text-warn fill-warn" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Question Text */}
                  <p className="text-sm sm:text-base font-semibold text-ink mb-4 leading-relaxed">
                    Q{idx + 1}. {q.questionText}
                  </p>

                  {/* Action Buttons: Solution toggle & Mark Solved */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line">
                    <button
                      onClick={() => toggleSolution(q.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" /> Hide Solution
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" /> View Step-by-Step Solution
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleToggleAttempt(q.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        q.isAttempted
                          ? "bg-ok text-white shadow-2xs"
                          : "bg-surface-2 text-ink-2 hover:bg-surface-3"
                      }`}
                    >
                      {q.isAttempted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-white" /> Solved
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4 text-ink-3" /> Mark as Solved
                        </>
                      )}
                    </button>
                  </div>

                  {/* Solution Expansion */}
                  {isExpanded && (
                    <div className="mt-4 p-4 rounded-xl bg-surface-2 border border-line text-xs sm:text-sm text-ink-2 space-y-2 animate-fadeIn">
                      <div className="flex items-center gap-1.5 text-brand font-bold uppercase tracking-wider text-[11px]">
                        <CheckCircle2 className="w-4 h-4" /> Verified Solution
                      </div>
                      <p className="whitespace-pre-line leading-relaxed">
                        {q.solutionText || "Detailed solution is being transcribed from university answer key."}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

          </div>
  );
}
