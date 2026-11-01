"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { reward } from "@/lib/reward";
import {
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

export default function DoubtsFeedPage() {
  const [doubts, setDoubts] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Ask Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    subjectId: "",
    tags: "",
  });

  const fetchDoubts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (selectedSubject) params.append("subjectId", selectedSubject);
    if (selectedStatus === "resolved") params.append("resolved", "true");
    if (selectedStatus === "unresolved") params.append("resolved", "false");

    try {
      const res = await fetch(`/api/doubts?${params.toString()}`);
      const data = await res.json();
      if (data?.doubts) setDoubts(data.doubts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/academic/subjects")
      .then((r) => (r.ok ? r.json() : { subjects: [] }))
      .then((d) => {
        if (d?.subjects) setSubjects(d.subjects);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchDoubts();
  }, [search, selectedSubject, selectedStatus]);

  const handleCreateDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/doubts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.status === 401) {
        alert("Please log in to ask a question in the community forum!");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setModalOpen(false);
        setForm({ title: "", content: "", subjectId: "", tags: "" });
        reward({ xp: data.xpEarned, reason: "Doubt posted" });
        fetchDoubts();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to create doubt");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-surface-2 flex flex-col font-sans transition-colors">
      
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="bg-linear-to-r from-brand via-brand to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-accent text-xs font-semibold mb-4 border border-white/10">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>B.Tech Community Q&A & Peer Problem Solving</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
              Doubt Clearing Forum
            </h1>
            <p className="text-brand text-sm sm:text-base leading-relaxed mb-6">
              Stuck on an algorithm, proof, or numerical problem? Ask questions, get verified solutions
              from top students and faculty, and earn reputation points.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface text-brand font-bold text-sm shadow-md hover:bg-brand-soft transition-all"
            >
              <Plus className="w-4 h-4" /> Ask a Question
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface rounded-2xl p-4 sm:p-5 border border-line shadow-xs mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-ink-3 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search questions or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs rounded-xl border border-line bg-surface-2 text-ink w-52 sm:w-64"
              />
            </div>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-line bg-surface-2 text-ink-2"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-line bg-surface-2 text-ink-2"
            >
              <option value="">All Questions</option>
              <option value="resolved">Resolved with Solution</option>
              <option value="unresolved">Unresolved (Needs Answer)</option>
            </select>
          </div>

          <span className="text-xs font-bold text-ink-3">
            {doubts.length} Questions Found
          </span>
        </div>

        {/* Doubts Feed */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-ink-3 text-sm">Loading community doubts...</p>
          </div>
        ) : doubts.length === 0 ? (
          <div className="bg-surface rounded-2xl p-12 text-center border border-line">
            <MessageSquare className="w-12 h-12 text-ink-3 mx-auto mb-3" />
            <h3 className="text-base font-bold text-ink mb-1">
              No Doubts Found
            </h3>
            <p className="text-xs text-ink-3 mb-4">
              Be the first to ask an engineering question in this category!
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-brand text-white rounded-xl text-xs font-bold hover:bg-brand-strong"
            >
              Ask First Question
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {doubts.map((doubt) => (
              <Link
                key={doubt.id}
                href={`/doubts/${doubt.id}`}
                className="block bg-surface rounded-2xl border border-line p-6 shadow-xs hover:border-brand hover:shadow-md transition group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {doubt.isResolved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-ok-soft text-ok border border-ok/35">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-2 text-ink-2">
                        Open
                      </span>
                    )}

                    {doubt.subject && (
                      <span className="text-xs font-bold text-brand">
                        {doubt.subject.code} • {doubt.subject.name}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-ink-3 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(doubt.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-ink group-hover:text-brand transition mb-2">
                  {doubt.title}
                </h3>

                <p className="text-xs text-ink-2 line-clamp-2 mb-4 leading-relaxed">
                  {doubt.content}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-linear-to-tr from-brand to-accent text-white font-bold text-[10px] flex items-center justify-center uppercase">
                      {doubt.user?.name?.[0] || "U"}
                    </div>
                    <span className="font-semibold text-ink-2">
                      {doubt.user?.name}
                    </span>
                    <span className="text-ink-3 text-[11px]">
                      ({doubt.user?.college || doubt.user?.branch || "Student"})
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-ink-3">
                    <span className="flex items-center gap-1 font-semibold">
                      <ThumbsUp className="w-3.5 h-3.5" /> {doubt.upvotes} Upvotes
                    </span>
                    <span className="flex items-center gap-1 font-bold text-brand">
                      <MessageSquare className="w-3.5 h-3.5" /> {doubt._count?.answers || 0} Answers
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Ask Doubt Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-line shadow-2xl">
            <h3 className="text-lg font-bold text-ink mb-4">
              Ask an Engineering Question
            </h3>
            <form onSubmit={handleCreateDoubt} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Question Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How to trace LR rotation in an AVL tree with balance factor 2?"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-line bg-surface-2 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Subject</label>
                <select
                  value={form.subjectId}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-line bg-surface-2 font-semibold"
                >
                  <option value="">General Engineering Question</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Detailed Problem Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Include code snippets, formula definitions, or university paper year..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-line bg-surface-2 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Topic Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. AVL, BST, Recursion, AKTU 2024"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-line bg-surface-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-ink-3 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand text-white font-bold hover:bg-brand-strong"
                >
                  Post Question (+10 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

          </div>
  );
}
