"use client";

import { useState } from "react";
import { Home, Save, CheckCircle } from "lucide-react";

export default function AdminHomepageContentPage() {
  const [headline, setHeadline] = useState("Your Engineering Journey, Simplified.");
  const [tagline, setTagline] = useState(
    "High-yield topper handwritten notes, solved previous year questions (PYQs), unit-wise video lectures, live doubt clearing classes, and online practice quizzes for all 4 years of B.Tech."
  );
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Manage Homepage Content
        </h1>
        <p className="text-xs text-slate-500">
          Customize hero section headlines, featured banners, and call-to-action messages
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4 max-w-2xl">
        {saved && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Homepage configurations updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Hero Main Title</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-[#0B132B] border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Hero Subtitle</label>
            <textarea
              rows={3}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-[#0B132B] border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Content Changes
          </button>
        </form>
      </div>
    </div>
  );
}
