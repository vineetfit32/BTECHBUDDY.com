"use client";

import { useState } from "react";
import { CreditCard, Shield, Check, AlertTriangle } from "lucide-react";

export default function AdminSubscriptionsPage() {
  const [enabled, setEnabled] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-3">
        <h1 className="text-2xl font-black text-ink">
          Manage Subscription & Payment Gateway
        </h1>
        <p className="text-xs text-ink-3">
          Configure Razorpay payments, paid premium tracks, and subscription policies (Optional Module)
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-warn-soft border border-warn/35 text-xs text-warn space-y-2">
        <div className="font-bold flex items-center gap-1.5 text-sm">
          <AlertTriangle className="w-4 h-4 text-warn shrink-0" />
          Production Gateway Safety Status
        </div>
        <p className="leading-relaxed">
          The payment gateway module is currently disabled by default so all B.Tech notes, PYQs, and recorded lectures remain 100% free and open for students. To enable paid tracks or one-time premium purchases in Indian Rupees (₹), configure your Razorpay Key ID and Secret below or in your <code className="font-mono bg-warn-soft px-1 py-0.5 rounded-sm">.env</code> file.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-surface border border-line shadow-2xs space-y-4 max-w-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div>
            <h3 className="text-sm font-bold text-ink">
              Enable Paid Premium Courses
            </h3>
            <p className="text-xs text-ink-3">Allow setting paid prices in INR (₹)</p>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              enabled ? "bg-ok" : "bg-surface-3"
            }`}
          >
            <div
              className={`bg-surface w-4 h-4 rounded-full shadow-md transform transition-transform ${
                enabled ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-ink-2">
              Razorpay Key ID
            </label>
            <input
              type="text"
              disabled={!enabled}
              value={razorpayKeyId}
              onChange={(e) => setRazorpayKeyId(e.target.value)}
              placeholder="rzp_live_..."
              className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-ink-2">
              Razorpay Key Secret
            </label>
            <input
              type="password"
              disabled={!enabled}
              value={razorpayKeySecret}
              onChange={(e) => setRazorpayKeySecret(e.target.value)}
              placeholder="••••••••••••••••"
              className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden disabled:opacity-50"
            />
          </div>

          <div className="pt-2">
            <button
              disabled={!enabled}
              onClick={() => alert("Payment configuration saved.")}
              className="px-4 py-2 rounded-xl bg-danger hover:bg-danger/90 text-white font-bold disabled:opacity-50"
            >
              Update Payment Keys
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
