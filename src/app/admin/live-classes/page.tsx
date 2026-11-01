"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Calendar, Loader2 } from "lucide-react";
import { formatDateTimeIST } from "@/lib/utils";

type Tutor = { id: string; name: string; email: string };
type LiveClass = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  scheduledAt: string;
  durationMinutes: number;
  subject?: { code: string; name: string };
  instructor?: { id: string; name: string } | null;
};

export default function AdminLiveClassesPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; code: string; name: string }[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [saving, setSaving] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/live-classes").then((r) => r.json()),
      fetch("/api/subjects").then((r) => r.json()),
      fetch("/api/admin/users?role=INSTRUCTOR").then((r) => r.json()),
    ])
      .then(([cData, sData, tutorsData]) => {
        setClasses(cData.liveClasses || []);
        setSubjects(sData.subjects || []);
        const nextTutors = tutorsData.users || [];
        setTutors(nextTutors);
        if (sData.subjects?.length > 0 && !subjectId) setSubjectId(sData.subjects[0].id);
        if (nextTutors.length > 0 && !instructorId) setInstructorId(nextTutors[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/live-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          subjectId,
          instructorId,
          scheduledAt: new Date(scheduledAt).toISOString(),
          durationMinutes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to schedule live class");
      } else {
        setShowScheduleModal(false);
        setTitle("");
        setDescription("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
      alert("Error scheduling class");
    } finally {
      setSaving(false);
    }
  };

  const reassign = async (classId: string, nextInstructorId: string) => {
    setAssigningId(classId);
    try {
      const res = await fetch(`/api/live-classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructorId: nextInstructorId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Could not assign that tutor");
        return;
      }
      setClasses((current) => current.map((item) => (item.id === classId ? data.liveClass : item)));
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-3">
        <div>
          <h1 className="text-2xl font-black text-ink">Schedule Live Classes</h1>
          <p className="text-xs text-ink-3">
            Assign a tutor, then they teach in the app. Students watch; the session is recorded.
          </p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-danger hover:bg-danger/90 text-white shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" /> Schedule New Session
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-ink-3">
          <Loader2 className="w-8 h-8 text-danger animate-spin mx-auto mb-2" />
          <span className="text-xs">Loading live timetable...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-surface border border-line shadow-2xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand">
                    {item.subject?.code}: {item.subject?.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === "LIVE" ? "bg-danger text-white animate-pulse" : "bg-surface-2 text-ink-3"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-ink mt-1">{item.title}</h3>
                <p className="text-xs text-ink-3 mt-1 line-clamp-2">{item.description}</p>
                <div className="text-xs text-ink-3 pt-2 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-brand" />
                  {formatDateTimeIST(item.scheduledAt)} • {item.durationMinutes} mins
                </div>
              </div>

              <div className="pt-3 border-t border-line space-y-2 text-xs">
                <label className="block text-ink-3">
                  Assigned tutor
                  <select
                    value={item.instructor?.id || ""}
                    disabled={item.status !== "SCHEDULED" || assigningId === item.id}
                    onChange={(e) => reassign(item.id, e.target.value)}
                    className="mt-1 w-full p-2 bg-surface-2 border border-line rounded-xl outline-hidden"
                  >
                    {!item.instructor && <option value="">Unassigned</option>}
                    {tutors.map((tutor) => (
                      <option key={tutor.id} value={tutor.id}>
                        {tutor.name} ({tutor.email})
                      </option>
                    ))}
                  </select>
                </label>
                <Link href={`/live-classes/${item.id}`} className="inline-block font-bold text-danger hover:underline">
                  Open classroom →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-surface rounded-2xl p-6 border border-line shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-ink">Schedule Live Class</h3>
            <form onSubmit={handleSchedule} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-ink-2">Session Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Live Doubt Session: Dynamic Programming & Graphs"
                  className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-ink-2">Subject</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    required
                    className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code}: {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-ink-2">Duration (Mins)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-ink-2">Tutor</label>
                <select
                  required
                  value={instructorId}
                  onChange={(e) => setInstructorId(e.target.value)}
                  className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
                >
                  {tutors.length === 0 && <option value="">Add a tutor under Admins & Instructors first</option>}
                  {tutors.map((tutor) => (
                    <option key={tutor.id} value={tutor.id}>
                      {tutor.name} ({tutor.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-ink-2">Date & Time (IST)</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-ink-2">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Doubt-clearing outline, problem sets..."
                  className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3.5 py-2 rounded-xl text-ink-3 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || tutors.length === 0}
                  className="px-4 py-2 rounded-xl bg-danger hover:bg-danger/90 text-white font-bold"
                >
                  {saving ? "Scheduling..." : "Confirm Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
