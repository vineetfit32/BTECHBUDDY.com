"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Send,
  Award,
  ShieldCheck,
  Flag,
} from "lucide-react";

export default function SingleDoubtPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: doubtId } = use(params);
  const [doubt, setDoubt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Spam / Inappropriate Content");
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const fetchDoubt = async () => {
    try {
      const [dRes, uRes] = await Promise.all([
        fetch(`/api/doubts/${doubtId}`).then((r) => r.json()),
        fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)),
      ]);
      if (dRes?.doubt) setDoubt(dRes.doubt);
      if (uRes?.user) setCurrentUser(uRes.user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubt();
  }, [doubtId]);

  const handleVote = async (targetId: string, type: "DOUBT" | "ANSWER") => {
    try {
      const res = await fetch(`/api/doubts/${targetId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (res.status === 401) {
        alert("Please log in to vote!");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        if (type === "DOUBT") {
          setDoubt((prev: any) => ({ ...prev, upvotes: data.upvotes }));
        } else {
          setDoubt((prev: any) => ({
            ...prev,
            answers: prev.answers.map((a: any) =>
              a.id === targetId ? { ...a, upvotes: data.upvotes } : a
            ),
          }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      const res = await fetch(`/api/doubts/${doubtId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerId }),
      });

      if (res.ok) {
        setStatusNotice("Answer marked as accepted solution! +35 XP awarded to author.");
        fetchDoubt();
        setTimeout(() => setStatusNotice(null), 3500);
      } else {
        const d = await res.json();
        alert(d.error || "Failed to accept answer");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || replyLoading) return;

    setReplyLoading(true);
    try {
      const res = await fetch(`/api/doubts/${doubtId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText }),
      });

      if (res.status === 401) {
        alert("Please sign in to post your answer!");
        return;
      }

      if (res.ok) {
        setReplyText("");
        setStatusNotice("Answer published! You earned +20 XP.");
        fetchDoubt();
        setTimeout(() => setStatusNotice(null), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleReportPost = async () => {
    try {
      const res = await fetch("/api/doubts/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REPORT_POST",
          postId: doubtId,
          reason: reportReason,
        }),
      });

      if (res.ok) {
        setReportModalOpen(false);
        setStatusNotice("Report submitted to moderation queue.");
        setTimeout(() => setStatusNotice(null), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex flex-col font-sans transition-colors">
                <div className="py-24 text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 text-sm">Loading discussion thread...</p>
        </div>
              </div>
    );
  }

  if (!doubt) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex flex-col font-sans transition-colors">
                <div className="py-24 text-center max-w-md mx-auto px-4">
          <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
            Question Not Found
          </h2>
          <Link href="/doubts" className="text-xs font-bold text-indigo-600 hover:underline">
            ← Back to Doubt Forum
          </Link>
        </div>
              </div>
    );
  }

  const isAuthor = currentUser && currentUser.id === doubt.userId;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex flex-col font-sans transition-colors">
      
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <Link
          href="/doubts"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Doubt Feed
        </Link>

        {statusNotice && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Question Container */}
        <div className="bg-white dark:bg-[#1C2541] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm mb-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {doubt.isResolved ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  Open Question
                </span>
              )}

              {doubt.subject && (
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  {doubt.subject.code} • {doubt.subject.name}
                </span>
              )}
            </div>

            <button
              onClick={() => setReportModalOpen(true)}
              className="text-slate-400 hover:text-rose-600 text-xs flex items-center gap-1"
              title="Report Question"
            >
              <Flag className="w-3.5 h-3.5" /> Report
            </button>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-snug">
            {doubt.title}
          </h1>

          <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line py-2">
            {doubt.content}
          </div>

          {doubt.tags && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {doubt.tags.split(",").map((t: string) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium"
                >
                  #{t.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Author Details & Upvote */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center uppercase">
                {doubt.user?.name?.[0] || "U"}
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  {doubt.user?.name}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {doubt.user?.college || doubt.user?.branch || "Student"} •{" "}
                  {new Date(doubt.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleVote(doubt.id, "DOUBT")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 font-bold transition"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{doubt.upvotes} Upvotes</span>
            </button>
          </div>
        </div>

        {/* Answers Section */}
        <div className="space-y-6 mb-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              {doubt.answers?.length || 0} Community Answers
            </h2>
          </div>

          {doubt.answers?.map((ans: any) => (
            <div
              key={ans.id}
              className={`p-6 rounded-2xl border transition-all ${
                ans.isAccepted
                  ? "bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-400 dark:border-emerald-800 shadow-sm"
                  : "bg-white dark:bg-[#1C2541] border-slate-200 dark:border-slate-800 shadow-sm"
              }`}
            >
              {/* Badges: Accepted & Verified */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  {ans.isAccepted && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-xs">
                      <CheckCircle2 className="w-4 h-4" /> Accepted Solution
                    </span>
                  )}
                  {ans.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Faculty Verified
                    </span>
                  )}
                </div>

                {isAuthor && !ans.isAccepted && (
                  <button
                    onClick={() => handleAcceptAnswer(ans.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold transition border border-emerald-200 dark:border-emerald-800"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Accept as Best Solution
                  </button>
                )}
              </div>

              {/* Answer Content */}
              <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line mb-4">
                {ans.content}
              </div>

              {/* Author & Upvote */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center uppercase">
                    {ans.user?.name?.[0] || "U"}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {ans.user?.name}
                    </span>
                    <span className="text-slate-400 text-[11px] ml-1.5">
                      {ans.user?.role === "INSTRUCTOR" ? "Faculty" : "Student"} •{" "}
                      {new Date(ans.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleVote(ans.id, "ANSWER")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 font-bold transition"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{ans.upvotes} Helpful</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Answer Submission Form */}
        <div className="bg-white dark:bg-[#1C2541] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
            Your Answer / Solution
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Provide clear step-by-step logic, proofs, or code snippets to help the student understand.
          </p>

          <form onSubmit={handlePostAnswer} className="space-y-4">
            <textarea
              rows={4}
              required
              placeholder="Write your explanation or proof here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-100"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={replyLoading || !replyText.trim()}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Post Answer (+20 XP)</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C2541] rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-600" /> Report Question
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select reason for reporting this doubt to platform moderators:
            </p>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold mb-4"
            >
              <option value="Spam / Inappropriate Content">Spam / Inappropriate Content</option>
              <option value="Incorrect or Misleading Question">Incorrect or Misleading Question</option>
              <option value="Offensive Language">Offensive Language</option>
              <option value="Duplicate Post">Duplicate Post</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-500 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReportPost}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

          </div>
  );
}
