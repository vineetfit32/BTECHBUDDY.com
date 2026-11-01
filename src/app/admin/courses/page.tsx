import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookOpen, Plus, Users, Clock, ArrowRight } from "lucide-react";

export default async function AdminCoursesPage() {
  // #region agent log
  fetch("http://127.0.0.1:7863/ingest/69005fa4-f6cf-43e1-ac04-a58eb906e019", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "fe4cd9" }, body: JSON.stringify({ sessionId: "fe4cd9", runId: "pre-fix", hypothesisId: "D", location: "src/app/admin/courses/page.tsx:6", message: "admin courses prerender query start", data: {}, timestamp: Date.now() }) }).catch(() => {});
  // #endregion
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-3">
        <div>
          <h1 className="text-2xl font-black text-ink">
            Manage Courses & Bootcamps
          </h1>
          <p className="text-xs text-ink-3">
            Publish structured semester courses, track enrollments, and organize lesson playlists
          </p>
        </div>
        <div className="text-xs font-bold text-ink-3">
          Published: <span className="text-danger font-extrabold">{courses.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((c) => (
          <div
            key={c.id}
            className="p-6 rounded-2xl bg-surface border border-line shadow-2xs space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                  {c.level}
                </span>
                <h3 className="text-base font-bold text-ink mt-0.5">
                  {c.title}
                </h3>
                <div className="text-xs text-ink-3 mt-1">
                  Subject: {c.subject?.name || "General Track"} • {c.durationHours} Hours
                </div>
              </div>
              <span className="text-xs font-bold text-ok">
                {c.price === 0 ? "Free" : `₹${c.price}`}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-line text-xs">
              <span className="text-ink-3">{c._count.enrollments} Students Enrolled</span>
              <Link
                href={`/courses/${c.id}`}
                className="text-brand font-bold hover:underline"
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
