"use client";

import { useState } from "react";
import { Settings, Save, CheckCircle } from "lucide-react";

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("BTECHBUDDY");
  const [tagline, setTagline] = useState("Your Engineering Journey, Simplified.");
  const [contactEmail, setContactEmail] = useState("support@btechbuddy.in");
  const [liveProvider, setLiveProvider] = useState("jitsi");
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
          Platform Configuration & Settings
        </h1>
        <p className="text-xs text-slate-500">
          Global application branding, integration endpoints, and video conferencing providers
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4 max-w-2xl">
        {saved && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Platform settings updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Platform Name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-[#0B132B] border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Brand Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-[#0B132B] border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Primary Support Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-[#0B132B] border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Default Live Class Provider
            </label>
            <select
              value={liveProvider}
              onChange={(e) => setLiveProvider(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-[#0B132B] border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
            >
              <option value="jitsi">Jitsi Meet (Self-hosted / Embedded zero-auth)</option>
              <option value="zoom">Zoom Video SDK (Requires API Key in .env)</option>
              <option value="youtube">YouTube Live Stream Embed</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </form>
      </div>
    </div>
  );
}
