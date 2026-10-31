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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex flex-col font-sans transition-colors">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <StudentSidebar />

          <main className="flex-1 w-full space-y-6">
            <div className="bg-gradient-to-r from-violet-900 to-indigo-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold mb-3 border border-white/10">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Exam Preparation & Revision Hub</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black">
                  My Active Study Plans & Targets
                </h1>
                <p className="text-indigo-100 text-xs sm:text-sm mt-1 max-w-xl">
                  Stay organized before semester finals with customized daily milestones.
                </p>
              </div>

              <Link
                href="/study-planner"
                className="px-5 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs shadow-md hover:bg-indigo-50 transition shrink-0 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create New Plan
              </Link>
            </div>

            {/* Plans List */}
            {targets.length === 0 ? (
              <div className="bg-white dark:bg-[#1C2541] rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
                <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                  No Exam Plans Configured
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Set an upcoming exam date to auto-generate a structured day-by-day checklist.
                </p>
                <Link
                  href="/study-planner"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                >
                  Generate Plan Now
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {targets.map((t) => (
                  <div
                    key={t.id}
                    className="p-6 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                          {t.subjectName}
                        </h3>
                        <span className="text-xs text-slate-500">
                          Exam Date: {new Date(t.examDate).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        Target: {t.targetScore}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {t.studyPlan?.slice(0, 4).map((d: any) => (
                        <div
                          key={d.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800"
                        >
                          <span className="font-bold block text-indigo-600 dark:text-indigo-400">
                            Day {d.dayNumber}
                          </span>
                          <span className="text-slate-700 dark:text-slate-300 font-semibold line-clamp-1">
                            {d.title}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <Link
                        href="/study-planner"
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
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
