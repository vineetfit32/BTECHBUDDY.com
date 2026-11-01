"use client";

import { useState, useEffect } from "react";
import StudentSidebar from "@/components/student/StudentSidebar";
import Link from "next/link";
import {
  TrendingUp,
  Award,
  Calendar,
  Sparkles,
  Calculator,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function StudentGradesPage() {
  const [gradeRecords, setGradeRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tools/grades")
      .then((r) => r.json())
      .then((data) => {
        if (data?.results) setGradeRecords(data.results);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Compute overall average SGPA
  const avgSgpa =
    gradeRecords.length > 0
      ? (
          gradeRecords.reduce((sum, r) => sum + r.sgpa, 0) / gradeRecords.length
        ).toFixed(2)
      : "0.00";

  return (
    <div className="min-h-screen bg-surface-2 flex flex-col font-sans transition-colors">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <StudentSidebar />

          <main className="flex-1 w-full space-y-6">
            <div className="bg-linear-to-r from-brand to-blue-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent text-xs font-semibold mb-3 border border-white/10">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Academic Transcript & Progression</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black">
                  My Semester Grades & SGPA History
                </h1>
                <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
                  Track your semester grade point averages, credit totals, and official university percentage conversions.
                </p>
              </div>

              <Link
                href="/tools/sgpa-cgpa-calculator"
                className="px-5 py-2.5 rounded-xl bg-surface text-brand font-bold text-xs shadow-md hover:bg-blue-50 transition shrink-0 inline-flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" /> Calculate New Semester
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface p-5 rounded-2xl border border-line shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
                    Average SGPA
                  </span>
                  <div className="text-2xl font-black text-brand mt-1">
                    {avgSgpa}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-surface p-5 rounded-2xl border border-line shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
                    Semesters Recorded
                  </span>
                  <div className="text-2xl font-black text-ink mt-1">
                    {gradeRecords.length}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-ok-soft text-ok flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-surface p-5 rounded-2xl border border-line shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
                    Total Credits Earned
                  </span>
                  <div className="text-2xl font-black text-ink mt-1">
                    {gradeRecords.reduce((sum, r) => sum + r.totalCredits, 0)}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-warn-soft text-warn flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Semester History Table */}
            <div className="bg-surface rounded-2xl border border-line p-6 shadow-xs">
              <h3 className="text-base font-bold text-ink mb-4">
                Saved Semester Grade Reports
              </h3>

              {gradeRecords.length === 0 ? (
                <div className="py-12 text-center text-ink-3 text-xs">
                  No semester records saved yet. Use the{" "}
                  <Link
                    href="/tools/sgpa-cgpa-calculator"
                    className="text-brand font-bold underline"
                  >
                    SGPA Calculator
                  </Link>{" "}
                  to calculate and save your first semester!
                </div>
              ) : (
                <div className="space-y-4">
                  {gradeRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-4 rounded-xl bg-surface-2 border border-line/80"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span className="text-sm font-bold text-ink">
                          Semester {record.semesterNumber}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-brand-soft text-brand">
                            SGPA: {record.sgpa.toFixed(2)}
                          </span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-ok-soft text-ok">
                            {record.percentage ? `${record.percentage.toFixed(1)}%` : "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-ink-2">
                        {record.subjects?.map((sub: any, i: number) => (
                          <div key={i} className="truncate">
                            • {sub.name}: <strong>{sub.grade}</strong> ({sub.credits}C)
                          </div>
                        ))}
                      </div>
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
