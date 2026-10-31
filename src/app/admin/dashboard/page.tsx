import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Users,
  UserCheck,
  BookOpen,
  FileText,
  Video,
  Radio,
  HelpCircle,
  Download,
  Eye,
  Plus,
  Shield,
  ArrowRight,
  Sparkles,
  Terminal,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [
    totalStudents,
    totalInstructors,
    totalCourses,
    totalNotes,
    totalVideos,
    totalLiveClasses,
    totalQuizzes,
    totalQuizAttempts,
    recentUsers,
    recentNotes,
    recentAttempts,
    notesAggregation,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "INSTRUCTOR" } }),
    prisma.course.count(),
    prisma.note.count(),
    prisma.videoLecture.count(),
    prisma.liveClass.count(),
    prisma.quiz.count(),
    prisma.quizAttempt.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, branch: true, createdAt: true },
    }),
    prisma.note.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { subject: { select: { name: true, code: true } } },
    }),
    prisma.quizAttempt.findMany({
      take: 5,
      orderBy: { completedAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        quiz: { select: { title: true } },
      },
    }),
    prisma.note.aggregate({
      _sum: { downloadCount: true, viewCount: true },
    }),
  ]);

  const totalDownloads = notesAggregation._sum.downloadCount || 0;
  const totalViews = notesAggregation._sum.viewCount || 0;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl desk-card text-white border-rose-500/30 shadow-glow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint opacity-40 pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1.5">
              <Terminal className="w-3 h-3" /> CENTRAL_COMMAND
            </span>
            <span className="font-mono text-xs text-slate-400">Platform Control</span>
          </div>
          <h1 className="text-2xl font-black text-white">Administrative Command Center</h1>
          <p className="font-mono text-xs text-slate-400">
            Real-time database metrics, student activity streams, and content management
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2">
          <Link
            href="/admin/notes"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-mono text-xs font-bold bg-primary-violet hover:bg-primary-violet/90 text-white shadow-glow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Upload Note
          </Link>
          <Link
            href="/admin/live-classes"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-mono text-xs font-bold desk-card hover:border-rose-500 text-slate-200"
          >
            <Radio className="w-3.5 h-3.5 text-rose-400" /> Schedule Class
          </Link>
        </div>
      </div>

      {/* Real Platform Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl desk-card hover:border-primary-violet transition-all">
          <div className="font-mono text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary-violet" /> Total Students
          </div>
          <div className="font-mono text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalStudents}
          </div>
          <div className="font-mono text-[11px] text-slate-400 mt-1">Registered & verified</div>
        </div>

        <div className="p-5 rounded-2xl desk-card hover:border-primary-violet transition-all">
          <div className="font-mono text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-accent-cyan" /> Uploaded Notes
          </div>
          <div className="font-mono text-2xl font-black text-accent-cyan mt-1">
            {totalNotes}
          </div>
          <div className="font-mono text-[11px] text-slate-400 mt-1">{totalDownloads} total downloads</div>
        </div>

        <div className="p-5 rounded-2xl desk-card hover:border-primary-violet transition-all">
          <div className="font-mono text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Video className="w-4 h-4 text-primary-violet" /> Video Lectures
          </div>
          <div className="font-mono text-2xl font-black text-primary-violet mt-1">
            {totalVideos}
          </div>
          <div className="font-mono text-[11px] text-slate-400 mt-1">Streamed across subjects</div>
        </div>

        <div className="p-5 rounded-2xl desk-card hover:border-primary-violet transition-all">
          <div className="font-mono text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-accent-amber" /> Tests & Submissions
          </div>
          <div className="font-mono text-2xl font-black text-accent-amber mt-1">
            {totalQuizAttempts}
          </div>
          <div className="font-mono text-[11px] text-slate-400 mt-1">{totalQuizzes} active quizzes</div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl desk-card font-mono text-xs">
          <div className="text-slate-400">Active Instructors</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {totalInstructors}
          </div>
        </div>
        <div className="p-4 rounded-xl desk-card font-mono text-xs">
          <div className="text-slate-400">Total Courses</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {totalCourses}
          </div>
        </div>
        <div className="p-4 rounded-xl desk-card font-mono text-xs">
          <div className="text-slate-400">Live Classes</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {totalLiveClasses}
          </div>
        </div>
        <div className="p-4 rounded-xl desk-card font-mono text-xs">
          <div className="text-slate-400">PDF Reader Views</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {totalViews}
          </div>
        </div>
      </div>

      {/* Recent Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Students */}
        <div className="p-6 rounded-2xl desk-card space-y-4">
          <div className="flex items-center justify-between border-b border-desk-border pb-2">
            <h3 className="font-mono text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
              <Users className="w-4 h-4 text-primary-violet" /> Recent Registrations
            </h3>
            <Link href="/admin/students" className="font-mono text-xs font-bold text-rose-400 hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 rounded-xl desk-card text-xs font-mono"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                  <div className="text-slate-400 text-[11px]">{u.email} • {u.branch || "CSE"}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-violet/10 text-primary-violet border border-primary-violet/30">
                    {u.role}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">{formatDate(u.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Test Submissions */}
        <div className="p-6 rounded-2xl desk-card space-y-4">
          <div className="flex items-center justify-between border-b border-desk-border pb-2">
            <h3 className="font-mono text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-accent-amber" /> Recent Test Attempts
            </h3>
            <Link href="/admin/quizzes" className="font-mono text-xs font-bold text-rose-400 hover:underline">
              Manage Tests →
            </Link>
          </div>

          <div className="space-y-3">
            {recentAttempts.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-3 rounded-xl desk-card text-xs font-mono"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{att.quiz.title}</div>
                  <div className="text-slate-400 text-[11px]">{att.user.name} ({att.user.email})</div>
                </div>
                <div className="text-right">
                  <span
                    className={`font-bold text-xs ${
                      att.passed ? "text-accent-emerald" : "text-rose-400"
                    }`}
                  >
                    {att.score} Marks ({att.percentage}%)
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {formatDate(att.completedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
