import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  Radio,
  Download,
  ArrowRight,
  Layers,
  GraduationCap,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Breadcrumbs from "@/components/design-system/Breadcrumbs";
import EmptyState from "@/components/design-system/EmptyState";

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const subject = await prisma.subject.findFirst({
    where: {
      OR: [{ id }, { slug: id }, { code: id.toUpperCase() }],
    },
    include: {
      branch: true,
      semester: { include: { academicYear: true } },
      units: { orderBy: { unitNumber: "asc" } },
      notes: { where: { isPublished: true }, orderBy: { createdAt: "desc" } },
      videos: { where: { isPublished: true }, orderBy: { order: "asc" } },
      quizzes: { where: { isPublished: true }, orderBy: { createdAt: "desc" } },
      liveClasses: {
        where: { status: { in: ["SCHEDULED", "LIVE"] } },
        include: { instructor: true },
        orderBy: { scheduledAt: "asc" },
      },
    },
  });

  if (!subject) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Breadcrumbs
        items={[
          { label: "Academics", href: "/" },
          { label: subject.branch.name, href: `/branches/${subject.branch.id}` },
          { label: subject.code },
        ]}
      />

      {/* Subject Header Desk Card */}
      <div className="relative overflow-hidden rounded-3xl desk-card p-8 sm:p-12 text-white border-primary-violet/40 shadow-glow-sm">
        <div className="absolute inset-0 bg-blueprint opacity-50 pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider">
            <span className="px-3 py-1 rounded-full bg-primary-violet/20 text-primary-violet border border-primary-violet/40">
              {subject.code}
            </span>
            <span className="px-3 py-1 rounded-full bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40">
              {subject.branch.name}
            </span>
            <span className="px-3 py-1 rounded-full desk-card text-ink-2">
              {subject.semester.title} ({subject.semester.academicYear.title})
            </span>
            <span className="px-3 py-1 rounded-full bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/40">
              {subject.credits} Credits
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white">{subject.name}</h1>
          <p className="text-ink-2 text-sm sm:text-base leading-relaxed">
            {subject.description || "Master core concepts with university topper notes, video lectures, solved PYQ question papers, and interactive practice quizzes."}
          </p>

          {/* Quick Action Navigation Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Link
              href={`/subjects/${subject.id}/important-questions`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40 hover:bg-accent-cyan/30 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> Important Questions Bank →
            </Link>
            <Link
              href={`/pyq?branchId=${subject.branch.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold desk-card hover:border-primary-violet text-ink-2 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-accent-amber" /> Solved PYQs
            </Link>
          </div>
        </div>
      </div>

      {/* 1. Syllabus & Units Breakdown */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-desk-border pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary-violet" />
              Syllabus & Course Modules
            </h2>
            <p className="font-mono text-xs text-ink-3">
              Standard B.Tech 5-unit curriculum structure
            </p>
          </div>
        </div>

        {subject.units.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subject.units.map((unit) => (
              <div
                key={unit.id}
                className="p-5 rounded-2xl desk-card hover:border-primary-violet transition-all"
              >
                <div className="font-mono text-xs font-bold text-primary-violet uppercase tracking-wider mb-1">
                  UNIT 0{unit.unitNumber}
                </div>
                <h3 className="text-sm font-bold text-ink">{unit.title}</h3>
                <p className="text-xs text-ink-3 mt-2 leading-relaxed">
                  {unit.description || "Core unit topics, algorithmic breakdowns, and exam question patterns."}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl desk-card text-xs sm:text-sm text-ink-2">
            {subject.syllabus || "Complete syllabus breakdown is available across the uploaded chapter notes."}
          </div>
        )}
      </section>

      {/* 2. Study Notes & PYQs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-desk-border pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent-cyan" />
              Study Notes & Solved Papers ({subject.notes.length})
            </h2>
            <p className="font-mono text-xs text-ink-3">
              Handwritten notes, revision summaries, and semester PYQs
            </p>
          </div>
        </div>

        {subject.notes.length === 0 ? (
          <EmptyState
            title="Notes In Preparation"
            description="Notes for this subject are currently being digitized. Check back soon or request in the feedback box!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subject.notes.map((note) => (
              <div
                key={note.id}
                className="p-5 rounded-2xl desk-card hover:border-primary-violet flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm bg-danger/10 text-danger border border-danger/20">
                      {note.fileType}
                    </span>
                    {note.isPYQ && (
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm bg-accent-amber/10 text-accent-amber border border-accent-amber/30">
                        PYQ Solved {note.yearPYQ ? `(${note.yearPYQ})` : ""}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-ink">{note.title}</h3>
                  <p className="text-xs text-ink-3 mt-2 line-clamp-2 leading-relaxed">
                    {note.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-desk-border flex items-center justify-between">
                  <span className="font-mono text-[11px] text-ink-3">
                    {note.fileSize} • {note.downloadCount} dl
                  </span>
                  <Link
                    href={`/notes/${note.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-primary-violet hover:bg-primary-violet/90 text-white transition-colors"
                  >
                    Preview PDF
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Video Lectures */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-desk-border pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink flex items-center gap-2">
              <Video className="w-5 h-5 text-primary-violet" />
              Recorded Video Lectures ({subject.videos.length})
            </h2>
            <p className="font-mono text-xs text-ink-3">
              High-yield video explanations and problem solving
            </p>
          </div>
        </div>

        {subject.videos.length === 0 ? (
          <EmptyState
            title="Video Lectures Coming Soon"
            description="Video lectures for this subject are in post-production and will be uploaded shortly."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subject.videos.map((vid) => (
              <Link
                key={vid.id}
                href={`/videos/${vid.id}`}
                className="group rounded-2xl desk-card overflow-hidden hover:border-primary-violet transition-all"
              >
                <div className="relative aspect-video bg-desk-card">
                  <img
                    src={vid.thumbnail || "/placeholders/lecture.svg"}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-primary-violet text-white flex items-center justify-center shadow-glow-sm">
                      <Video className="w-4 h-4 ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-sm font-mono text-[10px] font-bold bg-desk-canvas/90 text-white border border-desk-border">
                    {vid.duration}
                  </span>
                </div>
                <div className="p-3.5">
                  <h3 className="text-xs font-bold text-ink line-clamp-2 group-hover:text-primary-violet transition-colors">
                    {vid.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. Quizzes & Tests */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-desk-border pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-accent-amber" />
              Practice Quizzes ({subject.quizzes.length})
            </h2>
            <p className="font-mono text-xs text-ink-3">
              Timed self-assessments with instant explanations
            </p>
          </div>
        </div>

        {subject.quizzes.length === 0 ? (
          <EmptyState
            title="Quizzes Scheduled"
            description="Practice tests are scheduled for release before mid-term exams."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subject.quizzes.map((q) => (
              <div
                key={q.id}
                className="p-5 rounded-2xl desk-card hover:border-primary-violet flex items-center justify-between transition-all"
              >
                <div>
                  <h3 className="text-sm font-bold text-ink">{q.title}</h3>
                  <p className="font-mono text-xs text-ink-3 mt-1">
                    {q.durationMinutes} Mins • Total Marks: {q.totalMarks} • Pass: {q.passingMarks}
                  </p>
                </div>
                <Link
                  href={`/quizzes/${q.id}`}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-accent-amber hover:bg-accent-amber/90 text-ink transition-colors"
                >
                  Start Quiz
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
