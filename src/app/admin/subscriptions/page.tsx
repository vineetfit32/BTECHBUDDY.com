"use client";

import { useState } from "react";
import { CreditCard, Shield, Check, AlertTriangle } from "lucide-react";

export default function AdminSubscriptionsPage() {
  const [enabled, setEnabled] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Manage Subscription & Payment Gateway
        </h1>
        <p className="text-xs text-slate-500">
          Configure Razorpay payments, paid premium tracks, and subscription policies (Optional Module)
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-2">
        <div className="font-bold flex items-center gap-1.5 text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          Production Gateway Safety Status
        </div>
        <p className="leading-relaxed">
          The payment gateway module is currently disabled by default so all B.Tech notes, PYQs, and recorded lectures remain 100% free and open for students. To enable paid tracks or one-time premium purchases in Indian Rupees (₹), configure your Razorpay Key ID and Secret below or in your <code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">.env</code> file.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4 max-w-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Enable Paid Premium Courses
            </h3>
            <p className="text-xs text-slate-400">Allow setting paid prices in INR (₹)</p>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                enabled ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Razorpay Key ID
            </label>
            <input
              type="text"
              disabled={!enabled}
              value={razorpayKeyId}
              onChange={(e) => setRazorpayKeyId(e.target.value)}
              placeholder="rzp_live_..."
              className="w-full p-2.5 bg-slate-50 dark:bg-[#0B132B] border border-slate-200 dark:border-slate-700 rounded-xl outline-none disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Razorpay Key Secret
            </label>
            <input
              type="password"
              disabled={!enabled}
              value={razorpayKeySecret}
              onChange={(e) => setRazorpayKeySecret(e.target.value)}
              placeholder="••••••••••••••••"
              className="w-full p-2.5 bg-slate-50 dark:bg-[#0B132B] border border-slate-200 dark:border-slate-700 rounded-xl outline-none disabled:opacity-50"
            />
          </div>

          <div className="pt-2">
            <button
              disabled={!enabled}
              onClick={() => alert("Payment configuration saved.")}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-50"
            >
              Update Payment Keys
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
