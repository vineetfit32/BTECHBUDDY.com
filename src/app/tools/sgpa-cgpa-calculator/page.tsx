"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calculator,
  Plus,
  Trash2,
  TrendingUp,
  Save,
  CheckCircle2,
  Sparkles,
  School,
  ArrowRight,
} from "lucide-react";

const GRADE_POINTS: Record<string, number> = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
  P: 4,
  F: 0,
};

export default function SgpaCgpaCalculatorPage() {
  const [activeTab, setActiveTab] = useState<"sgpa" | "cgpa">("sgpa");

  // SGPA State
  const [semesterNumber, setSemesterNumber] = useState(3);
  const [subjects, setSubjects] = useState([
    { name: "Data Structures & Algorithms", credits: 4, grade: "A+" },
    { name: "Discrete Mathematics", credits: 4, grade: "A" },
    { name: "Computer Organization & Architecture", credits: 3, grade: "B+" },
    { name: "Object Oriented Programming (Java)", credits: 3, grade: "O" },
    { name: "Data Structures Lab", credits: 1, grade: "O" },
  ]);

  // University conversion formula selector
  const [universityFormula, setUniversityFormula] = useState<"AKTU" | "AICTE" | "DIRECT">("AKTU");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // CGPA State
  const [semestersList, setSemestersList] = useState([
    { sem: 1, credits: 20, sgpa: 8.2 },
    { sem: 2, credits: 20, sgpa: 8.5 },
    { sem: 3, credits: 22, sgpa: 8.8 },
  ]);

  // Compute SGPA
  const totalCredits = subjects.reduce((sum, s) => sum + Number(s.credits), 0);
  const totalWeightedPoints = subjects.reduce(
    (sum, s) => sum + Number(s.credits) * (GRADE_POINTS[s.grade] || 0),
    0
  );
  const computedSgpa = totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : "0.00";

  // Compute Percentage based on selected university formula
  const numericSgpa = parseFloat(computedSgpa);
  let computedPercentage = 0;
  if (universityFormula === "AKTU") {
    computedPercentage = Math.max(0, (numericSgpa - 0.75) * 10);
  } else if (universityFormula === "AICTE") {
    computedPercentage = numericSgpa * 9.5;
  } else {
    computedPercentage = numericSgpa * 10;
  }

  // Compute CGPA
  const totalCgpaCredits = semestersList.reduce((sum, s) => sum + Number(s.credits), 0);
  const totalCgpaPoints = semestersList.reduce(
    (sum, s) => sum + Number(s.credits) * Number(s.sgpa),
    0
  );
  const computedCgpa =
    totalCgpaCredits > 0 ? (totalCgpaPoints / totalCgpaCredits).toFixed(2) : "0.00";

  const handleAddSubject = () => {
    setSubjects([
      ...subjects,
      { name: `Subject ${subjects.length + 1}`, credits: 3, grade: "A" },
    ]);
  };

  const handleRemoveSubject = (idx: number) => {
    if (subjects.length <= 1) return;
    setSubjects(subjects.filter((_, i) => i !== idx));
  };

  const handleSaveSgpa = async () => {
    try {
      const res = await fetch("/api/tools/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          semesterNumber,
          totalCredits,
          sgpa: numericSgpa,
          percentage: parseFloat(computedPercentage.toFixed(2)),
          subjects,
        }),
      });

      if (res.status === 401) {
        alert("Please log in to save your semester report to your student profile!");
        return;
      }

      if (res.ok) {
        setSaveStatus("Semester report saved to your profile!");
        setTimeout(() => setSaveStatus(null), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex flex-col font-sans transition-colors">
      
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-cyan-300 text-xs font-semibold mb-4 border border-white/10">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Official 10-Point Indian Technical Grading Scale</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
              B.Tech SGPA & CGPA Calculator
            </h1>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-6">
              Calculate semester grade points, cumulative CGPA, and official percentage conversions for
              AKTU, VTU, RTU, SPPU, and AICTE compliant universities. Save reports directly to your profile.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/tools/attendance-tracker"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-800 font-bold text-sm shadow-md hover:bg-blue-50 transition-all"
              >
                Attendance & Bunk Calculator
              </Link>
              <Link
                href="/student/grades"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm transition-all border border-white/20"
              >
                View Saved Records
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setActiveTab("sgpa")}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === "sgpa"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-white dark:bg-[#1C2541] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
            }`}
          >
            <Calculator className="w-4 h-4" />
            Semester SGPA Calculator
          </button>

          <button
            onClick={() => setActiveTab("cgpa")}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === "cgpa"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-white dark:bg-[#1C2541] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Cumulative CGPA Calculator
          </button>
        </div>

        {/* TAB 1: SGPA CALCULATOR */}
        {activeTab === "sgpa" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Subject Input Table */}
            <div className="lg:col-span-8 bg-white dark:bg-[#1C2541] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 uppercase">Semester</span>
                  <select
                    value={semesterNumber}
                    onChange={(e) => setSemesterNumber(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAddSubject}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition"
                >
                  <Plus className="w-4 h-4" /> Add Subject
                </button>
              </div>

              {/* Subject Rows */}
              <div className="space-y-3">
                {subjects.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  >
                    <div className="sm:col-span-6">
                      <input
                        type="text"
                        value={sub.name}
                        onChange={(e) => {
                          const updated = [...subjects];
                          updated[idx].name = e.target.value;
                          setSubjects(updated);
                        }}
                        placeholder="Subject name"
                        className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-bold shrink-0">Credits:</span>
                        <select
                          value={sub.credits}
                          onChange={(e) => {
                            const updated = [...subjects];
                            updated[idx].credits = Number(e.target.value);
                            setSubjects(updated);
                          }}
                          className="w-full px-2 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                        >
                          {[1, 2, 3, 4, 5, 6].map((c) => (
                            <option key={c} value={c}>
                              {c} Credit{c > 1 ? "s" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <select
                        value={sub.grade}
                        onChange={(e) => {
                          const updated = [...subjects];
                          updated[idx].grade = e.target.value;
                          setSubjects(updated);
                        }}
                        className="w-full px-2 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                      >
                        {Object.keys(GRADE_POINTS).map((g) => (
                          <option key={g} value={g}>
                            {g} ({GRADE_POINTS[g]} pts)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-1 text-right">
                      <button
                        onClick={() => handleRemoveSubject(idx)}
                        disabled={subjects.length <= 1}
                        className="text-slate-400 hover:text-rose-500 disabled:opacity-30 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Calculated Result Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-[#1C2541] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Semester {semesterNumber} SGPA
                </span>

                <div className="my-4">
                  <div className="text-6xl font-black text-indigo-600 dark:text-indigo-400">
                    {computedSgpa}
                  </div>
                  <span className="text-xs font-semibold text-slate-400">out of 10.00</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 mb-5 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Credits:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{totalCredits}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Grade Points Sum:</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {totalWeightedPoints}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Percentage:</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {computedPercentage.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* University Formula Switcher */}
                <div className="mb-5 text-left">
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    University Conversion Formula:
                  </label>
                  <select
                    value={universityFormula}
                    onChange={(e: any) => setUniversityFormula(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-semibold"
                  >
                    <option value="AKTU">AKTU / VTU: (SGPA - 0.75) × 10</option>
                    <option value="AICTE">AICTE / CBSE: SGPA × 9.5</option>
                    <option value="DIRECT">Direct 10x: SGPA × 10</option>
                  </select>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveSgpa}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md hover:bg-indigo-700 transition"
                >
                  <Save className="w-4 h-4" /> Save to Student Profile
                </button>

                {saveStatus && (
                  <div className="mt-3 p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{saveStatus}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CGPA CALCULATOR */}
        {activeTab === "cgpa" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-white dark:bg-[#1C2541] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Semester SGPA Breakdown
                </h3>
                <button
                  onClick={() =>
                    setSemestersList([
                      ...semestersList,
                      {
                        sem: semestersList.length + 1,
                        credits: 20,
                        sgpa: 8.0,
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition"
                >
                  <Plus className="w-4 h-4" /> Add Semester
                </button>
              </div>

              <div className="space-y-3">
                {semestersList.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 text-xs"
                  >
                    <span className="font-bold text-slate-800 dark:text-slate-200 w-24">
                      Semester {s.sem}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Credits:</span>
                      <input
                        type="number"
                        value={s.credits}
                        onChange={(e) => {
                          const updated = [...semestersList];
                          updated[idx].credits = Number(e.target.value);
                          setSemestersList(updated);
                        }}
                        className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-bold"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">SGPA:</span>
                      <input
                        type="number"
                        step="0.01"
                        value={s.sgpa}
                        onChange={(e) => {
                          const updated = [...semestersList];
                          updated[idx].sgpa = Number(e.target.value);
                          setSemestersList(updated);
                        }}
                        className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-bold"
                      />
                    </div>

                    <button
                      onClick={() =>
                        setSemestersList(semestersList.filter((_, i) => i !== idx))
                      }
                      disabled={semestersList.length <= 1}
                      className="text-slate-400 hover:text-rose-500 disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white dark:bg-[#1C2541] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Cumulative CGPA
              </span>

              <div className="my-4">
                <div className="text-6xl font-black text-indigo-600 dark:text-indigo-400">
                  {computedCgpa}
                </div>
                <span className="text-xs font-semibold text-slate-400">out of 10.00</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Semesters Evaluated:</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {semestersList.length}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Credits Earned:</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {totalCgpaCredits}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

          </div>
  );
}
