"use client";

import { useState, useEffect } from "react";
import StudentSidebar from "@/components/student/StudentSidebar";
import Link from "next/link";
import {
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function StudentAttendancePage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tools/attendance")
      .then((r) => r.json())
      .then((data) => {
        if (data?.subjects) setSubjects(data.subjects);
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
            <div className="bg-linear-to-r from-teal-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent text-xs font-semibold mb-3 border border-white/10">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>College Attendance Portal</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black">
                  My Attendance Overview
                </h1>
                <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-xl">
                  Stay above the mandatory 75% university criteria and know exactly when you can take a leave.
                </p>
              </div>

              <Link
                href="/tools/attendance-tracker"
                className="px-5 py-2.5 rounded-xl bg-surface text-teal-900 font-bold text-xs shadow-md hover:bg-teal-50 transition shrink-0 inline-flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" /> Open Bunk Calculator
              </Link>
            </div>

            {/* Subjects List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subjects.map((sub) => {
                const attended = Number(sub.attendedClasses);
                const total = Number(sub.totalClasses);
                const pct = total > 0 ? Math.round((attended / total) * 100) : 0;
                const isSafe = pct >= sub.minimumPercentage;

                return (
                  <div
                    key={sub.id}
                    className="p-5 rounded-2xl bg-surface border border-line shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-sm text-ink">
                          {sub.subjectName}
                        </h4>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            isSafe
                              ? "bg-ok-soft text-ok"
                              : "bg-danger-soft text-danger"
                          }`}
                        >
                          {pct}%
                        </span>
                      </div>
                      <span className="text-xs text-ink-3">
                        {attended} / {total} classes attended (Target: {sub.minimumPercentage}%)
                      </span>
                    </div>

                    <div className="w-full bg-surface-2 h-2 rounded-full overflow-hidden mt-4">
                      <div
                        className={`h-full rounded-full ${
                          isSafe ? "bg-ok" : "bg-danger"
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
