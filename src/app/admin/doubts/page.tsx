"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminDoubtsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/doubts/moderation");
      const data = await res.json();
      if (data?.reports) setReports(data.reports);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAction = async (action: "DISMISS_REPORT" | "DELETE_POST", reportId: string, postId?: string) => {
    try {
      const res = await fetch("/api/doubts/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reportId, postId }),
      });

      if (res.ok) {
        setStatusMessage(
          action === "DISMISS_REPORT" ? "Report dismissed." : "Reported doubt deleted."
        );
        fetchReports();
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex flex-col font-sans transition-colors">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AdminSidebar />

          <main className="flex-1 w-full space-y-6">
            <div className="bg-white dark:bg-[#1C2541] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-rose-600" />
                  Doubt Moderation & Safety Queue
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Review student community reports and take moderation actions with server audit logs.
                </p>
              </div>

              <span className="px-3 py-1 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 text-xs font-bold border border-rose-200 dark:border-rose-800">
                {reports.length} Flagged Reports
              </span>
            </div>

            {statusMessage && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{statusMessage}</span>
              </div>
            )}

            <div className="bg-white dark:bg-[#1C2541] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              {loading ? (
                <div className="py-20 text-center text-xs text-slate-500">
                  Loading reports queue...
                </div>
              ) : reports.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  All clean! No active doubt reports in the queue.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Reason / Reported At</th>
                        <th className="py-3 px-4">Post Title & Author</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {reports.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-rose-600 block">{r.reason}</span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-sm">
                            <span className="font-bold text-slate-900 dark:text-slate-100 block line-clamp-1">
                              {r.post?.title || "Deleted Post"}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              By {r.post?.user?.name} ({r.post?.user?.email})
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                r.status === "PENDING"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {r.post && (
                                <Link
                                  href={`/doubts/${r.postId}`}
                                  target="_blank"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                                  title="View Post"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Link>
                              )}
                              <button
                                onClick={() => handleAction("DISMISS_REPORT", r.id)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold"
                              >
                                Dismiss
                              </button>
                              {r.post && (
                                <button
                                  onClick={() => handleAction("DELETE_POST", r.id, r.postId)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold"
                                >
                                  Delete Post
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
