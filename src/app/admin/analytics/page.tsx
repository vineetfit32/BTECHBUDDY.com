import { prisma } from "@/lib/prisma";
import { BarChart3, TrendingUp, Users, Download, Eye, Award } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const [studentsCount, notesCount, videosCount, attemptsCount, topNotes] =
    await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.note.count(),
      prisma.videoLecture.count(),
      prisma.quizAttempt.count(),
      prisma.note.findMany({
        take: 5,
        orderBy: { downloadCount: "desc" },
        include: { subject: true },
      }),
    ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Platform Reports & Analytics
        </h1>
        <p className="text-xs text-slate-500">
          Student engagement statistics, most-downloaded resources, and test completion benchmarks
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Registered Students</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {studentsCount}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Published Notes</div>
          <div className="text-3xl font-black text-emerald-500 mt-1">
            {notesCount}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Recorded Lectures</div>
          <div className="text-3xl font-black text-indigo-500 mt-1">
            {videosCount}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Test Attempts</div>
          <div className="text-3xl font-black text-amber-500 mt-1">
            {attemptsCount}
          </div>
        </div>
      </div>

      {/* Top Downloaded Notes */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-500" /> Top Downloaded Study Materials
        </h3>

        <div className="space-y-3">
          {topNotes.map((n, i) => (
            <div
              key={n.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold flex items-center justify-center text-[11px]">
                  #{i + 1}
                </span>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{n.title}</div>
                  <div className="text-slate-400 text-[11px]">{n.subject.name}</div>
                </div>
              </div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400">
                {n.downloadCount} downloads
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
