"use client";

import { useState, useEffect } from "react";
import StudentSidebar from "@/components/student/StudentSidebar";
import Link from "next/link";
import {
  Briefcase,
  Code2,
  CheckCircle2,
  RotateCcw,
  ExternalLink,
  Award,
  Sparkles,
  FileText,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function StudentPlacementPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/placement/dsa")
      .then((r) => r.json())
      .then((data) => {
        if (data?.problems) setProblems(data.problems);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const solved = problems.filter((p) => p.status === "SOLVED");
  const revise = problems.filter((p) => p.status === "REVISE");
  const todo = problems.filter((p) => p.status === "TODO");

  const progressPercent = problems.length > 0 ? Math.round((solved.length / problems.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-surface-2 flex flex-col font-sans transition-colors">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <StudentSidebar />

          <main className="flex-1 w-full space-y-6">
            {/* Header */}
            <div className="bg-linear-to-r from-brand to-blue-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent text-xs font-semibold mb-3 border border-white/10">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Student Placement Tracker</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black">
                  My DSA & Placement Progress
                </h1>
                <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
                  Track your solved coding problems, review marked problems, and jump to company tests.
                </p>
              </div>

              <Link
                href="/tools/resume-builder"
                className="px-5 py-2.5 rounded-xl bg-surface text-brand font-bold text-xs shadow-md hover:bg-blue-50 transition shrink-0 inline-flex items-center gap-2"
              >
                <FileText className="w-4 h-4" /> Edit Resume
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface p-5 rounded-2xl border border-line shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
                    Solved Problems
                  </span>
                  <div className="text-2xl font-black text-ok mt-1">
                    {solved.length} / {problems.length}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-ok-soft text-ok flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-surface p-5 rounded-2xl border border-line shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
                    Review Needed
                  </span>
                  <div className="text-2xl font-black text-warn mt-1">
                    {revise.length}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-warn-soft text-warn flex items-center justify-center font-bold">
                  <RotateCcw className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-surface p-5 rounded-2xl border border-line shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
                    Completion Rate
                  </span>
                  <div className="text-2xl font-black text-brand mt-1">
                    {progressPercent}%
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Solved Problems List */}
            <div className="bg-surface rounded-2xl p-6 border border-line shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-ink flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-brand" />
                  Your Solved Problems
                </h3>
                <Link
                  href="/placement-hub"
                  className="text-xs font-bold text-brand hover:underline"
                >
                  Explore All 450 Problems →
                </Link>
              </div>

              {solved.length === 0 ? (
                <div className="py-12 text-center text-ink-3 text-xs">
                  You haven't marked any problems as solved yet. Visit the{" "}
                  <Link href="/placement-hub" className="text-brand font-bold underline">
                    Placement Hub
                  </Link>{" "}
                  to start solving!
                </div>
              ) : (
                <div className="divide-y divide-line text-xs">
                  {solved.map((p) => (
                    <div
                      key={p.id}
                      className="py-3 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-ok shrink-0" />
                        <div>
                          <span className="font-bold text-ink">
                            {p.title}
                          </span>
                          <span className="ml-2 text-[10px] text-ink-3">
                            ({p.category} • {p.difficulty})
                          </span>
                        </div>
                      </div>

                      <a
                        href={p.leetcodeUrl || p.gfgUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ink-3 hover:text-brand flex items-center gap-1 font-semibold"
                      >
                        Code <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
