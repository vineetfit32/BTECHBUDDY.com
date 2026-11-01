"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calculator,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Check,
  X,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export default function AttendanceTrackerPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: "",
    attended: 15,
    total: 20,
    target: 75,
  });

  const fetchAttendance = async () => {
    try {
      const res = await fetch("/api/tools/attendance");
      const data = await res.json();
      if (data?.subjects && data.subjects.length > 0) {
        setSubjects(data.subjects);
      } else {
        // Default sample subjects for instant interactive use
        setSubjects([
          {
            id: "sample-1",
            subjectName: "Data Structures & Algorithms",
            attendedClasses: 24,
            totalClasses: 28,
            minimumPercentage: 75,
          },
          {
            id: "sample-2",
            subjectName: "Computer Networks",
            attendedClasses: 18,
            totalClasses: 25,
            minimumPercentage: 75,
          },
          {
            id: "sample-3",
            subjectName: "Operating Systems",
            attendedClasses: 14,
            totalClasses: 22,
            minimumPercentage: 75,
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
    fetchAttendance();
  }, []);

  const handleUpdate = async (id: string, attendedChange: number, totalChange: number) => {
    // Optimistic UI update
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const newAttended = Math.max(0, s.attendedClasses + attendedChange);
          const newTotal = Math.max(newAttended, s.totalClasses + totalChange);
          return { ...s, attendedClasses: newAttended, totalClasses: newTotal };
        }
        return s;
      })
    );

    // Call API if not a sample id
    if (!id.startsWith("sample-")) {
      try {
        await fetch("/api/tools/attendance", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, attendedChange, totalChange }),
        });
      } catch (err) {
        console.error("Failed to update attendance on server:", err);
      }
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.name) return;

    try {
      const res = await fetch("/api/tools/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectName: newSubject.name,
          attendedClasses: newSubject.attended,
          totalClasses: newSubject.total,
          minimumPercentage: newSubject.target,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubjects([...subjects, data.subject]);
      } else {
        // Fallback for guest
        setSubjects([
          ...subjects,
          {
            id: `local-${Date.now()}`,
            subjectName: newSubject.name,
            attendedClasses: newSubject.attended,
            totalClasses: newSubject.total,
            minimumPercentage: newSubject.target,
          },
        ]);
      }
      setModalOpen(false);
      setNewSubject({ name: "", attended: 15, total: 20, target: 75 });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
    if (!id.startsWith("sample-") && !id.startsWith("local-")) {
      try {
        await fetch(`/api/tools/attendance?id=${id}`, { method: "DELETE" });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface-2 flex flex-col font-sans transition-colors">
      
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="bg-linear-to-r from-teal-700 via-brand to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-accent text-xs font-semibold mb-4 border border-white/10">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>Smart 75% Attendance & Safe Bunk Engine</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
              B.Tech Attendance & Bunk Calculator
            </h1>
            <p className="text-teal-100 text-sm sm:text-base leading-relaxed mb-6">
              Track classes attended vs held for each subject. Instantly calculate exactly how many
              classes you can safely bunk without falling below 75%, or how many you must attend to recover.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface text-teal-900 font-bold text-sm shadow-md hover:bg-teal-50 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Subject
              </button>
              <Link
                href="/tools/sgpa-cgpa-calculator"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-xs transition-all border border-white/20"
              >
                SGPA / CGPA Calculator
              </Link>
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => {
            const attended = Number(sub.attendedClasses);
            const total = Number(sub.totalClasses);
            const minPct = Number(sub.minimumPercentage) / 100;
            const currentPct = total > 0 ? (attended / total) * 100 : 0;
            const currentPctRounded = Math.round(currentPct);

            // Bunk Math
            let canBunk = 0;
            let neededClasses = 0;

            if (currentPct >= sub.minimumPercentage) {
              // Formula: floor(attended / minPct) - total
              canBunk = Math.max(0, Math.floor(attended / minPct) - total);
            } else {
              // Formula: ceil((minPct * total - attended) / (1 - minPct))
              neededClasses = Math.ceil((minPct * total - attended) / (1 - minPct));
            }

            const isSafe = currentPct >= sub.minimumPercentage;
            const isWarning = currentPct >= 70 && currentPct < sub.minimumPercentage;

            return (
              <div
                key={sub.id}
                className="bg-surface rounded-2xl border border-line p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3 className="font-bold text-base text-ink">
                      {sub.subjectName}
                    </h3>
                    <button
                      onClick={() => handleDeleteSubject(sub.id)}
                      className="text-ink-3 hover:text-danger p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Percentage & Status Display */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div
                        className={`text-3xl font-black ${
                          isSafe
                            ? "text-ok"
                            : isWarning
                            ? "text-warn"
                            : "text-danger"
                        }`}
                      >
                        {currentPctRounded}%
                      </div>
                      <span className="text-xs text-ink-3 font-semibold">
                        {attended} / {total} Classes
                      </span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                        isSafe
                          ? "bg-ok-soft text-ok border-ok/35"
                          : isWarning
                          ? "bg-warn-soft text-warn border-warn/35"
                          : "bg-danger-soft text-danger border-danger/35"
                      }`}
                    >
                      {isSafe ? "On Track 🟢" : isWarning ? "Warning ⚠️" : "Shortage 🔴"}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-surface-2 h-2.5 rounded-full overflow-hidden mb-5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isSafe ? "bg-ok" : isWarning ? "bg-warn" : "bg-danger"
                      }`}
                      style={{ width: `${Math.min(100, currentPct)}%` }}
                    />
                  </div>

                  {/* Bunk Math Result Callout */}
                  <div
                    className={`p-3.5 rounded-xl text-xs font-medium mb-6 ${
                      isSafe
                        ? "bg-ok/80 text-ok border border-ok/35"
                        : "bg-danger/80 text-danger border border-danger/35"
                    }`}
                  >
                    {isSafe ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-ok shrink-0" />
                        <span>
                          You can safely bunk <strong>{canBunk}</strong> next classes and stay above{" "}
                          {sub.minimumPercentage}%.
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
                        <span>
                          Must attend <strong>{neededClasses}</strong> consecutive classes to reach{" "}
                          {sub.minimumPercentage}%!
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Increment Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-line">
                  <button
                    onClick={() => handleUpdate(sub.id, 1, 1)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-ok-soft hover:bg-ok-soft text-ok text-xs font-bold transition"
                  >
                    <Check className="w-3.5 h-3.5" /> Present
                  </button>

                  <button
                    onClick={() => handleUpdate(sub.id, 0, 1)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-danger-soft hover:bg-danger-soft text-danger text-xs font-bold transition"
                  >
                    <X className="w-3.5 h-3.5" /> Bunked
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Add Subject Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-line shadow-2xl">
            <h3 className="text-lg font-bold text-ink mb-4">
              Add Subject for Attendance
            </h3>
            <form onSubmit={handleAddSubject} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-line bg-surface-2 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Classes Attended</label>
                  <input
                    type="number"
                    value={newSubject.attended}
                    onChange={(e) =>
                      setNewSubject({ ...newSubject, attended: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-line bg-surface-2 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Total Classes Held</label>
                  <input
                    type="number"
                    value={newSubject.total}
                    onChange={(e) =>
                      setNewSubject({ ...newSubject, total: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-line bg-surface-2 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Minimum Target Attendance (%)</label>
                <select
                  value={newSubject.target}
                  onChange={(e) =>
                    setNewSubject({ ...newSubject, target: Number(e.target.value) })
                  }
                  className="w-full p-2.5 rounded-xl border border-line bg-surface-2 font-semibold"
                >
                  <option value={75}>75% (Mandatory University Rule)</option>
                  <option value={80}>80%</option>
                  <option value={85}>85%</option>
                </select>
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
                  className="px-5 py-2 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

          </div>
  );
}
