import Link from "next/link";
import { prisma } from "@/lib/prisma";

import { BookOpen, Clock, Users, ArrowRight, Star, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  // #region agent log
  fetch("http://127.0.0.1:7863/ingest/69005fa4-f6cf-43e1-ac04-a58eb906e019", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "fe4cd9" }, body: JSON.stringify({ sessionId: "fe4cd9", runId: "pre-fix", hypothesisId: "B", location: "src/app/courses/page.tsx:6", message: "courses page prerender query start", data: {}, timestamp: Date.now() }) }).catch(() => {});
  // #endregion
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-soft text-brand text-xs font-bold uppercase tracking-wider border border-brand/50">
          <BookOpen className="w-3.5 h-3.5" /> Structured Engineering Tracks
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-ink">
          Explore Courses & Placements
        </h1>
        <p className="text-sm sm:text-base text-ink-2">
          Comprehensive semester exam bootcamps, Data Structures & Placement tracks, and competitive engineering roadmaps.
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((c) => (
          <div
            key={c.id}
            className="rounded-3xl bg-surface border border-line overflow-hidden shadow-2xs hover:shadow-xl hover:border-brand/50 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="relative aspect-video bg-slate-900 overflow-hidden">
                <img
                  src={c.thumbnail || "/placeholders/course.svg"}
                  alt={c.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand text-white shadow-2xs">
                  {c.price === 0 ? "100% Free Access" : `₹${c.price}`}
                </span>
                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-sm text-[10px] font-bold bg-black/80 text-white">
                  {c.durationHours} Hours
                </span>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-xs text-brand font-bold">
                  <span>{c.subject?.code || "Track"}</span>
                  <span className="text-ink-3 font-medium">{c.level}</span>
                </div>

                <h3 className="text-lg font-bold text-ink group-hover:text-brand transition-colors">
                  {c.title}
                </h3>

                <p className="text-xs text-ink-3 line-clamp-3 leading-relaxed">
                  {c.description}
                </p>

                {c.instructor && (
                  <div className="text-xs text-ink-3 pt-2 border-t border-line">
                    Lead Faculty: <span className="font-semibold text-ink-2">{c.instructor.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-line flex items-center justify-between mt-4">
              <span className="text-xs text-ink-3 font-medium">
                {c._count.enrollments} enrolled
              </span>
              <Link
                href={`/courses/${c.id}`}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand hover:bg-brand-strong text-white shadow-2xs transition-all hover:scale-105"
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
