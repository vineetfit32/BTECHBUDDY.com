import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookOpen, Clock, Users, ArrowRight, Star, CheckCircle } from "lucide-react";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      instructor: { select: { name: true, college: true } },
      subject: { select: { name: true, code: true } },
      branch: { select: { name: true, code: true } },
      _count: { select: { enrollments: true, videos: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-200/50 dark:border-indigo-800/40">
          <BookOpen className="w-3.5 h-3.5" /> Structured Engineering Tracks
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Explore Courses & Placements
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
          Comprehensive semester exam bootcamps, Data Structures & Placement tracks, and competitive engineering roadmaps.
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((c) => (
          <div
            key={c.id}
            className="rounded-3xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-500/50 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="relative aspect-video bg-slate-900 overflow-hidden">
                <img
                  src={c.thumbnail || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800"}
                  alt={c.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow-xs">
                  {c.price === 0 ? "100% Free Access" : `₹${c.price}`}
                </span>
                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white">
                  {c.durationHours} Hours
                </span>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                  <span>{c.subject?.code || "Track"}</span>
                  <span className="text-slate-400 font-medium">{c.level}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {c.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {c.description}
                </p>

                {c.instructor && (
                  <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                    Lead Faculty: <span className="font-semibold text-slate-700 dark:text-slate-200">{c.instructor.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-4">
              <span className="text-xs text-slate-400 font-medium">
                {c._count.enrollments} enrolled
              </span>
              <Link
                href={`/courses/${c.id}`}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all hover:scale-105"
              >
                View Syllabus →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
