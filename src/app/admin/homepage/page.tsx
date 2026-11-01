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
      <div className="border-b border-line pb-3">
        <h1 className="text-2xl font-black text-ink">
          Manage Homepage Content
        </h1>
        <p className="text-xs text-ink-3">
          Customize hero section headlines, featured banners, and call-to-action messages
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-surface border border-line shadow-2xs space-y-4 max-w-2xl">
        {saved && (
          <div className="p-3 rounded-xl bg-ok-soft text-ok text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Homepage configurations updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-ink-2">Hero Main Title</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-ink-2">Hero Subtitle</label>
            <textarea
              rows={3}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-danger hover:bg-danger/90 text-white font-bold shadow-2xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Content Changes
          </button>
        </form>
      </div>
    </div>
  );
}
