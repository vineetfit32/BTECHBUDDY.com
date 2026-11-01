import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Video, Play, Clock, ArrowRight, BookOpen, Compass } from "lucide-react";
import Breadcrumbs from "@/components/design-system/Breadcrumbs";

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ subjectId?: string }>;
}) {
  const { subjectId } = await searchParams;

  const where: any = { isPublished: true };
  if (subjectId) where.subjectId = subjectId;

  const [videos, subjects] = await Promise.all([
    prisma.videoLecture.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        unit: { select: { id: true, title: true, unitNumber: true } },
      },
      orderBy: { order: "asc" },
    }),
    prisma.subject.findMany({
      where: { videos: { some: {} } },
      include: { _count: { select: { videos: true } } },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: "Study Desk", href: "/" }, { label: "Video Lectures" }]} />

      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/30 uppercase tracking-wider">
          <Video className="w-3.5 h-3.5" /> High-Definition Video Lectures
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-ink">
          Recorded Video Lectures
        </h1>
        <p className="text-sm sm:text-base text-ink-2">
          In-depth video tutorials, algorithmic breakdowns, and exam problem solving recorded by top engineering faculty.
        </p>
      </div>

      {/* Subject Filter Bar */}
      {subjects.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/videos"
            className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
              !subjectId
                ? "bg-primary-violet text-white shadow-glow-sm"
                : "desk-card hover:border-primary-violet text-ink-3"
            }`}
          >
            All Subjects
          </Link>
          {subjects.map((sub) => (
            <Link
              key={sub.id}
              href={`/videos?subjectId=${sub.id}`}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                subjectId === sub.id
                  ? "bg-primary-violet text-white shadow-glow-sm"
                  : "desk-card hover:border-primary-violet text-ink-3"
              }`}
            >
              {sub.code}: {sub.name} ({sub._count.videos})
            </Link>
          ))}
        </div>
      )}

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((vid) => (
          <Link
            key={vid.id}
            href={`/videos/${vid.id}`}
            className="group rounded-2xl desk-card overflow-hidden hover:border-primary-violet transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-video bg-desk-card overflow-hidden">
                <img
                  src={vid.thumbnail || "/placeholders/lecture.svg"}
                  alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary-violet text-white flex items-center justify-center shadow-glow-sm group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 ml-0.5 fill-white" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold bg-desk-canvas/90 text-white border border-desk-border">
                  {vid.duration}
                </span>
              </div>

              <div className="p-4 space-y-1.5">
                <div className="font-mono text-xs font-bold text-primary-violet">
                  {vid.subject.code} • {vid.subject.name}
                </div>
                <h3 className="text-sm font-bold text-ink group-hover:text-primary-violet transition-colors line-clamp-2">
                  {vid.title}
                </h3>
                {vid.unit && (
                  <div className="font-mono text-[11px] text-ink-3">
                    Unit 0{vid.unit.unitNumber}: {vid.unit.title}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 pt-0 flex items-center justify-between text-xs font-mono text-primary-violet font-semibold">
              <span>Watch Masterclass</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
