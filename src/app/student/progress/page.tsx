import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { TrendingUp, Award, BookOpen, Video, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentProgressPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [enrollments, videoProgress, quizAttempts] = await Promise.all([
    prisma.courseEnrollment.findMany({
      where: { userId: user.id },
      include: { course: true },
    }),
    prisma.videoProgress.findMany({
      where: { userId: user.id },
      include: { video: { include: { subject: true } } },
    }),
    prisma.quizAttempt.findMany({
      where: { userId: user.id },
      include: { quiz: true },
      orderBy: { completedAt: "desc" },
    }),
  ]);

  const totalWatchedSeconds = videoProgress.reduce((acc, vp) => acc + vp.watchedSeconds, 0);
  const totalWatchedHours = (totalWatchedSeconds / 3600).toFixed(1);
  const completedVideosCount = videoProgress.filter((vp) => vp.isCompleted).length;

  const passedQuizzes = quizAttempts.filter((q) => q.passed).length;
  const avgQuizAccuracy =
    quizAttempts.length > 0
      ? (quizAttempts.reduce((acc, q) => acc + q.percentage, 0) / quizAttempts.length).toFixed(1)
      : "0";

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Learning Analytics & Progress
        </h1>
        <p className="text-xs text-slate-500">
          Track your course completion, video watch hours, and quiz performance metrics
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Watch Time</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {totalWatchedHours} Hours
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{completedVideosCount} completed lectures</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Average Quiz Score</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {avgQuizAccuracy}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{quizAttempts.length} tests attempted</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Tests Passed</div>
          <div className="text-2xl font-bold text-amber-500 mt-1">
            {passedQuizzes} / {quizAttempts.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Passed benchmarks</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Active Tracks</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {enrollments.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Enrolled modules</div>
        </div>
      </div>

      {/* Recent Video Progress List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Video className="w-5 h-5 text-indigo-500" /> Topic Watch Breakdown
        </h2>

        {videoProgress.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            No video activity recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {videoProgress.map((vp) => (
              <div
                key={vp.id}
                className="p-4 rounded-xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                    {vp.video.subject.name}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {vp.video.title}
                  </h4>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Watched: {Math.floor(vp.watchedSeconds / 60)} minutes
                  </div>
                </div>

                {vp.isCompleted ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                ) : (
                  <Link
                    href={`/videos/${vp.video.id}`}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white"
                  >
                    Resume
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
