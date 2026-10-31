import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { BookOpen, ArrowRight, Play } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentCoursesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const enrollments = await prisma.courseEnrollment.findMany({
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
    orderBy: { enrolledAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            My Enrolled Tracks
          </h1>
          <p className="text-xs text-slate-500">
            Structured courses and placement bootcamps you are actively learning
          </p>
        </div>
        <Link
          href="/courses"
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Explore More Courses
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No courses enrolled</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our free placement bootcamps, Data Structures tracks, and semester roadmaps.
          </p>
          <Link
            href="/courses"
            className="inline-block px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrollments.map((e) => (
            <div
              key={e.id}
              className="p-6 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {e.course.subject?.name || "Track"}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {e.course.title}
                  </h3>
                </div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {e.progressPercent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${e.progressPercent}%` }}
                />
              </div>

              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">{e.course._count.videos} Lectures Available</span>
                <Link
                  href={`/courses/${e.course.id}`}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Continue Course <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
