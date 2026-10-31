"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  HelpCircle,
  Loader2,
  X,
  ShieldAlert,
} from "lucide-react";

export default function QuizAttemptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: quizId } = use(params);
  const router = useRouter();

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetch(`/api/quizzes/${quizId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load quiz");
        return res.json();
      })
      .then((data) => {
        setQuiz(data.quiz);
        setTimeLeft((data.quiz?.durationMinutes || 15) * 60);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [quizId]);

  // Countdown timer
  useEffect(() => {
    if (!quiz || timeLeft <= 0 || submitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit when time runs out
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, timeLeft, submitting]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setShowConfirmModal(false);

    try {
      const timeTaken = (quiz?.durationMinutes || 15) * 60 - timeLeft;
      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          timeTakenSeconds: Math.max(1, timeTaken),
        }),
      });

      if (res.status === 401) {
        alert("Please log in to submit your test and save your results.");
        router.push("/login");
        return;
      }

      const result = await res.json();
      if (result.success) {
        sessionStorage.setItem(`quiz_result_${quizId}`, JSON.stringify(result));
        router.push(`/quizzes/${quizId}/result?attemptId=${result.attemptId}`);
      } else {
        alert(result.error || "Submission failed. Please try again.");
        setSubmitting(false);
      }
    } catch (err) {
      console.error("Submission failed:", err);
      alert("An unexpected error occurred during submission.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-slate-400">
        <Loader2 className="w-10 h-10 text-primary-violet animate-spin mb-3" />
        <span className="font-mono text-xs font-semibold">Configuring examination environment...</span>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center text-slate-500 font-mono text-sm">
        Questions for this quiz could not be loaded.
      </div>
    );
  }

  const currentQ = quiz.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Examination Console Bar */}
      <div className="p-4 sm:p-5 rounded-2xl desk-card shadow-glow-sm flex flex-wrap items-center justify-between gap-4 sticky top-4 z-30 border-primary-violet/30">
        <div>
          <span className="font-mono text-xs font-bold text-primary-violet">
            {quiz.subject.code}: {quiz.subject.name}
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
            {quiz.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Timer */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border transition-colors ${
              timeLeft < 180
                ? "bg-rose-500/10 text-rose-400 border-rose-500/40 animate-pulse"
                : "bg-desk-canvas text-accent-amber border-desk-border"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={submitting}
            className="px-4 py-2 rounded-xl font-mono text-xs font-bold bg-primary-violet hover:bg-primary-violet/90 text-white shadow-glow-sm transition-all hover:scale-105"
          >
            {submitting ? "Evaluating..." : "Submit Test"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Question Column */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl desk-card space-y-6">
            {/* Question Header */}
            <div className="flex items-center justify-between border-b border-desk-border pb-3">
              <span className="font-mono text-xs font-bold text-primary-violet uppercase tracking-wider">
                Question {currentIndex + 1} / {quiz.questions.length}
              </span>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-desk-canvas border border-desk-border text-slate-300">
                +{currentQ.marks} Marks {quiz.negativeMarkingRate > 0 && `(-${quiz.negativeMarkingRate})`}
              </span>
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
              {currentQ.questionText}
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt: any, optIdx: number) => {
                const isSelected = answers[currentQ.id] === opt.id;
                const optLetter = String.fromCharCode(65 + optIdx); // A, B, C, D
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setAnswers({
                        ...answers,
                        [currentQ.id]: opt.id,
                      });
                    }}
                    className={`w-full text-left p-4 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-start gap-3 border ${
                      isSelected
                        ? "bg-primary-violet/10 border-primary-violet text-white shadow-glow-sm"
                        : "desk-card hover:border-primary-violet/50 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg font-mono flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? "bg-primary-violet text-white"
                          : "bg-desk-canvas border border-desk-border text-slate-400"
                      }`}
                    >
                      {optLetter}
                    </span>
                    <span className="mt-0.5 flex-1">{opt.optionText}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-6 border-t border-desk-border">
              <button
                onClick={() => {
                  const updated = { ...answers };
                  delete updated[currentQ.id];
                  setAnswers(updated);
                }}
                className="font-mono text-xs text-slate-400 hover:text-rose-400 transition-colors"
              >
                Clear Selection
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl font-mono text-xs font-semibold desk-card hover:border-primary-violet text-slate-300 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  onClick={() =>
                    setCurrentIndex((prev) => Math.min(quiz.questions.length - 1, prev + 1))
                  }
                  disabled={currentIndex === quiz.questions.length - 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl font-mono text-xs font-bold bg-primary-violet hover:bg-primary-violet/90 text-white disabled:opacity-40 shadow-glow-sm"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Question Palette Sidebar */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl desk-card space-y-4">
            <h3 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
              Question Palette ({answeredCount}/{quiz.questions.length})
            </h3>

            <div className="grid grid-cols-5 gap-2">
              {quiz.questions.map((q: any, i: number) => {
                const isAnswered = Boolean(answers[q.id]);
                const isCurrent = currentIndex === i;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-9 rounded-xl font-mono font-bold text-xs transition-all flex items-center justify-center ${
                      isCurrent
                        ? "ring-2 ring-primary-violet font-extrabold"
                        : ""
                    } ${
                      isAnswered
                        ? "bg-accent-emerald text-white shadow-xs"
                        : "desk-card hover:border-primary-violet text-slate-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-desk-border space-y-2 font-mono text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-accent-emerald" />
                <span>Attempted ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-desk-card border border-desk-border" />
                <span>Unattempted ({quiz.questions.length - answeredCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md desk-card rounded-2xl p-6 shadow-2xl space-y-4 border-primary-violet/40">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-accent-amber" /> Confirm Test Submission?
            </h3>
            <p className="font-mono text-xs text-slate-300 leading-relaxed">
              You have answered <span className="font-bold text-accent-cyan">{answeredCount}</span> out of{" "}
              <span className="font-bold text-white">{quiz.questions.length}</span> questions. Once submitted, your
              answers will be automatically graded on the server.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 font-mono text-xs font-semibold text-slate-300 hover:text-white desk-card rounded-xl"
              >
                Continue Test
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2 font-mono text-xs font-bold text-white bg-primary-violet hover:bg-primary-violet/90 rounded-xl shadow-glow-sm"
              >
                {submitting ? "Submitting..." : "Yes, Submit Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
