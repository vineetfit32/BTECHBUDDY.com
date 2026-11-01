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
      <div className="border-b border-line pb-3">
        <h1 className="text-2xl font-black text-ink">
          Platform Reports & Analytics
        </h1>
        <p className="text-xs text-ink-3">
          Student engagement statistics, most-downloaded resources, and test completion benchmarks
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-line shadow-2xs">
          <div className="text-xs text-ink-3 font-semibold">Registered Students</div>
          <div className="text-3xl font-black text-ink mt-1">
            {studentsCount}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-line shadow-2xs">
          <div className="text-xs text-ink-3 font-semibold">Published Notes</div>
          <div className="text-3xl font-black text-ok mt-1">
            {notesCount}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-line shadow-2xs">
          <div className="text-xs text-ink-3 font-semibold">Recorded Lectures</div>
          <div className="text-3xl font-black text-brand mt-1">
            {videosCount}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-line shadow-2xs">
          <div className="text-xs text-ink-3 font-semibold">Test Attempts</div>
          <div className="text-3xl font-black text-warn mt-1">
            {attemptsCount}
          </div>
        </div>
      </div>

      {/* Top Downloaded Notes */}
      <div className="p-6 rounded-2xl bg-surface border border-line shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-ink flex items-center gap-2">
          <Download className="w-4 h-4 text-ok" /> Top Downloaded Study Materials
        </h3>

        <div className="space-y-3">
          {topNotes.map((n, i) => (
            <div
              key={n.id}
              className="flex items-center justify-between p-3 rounded-xl bg-surface-2 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-brand-soft text-brand font-bold flex items-center justify-center text-[11px]">
                  #{i + 1}
                </span>
                <div>
                  <div className="font-bold text-ink">{n.title}</div>
                  <div className="text-ink-3 text-[11px]">{n.subject.name}</div>
                </div>
              </div>
              <div className="font-bold text-ok">
                {n.downloadCount} downloads
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
