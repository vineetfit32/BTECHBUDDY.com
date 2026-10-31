import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  BookOpen,
  FileText,
  Video,
  Radio,
  Award,
  Play,
  ArrowRight,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle,
  Terminal,
} from "lucide-react";
import LiveCountdown from "@/components/live/LiveCountdown";
import { formatDateTimeIST } from "@/lib/utils";
import ProgressBar from "@/components/design-system/ProgressBar";
import EmptyState from "@/components/design-system/EmptyState";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch student's real data
  const [enrollments, videoProgress, quizAttempts, liveClasses, recommendedSubjects] =
    await Promise.all([
      prisma.courseEnrollment.findMany({
        where: { userId: user.id },
        include: {
          course: {
            include: {
              subject: true,
              instructor: true,
              _count: { select: { videos: true } },
            },
          },
        },
      }),
      prisma.videoProgress.findMany({
        where: { userId: user.id },
        include: {
          video: {
            include: { subject: true },
          },
        },
        orderBy: { lastWatchedAt: "desc" },
        take: 3,
      }),
      prisma.quizAttempt.findMany({
        where: { userId: user.id },
        include: { quiz: { include: { subject: true } } },
        orderBy: { completedAt: "desc" },
        take: 3,
      }),
      prisma.liveClass.findMany({
        where: { status: { in: ["SCHEDULED", "LIVE"] } },
        include: { subject: true, instructor: true },
        orderBy: { scheduledAt: "asc" },
        take: 2,
      }),
      prisma.subject.findMany({
        where: { isFeatured: true },
        take: 4,
        include: { _count: { select: { notes: true, videos: true } } },
      }),
    ]);

  return (
    <div className="space-y-8">
      {/* Welcome Hero Desk Banner */}
      <div className="relative overflow-hidden rounded-3xl desk-card p-6 sm:p-8 text-white border-primary-violet/40 shadow-glow-sm">
        <div className="absolute inset-0 bg-blueprint opacity-50 pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 flex items-center gap-1.5">
              <Terminal className="w-3 h-3" /> STUDENT_DESK
            </span>
            <span className="font-mono text-xs text-slate-300">
              {user.branch || "CSE"} • Semester {user.semester || 3}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="font-mono text-xs text-slate-300 max-w-2xl">
            {user.college || "B.Tech Engineering College"} • Real-time academic tracking, topper notes & live classes.
          </p>
        </div>
      </div>

      {/* Quick Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl desk-card">
          <div className="font-mono text-xs text-slate-400 font-medium">Enrolled Tracks</div>
          <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {enrollments.length}
          </div>
        </div>
        <div className="p-4 rounded-2xl desk-card">
          <div className="font-mono text-xs text-slate-400 font-medium">Lectures Watched</div>
          <div className="font-mono text-2xl font-bold text-primary-violet mt-1">
            {videoProgress.length}
          </div>
        </div>
        <div className="p-4 rounded-2xl desk-card">
          <div className="font-mono text-xs text-slate-400 font-medium">Quizzes Completed</div>
          <div className="font-mono text-2xl font-bold text-accent-amber mt-1">
            {quizAttempts.length}
          </div>
        </div>
        <div className="p-4 rounded-2xl desk-card">
          <div className="font-mono text-xs text-slate-400 font-medium">Live Sessions</div>
          <div className="font-mono text-2xl font-bold text-rose-400 mt-1">
            {liveClasses.length}
          </div>
        </div>
      </div>

      {/* Continue Learning / Enrolled Courses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-desk-border pb-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-violet" /> My Enrolled Tracks
          </h2>
          <Link href="/courses" className="font-mono text-xs font-bold text-primary-violet hover:underline">
            Browse More Tracks →
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <EmptyState
            title="No Enrolled Tracks Yet"
            description="Explore structured placement and semester courses to start tracking your learning progress."
            actionLabel="Explore Courses"
            actionHref="/courses"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollments.map((e) => (
              <div
                key={e.id}
                className="p-5 rounded-2xl desk-card hover:border-primary-violet space-y-4 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent-cyan">
                      {e.course.subject?.code || "TRACK"}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                      {e.course.title}
                    </h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-primary-violet">
                    {e.progressPercent}%
                  </span>
                </div>

                <ProgressBar progress={e.progressPercent} />

                <div className="flex items-center justify-between pt-2 text-xs font-mono">
                  <span className="text-slate-400">{e.course._count.videos} Lectures</span>
                  <Link
                    href={`/courses/${e.course.id}`}
                    className="font-bold text-primary-violet hover:underline"
                  >
                    Resume Learning →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Live Classes & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Classes Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-desk-border pb-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-400" /> Upcoming Live Lectures
            </h2>
            <Link href="/live-classes" className="font-mono text-xs font-bold text-primary-violet hover:underline">
              All Classes →
            </Link>
          </div>

          {liveClasses.length === 0 ? (
            <div className="p-6 text-center rounded-2xl desk-card text-xs font-mono text-slate-400">
              No live classes scheduled for today.
            </div>
          ) : (
            <div className="space-y-3">
              {liveClasses.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl desk-card hover:border-primary-violet space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary-violet">
                      {item.subject.code}
                    </span>
                    <LiveCountdown scheduledAt={item.scheduledAt} status={item.status} />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between pt-2 text-xs font-mono">
                    <span className="text-slate-400">{formatDateTimeIST(item.scheduledAt)}</span>
                    <Link
                      href={`/live-classes/${item.id}`}
                      className="font-bold text-primary-violet hover:underline"
                    >
                      Join Session →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Watch History Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-desk-border pb-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-accent-cyan" /> Continue Watching
            </h2>
            <Link href="/student/history" className="font-mono text-xs font-bold text-primary-violet hover:underline">
              Full History →
            </Link>
          </div>

          {videoProgress.length === 0 ? (
            <div className="p-6 text-center rounded-2xl desk-card text-xs font-mono text-slate-400">
              No watch history yet. Start watching lectures to track your progress!
            </div>
          ) : (
            <div className="space-y-3">
              {videoProgress.map((vp) => (
                <div
                  key={vp.id}
                  className="p-4 rounded-2xl desk-card hover:border-primary-violet flex items-center justify-between transition-all"
                >
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] font-bold text-primary-violet">
                      {vp.video.subject.name}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {vp.video.title}
                    </h4>
                    <div className="font-mono text-[10px] text-slate-400">
                      {vp.isCompleted ? (
                        <span className="text-accent-emerald font-semibold">✓ Completed</span>
                      ) : (
                        <span>Watched {Math.floor(vp.watchedSeconds / 60)} mins</span>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/videos/${vp.video.id}`}
                    className="p-2 rounded-xl bg-primary-violet/10 text-primary-violet shrink-0 hover:bg-primary-violet hover:text-white transition-colors"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
