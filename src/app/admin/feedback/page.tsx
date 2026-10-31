import { prisma } from "@/lib/prisma";
import { MessageSquare, Mail, Calendar, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminFeedbackPage() {
  const feedbacks = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Student Feedback & Inquiries
        </h1>
        <p className="text-xs text-slate-500">
          Messages, notes requests, and inquiries submitted via the platform contact form
        </p>
      </div>

      {feedbacks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
          No inquiries in your inbox.
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((f) => (
            <div
              key={f.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                  {f.name} ({f.email})
                </span>
                <span className="text-[11px] text-slate-400">{formatDate(f.createdAt)}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{f.subject}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {f.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
