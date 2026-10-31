"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  RotateCw,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function StudyPlannerPage() {
  const [targets, setTargets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [rebalancing, setRebalancing] = useState(false);
  const [form, setForm] = useState({
    subjectName: "Data Structures & Algorithms",
    examDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    targetScore: "85%",
    totalUnits: 5,
  });

  const fetchPlanner = async () => {
    try {
      const res = await fetch("/api/study-planner");
      const data = await res.json();
      if (data?.targets && data.targets.length > 0) {
        setTargets(data.targets);
      } else {
        // Sample exam target for instant interactive preview
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 8);
        setTargets([
          {
            id: "sample-target-1",
            subjectName: "Data Structures & Algorithms (AKTU)",
            examDate: futureDate.toISOString(),
            targetScore: "90%",
            studyPlan: [
              {
                id: "day-1",
                dayNumber: 1,
                title: "Unit 1: Asymptotic Notation & Arrays",
                tasks: [
                  { id: "t1", title: "Read Big O, Omega, Theta analysis notes", isDone: true },
                  { id: "t2", title: "Practice 3 PYQ questions on array rotations", isDone: true },
                ],
              },
              {
                id: "day-2",
                dayNumber: 2,
                title: "Unit 2: Stacks, Queues & Recursion",
                tasks: [
                  { id: "t3", title: "Infix to Postfix conversion trace practice", isDone: false },
                  { id: "t4", title: "Circular queue array implementation", isDone: false },
                ],
              },
              {
                id: "day-3",
                dayNumber: 3,
                title: "Unit 3: Trees & Binary Search Trees",
                tasks: [
                  { id: "t5", title: "AVL Tree rotations: LL, RR, LR, RL diagrams", isDone: false },
                  { id: "t6", title: "Solve BST insert and delete algorithms", isDone: false },
                ],
              },
              {
                id: "day-4",
                dayNumber: 4,
                title: "Unit 4: Graph Algorithms & Spanning Trees",
                tasks: [
                  { id: "t7", title: "Dijkstra's shortest path trace", isDone: false },
                  { id: "t8", title: "Kruskal's and Prim's MST comparison", isDone: false },
                ],
              },
            ],
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanner();
  }, []);

  const handleCreateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/study-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.status === 401) {
        alert("Please log in to save and sync your personal exam study plan!");
        return;
      }

      if (res.ok) {
        setModalOpen(false);
        fetchPlanner();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTask = async (targetId: string, dayId: string, taskId: string, isDone: boolean) => {
    // Optimistic UI update
    setTargets((prev) =>
      prev.map((target) => {
        if (target.id === targetId) {
          return {
            ...target,
            studyPlan: target.studyPlan.map((day: any) => {
              if (day.id === dayId) {
                return {
                  ...day,
                  tasks: day.tasks.map((task: any) =>
                    task.id === taskId ? { ...task, isDone } : task
                  ),
                };
              }
              return day;
            }),
          };
        }
        return target;
      })
    );

    if (!targetId.startsWith("sample-")) {
      try {
        await fetch("/api/study-planner", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "TOGGLE_TASK", taskId, isDone }),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRebalance = async (targetId: string) => {
    setRebalancing(true);
    if (!targetId.startsWith("sample-")) {
      try {
        await fetch("/api/study-planner", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "REBALANCE", targetId }),
        });
        await fetchPlanner();
      } catch (err) {
        console.error(err);
      }
    } else {
      alert("Sample plan rebalanced! Incomplete tasks have been evenly rescheduled.");
    }
    setRebalancing(false);
  };

  const calculateCountdown = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days, hours, minutes };
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex flex-col font-sans transition-colors">
      
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-violet-800 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-cyan-300 text-xs font-semibold mb-4 border border-white/10">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Smart Revision Scheduler with Auto-Rebalancing</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
              Exam Countdown & Day-by-Day Study Planner
            </h1>
            <p className="text-indigo-200 text-sm sm:text-base leading-relaxed mb-6">
              Set your target exam date. Our algorithm breaks your syllabus into daily milestones,
              prioritizes repeated PYQs, and automatically rebalances remaining topics if you fall behind.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-sm shadow-md hover:bg-indigo-50 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Exam Target
              </button>
              <Link
                href="/pyq"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm transition-all border border-white/20"
              >
                <BookOpen className="w-4 h-4" /> PYQ Paper Bank
              </Link>
            </div>
          </div>
        </div>

        {/* Exam Targets List */}
        <div className="space-y-10">
          {targets.map((target) => {
            const countdown = calculateCountdown(target.examDate);
            const allTasks: any[] = [];
            target.studyPlan?.forEach((d: any) => d.tasks?.forEach((t: any) => allTasks.push(t)));
            const completedCount = allTasks.filter((t) => t.isDone).length;
            const progress =
              allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;

            return (
              <div
                key={target.id}
                className="bg-white dark:bg-[#1C2541] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6"
              >
                {/* Target Header & Countdown */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Upcoming Examination Target
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                      {target.subjectName}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Exam Date: {new Date(target.examDate).toLocaleDateString()}</span>
                      <span>• Target: {target.targetScore}</span>
                    </div>
                  </div>

                  {/* Countdown Badges */}
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl border border-indigo-200 dark:border-indigo-800 text-center min-w-[70px]">
                      <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {countdown.days}
                      </div>
                      <div className="text-[10px] font-bold uppercase text-slate-500">Days</div>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl border border-indigo-200 dark:border-indigo-800 text-center min-w-[70px]">
                      <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {countdown.hours}
                      </div>
                      <div className="text-[10px] font-bold uppercase text-slate-500">Hours</div>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl border border-indigo-200 dark:border-indigo-800 text-center min-w-[70px]">
                      <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {countdown.minutes}
                      </div>
                      <div className="text-[10px] font-bold uppercase text-slate-500">Mins</div>
                    </div>
                  </div>
                </div>

                {/* Progress & Rebalance Control */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex-1 max-w-md">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-600 dark:text-slate-400">Preparation Progress</span>
                      <span className="text-indigo-600 dark:text-indigo-400">
                        {completedCount} / {allTasks.length} Tasks ({progress}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleRebalance(target.id)}
                    disabled={rebalancing}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 shrink-0"
                    title="Behind schedule? Auto-redistribute incomplete tasks evenly across remaining days."
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${rebalancing ? "animate-spin" : ""}`} />
                    Auto-Rebalance Missed Days
                  </button>
                </div>

                {/* Day by Day Plan Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {target.studyPlan?.map((day: any) => {
                    const dayTasks = day.tasks || [];
                    const isDayDone =
                      dayTasks.length > 0 && dayTasks.every((t: any) => t.isDone);

                    return (
                      <div
                        key={day.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isDayDone
                            ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                            Day {day.dayNumber}
                          </span>
                          {isDayDone && (
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Day Completed
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 mb-3">
                          {day.title}
                        </h4>

                        <div className="space-y-2">
                          {dayTasks.map((t: any) => (
                            <label
                              key={t.id}
                              className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                checked={t.isDone}
                                onChange={(e) =>
                                  handleToggleTask(
                                    target.id,
                                    day.id,
                                    t.id,
                                    e.target.checked
                                  )
                                }
                                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                              />
                              <span className={t.isDone ? "line-through text-slate-400" : ""}>
                                {t.title}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Add Exam Target Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C2541] rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
              Add Upcoming Exam Target
            </h3>
            <form onSubmit={handleCreateTarget} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems"
                  value={form.subjectName}
                  onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Exam Date</label>
                <input
                  type="date"
                  required
                  value={form.examDate}
                  onChange={(e) => setForm({ ...form, examDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Target Score</label>
                  <input
                    type="text"
                    value={form.targetScore}
                    onChange={(e) => setForm({ ...form, targetScore: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Syllabus Units</label>
                  <select
                    value={form.totalUnits}
                    onChange={(e) => setForm({ ...form, totalUnits: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-semibold"
                  >
                    <option value={4}>4 Units</option>
                    <option value={5}>5 Units (Standard)</option>
                    <option value={6}>6 Units</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  Generate Study Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

          </div>
  );
}
