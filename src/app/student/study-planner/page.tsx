"use client";

import { useState, useEffect } from "react";
import StudentSidebar from "@/components/student/StudentSidebar";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Plus,
  Sparkles,
  RotateCw,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function StudentStudyPlannerPage() {
  const [targets, setTargets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/study-planner")
      .then((r) => r.json())
      .then((data) => {
        if (data?.targets) setTargets(data.targets);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-surface-2 flex flex-col font-sans transition-colors">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <StudentSidebar />

          <main className="flex-1 w-full space-y-6">
            <div className="bg-linear-to-r from-brand to-brand p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent text-xs font-semibold mb-3 border border-white/10">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Exam Preparation & Revision Hub</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black">
                  My Active Study Plans & Targets
                </h1>
                <p className="text-brand text-xs sm:text-sm mt-1 max-w-xl">
                  Stay organized before semester finals with customized daily milestones.
                </p>
              </div>

              <Link
                href="/study-planner"
                className="px-5 py-2.5 rounded-xl bg-surface text-brand font-bold text-xs shadow-md hover:bg-brand-soft transition shrink-0 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create New Plan
              </Link>
            </div>

            {/* Plans List */}
            {targets.length === 0 ? (
              <div className="bg-surface rounded-2xl p-12 text-center border border-line shadow-xs">
                <Calendar className="w-12 h-12 text-ink-3 mx-auto mb-3" />
                <h3 className="text-base font-bold text-ink mb-1">
                  No Exam Plans Configured
                </h3>
                <p className="text-xs text-ink-3 mb-4">
                  Set an upcoming exam date to auto-generate a structured day-by-day checklist.
                </p>
                <Link
                  href="/study-planner"
                  className="px-4 py-2 bg-brand text-white rounded-xl text-xs font-bold hover:bg-brand-strong"
                >
                  Generate Plan Now
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {targets.map((t) => (
                  <div
                    key={t.id}
                    className="p-6 rounded-2xl bg-surface border border-line shadow-xs"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-base text-ink">
                          {t.subjectName}
                        </h3>
                        <span className="text-xs text-ink-3">
                          Exam Date: {new Date(t.examDate).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 bg-brand-soft text-brand rounded-xl">
                        Target: {t.targetScore}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {t.studyPlan?.slice(0, 4).map((d: any) => (
                        <div
                          key={d.id}
                          className="p-3 rounded-xl bg-surface-2 border border-line/80"
                        >
                          <span className="font-bold block text-brand">
                            Day {d.dayNumber}
                          </span>
                          <span className="text-ink-2 font-semibold line-clamp-1">
                            {d.title}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-line flex justify-end">
                      <Link
                        href="/study-planner"
                        className="text-xs font-bold text-brand hover:underline"
                      >
                        Open Full Interactive Checklist →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
