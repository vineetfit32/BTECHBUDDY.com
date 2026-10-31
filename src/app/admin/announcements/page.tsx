"use client";

import { useState, useEffect } from "react";
import { Megaphone, Plus, Trash2, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("GENERAL");
  const [priority, setPriority] = useState("NORMAL");
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    setLoading(true);
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((d) => setAnnouncements(d.announcements || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, type, priority }),
      });
      if (res.ok) {
        setShowModal(false);
        setTitle("");
        setContent("");
        fetchData();
      } else {
        alert("Failed to publish notice");
      }
    } catch (err) {
      console.error(err);
      alert("Error publishing announcement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Manage Announcements & Alerts
          </h1>
          <p className="text-xs text-slate-500">
            Publish site-wide banners, exam updates, and student notifications
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Broadcast Announcement
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-2" />
          <span className="text-xs">Loading announcements...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    item.priority === "HIGH"
                      ? "bg-rose-50 dark:bg-rose-950 text-rose-600"
                      : "bg-indigo-50 dark:bg-indigo-950 text-indigo-600"
                  }`}
                >
                  {item.type} Notice
                </span>
                <span className="text-[11px] text-slate-400">{formatDate(item.createdAt)}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#1C2541] rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Broadcast Announcement
            </h3>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Notice Headline</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Solved Mid-Term Question Papers Released"
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#0B132B] border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#0B132B] border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  >
                    <option value="GENERAL">General Notice</option>
                    <option value="EXAM">Exam Bank</option>
                    <option value="ALERT">Important Alert</option>
                    <option value="UPDATE">Curriculum Update</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#0B132B] border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  >
                    <option value="NORMAL">Standard</option>
                    <option value="HIGH">High Priority (Banner)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Notice Body</label>
                <textarea
                  required
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Detailed announcement content..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#0B132B] border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  {saving ? "Broadcasting..." : "Publish Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
