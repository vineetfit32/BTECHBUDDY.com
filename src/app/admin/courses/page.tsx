import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookOpen, Plus, Users, Clock, ArrowRight } from "lucide-react";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      instructor: true,
      subject: true,
      _count: { select: { enrollments: true, videos: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Manage Courses & Bootcamps
          </h1>
          <p className="text-xs text-slate-500">
            Publish structured semester courses, track enrollments, and organize lesson playlists
          </p>
        </div>
        <div className="text-xs font-bold text-slate-500">
          Published: <span className="text-rose-500 font-extrabold">{courses.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((c) => (
          <div
            key={c.id}
            className="p-6 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  {c.level}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {c.title}
                </h3>
                <div className="text-xs text-slate-400 mt-1">
                  Subject: {c.subject?.name || "General Track"} • {c.durationHours} Hours
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-500">
                {c.price === 0 ? "Free" : `₹${c.price}`}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500">{c._count.enrollments} Students Enrolled</span>
              <Link
                href={`/courses/${c.id}`}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Preview Course →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
