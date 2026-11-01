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
      <div className="border-b border-line pb-3">
        <h1 className="text-2xl font-black text-ink">
          Platform Configuration & Settings
        </h1>
        <p className="text-xs text-ink-3">
          Global application branding, integration endpoints, and video conferencing providers
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-surface border border-line shadow-2xs space-y-4 max-w-2xl">
        {saved && (
          <div className="p-3 rounded-xl bg-ok-soft text-ok text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Platform settings updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-ink-2">Platform Name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-ink-2">Brand Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-ink-2">Primary Support Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-ink-2">
              Default Live Class Provider
            </label>
            <select
              value={liveProvider}
              onChange={(e) => setLiveProvider(e.target.value)}
              className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
            >
              <option value="jitsi">Jitsi Meet (Self-hosted / Embedded zero-auth)</option>
              <option value="zoom">Zoom Video SDK (Requires API Key in .env)</option>
              <option value="youtube">YouTube Live Stream Embed</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-danger hover:bg-danger/90 text-white font-bold shadow-2xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </form>
      </div>
    </div>
  );
}
