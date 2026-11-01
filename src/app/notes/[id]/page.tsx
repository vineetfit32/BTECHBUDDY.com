import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FileText, Download, ArrowLeft, Calendar, Eye, Share2, Layers, BookOpen, CheckCircle2 } from "lucide-react";
import Breadcrumbs from "@/components/design-system/Breadcrumbs";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const note = await prisma.note.findUnique({
    where: { id },
    include: {
      subject: { include: { branch: true } },
      unit: true,
      branch: true,
      semester: true,
    },
  });

  if (!note) {
    notFound();
  }

  // Increment view count
  await prisma.note.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  // Fetch related notes from the same subject
  const relatedNotes = await prisma.note.findMany({
    where: {
      subjectId: note.subjectId,
      id: { not: note.id },
      isPublished: true,
    },
    take: 3,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs
        items={[
          { label: "Notes", href: "/notes" },
          { label: note.subject.code, href: `/subjects/${note.subject.id}` },
          { label: note.title },
        ]}
      />

      {/* Main Note Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl desk-card space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-danger/10 text-danger border border-danger/20">
              {note.fileType} Document
            </span>
            {note.isPYQ ? (
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-accent-amber/10 text-accent-amber border border-accent-amber/30">
                Solved Previous Year Paper {note.yearPYQ ? `(${note.yearPYQ})` : ""}
              </span>
            ) : (
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-primary-violet/10 text-primary-violet border border-primary-violet/30">
                Verified Topper Notes
              </span>
            )}
            <span className="font-mono text-xs text-ink-3">• {note.fileSize}</span>
          </div>

          <div className="font-mono text-xs text-ink-3 flex items-center gap-3">
            <span>{note.viewCount + 1} views</span>
            <span>•</span>
            <span>{note.downloadCount} dl</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-ink">
            {note.title}
          </h1>
          <p className="font-mono text-xs sm:text-sm font-semibold text-primary-violet">
            Subject: {note.subject.name} ({note.subject.code}) • {note.subject.branch.name}
          </p>
          <p className="text-xs sm:text-sm text-ink-2 leading-relaxed max-w-3xl">
            {note.description}
          </p>
        </div>

        {/* Embedded PDF Preview Frame */}
        <div className="rounded-2xl overflow-hidden border border-desk-border bg-slate-950 shadow-inner h-[620px] relative">
          <iframe
            src={`${note.fileUrl}#toolbar=1`}
            title={note.title}
            className="w-full h-full border-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-desk-border">
          <div className="font-mono text-xs text-ink-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald" /> Verified by BTECHBUDDY Academic Review Team
          </div>
          <div className="flex items-center gap-3">
            <a
              href={note.fileUrl}
              download
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold bg-primary-violet hover:bg-primary-violet/90 text-white shadow-glow-sm transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" /> Download Full PDF
            </a>
          </div>
        </div>
      </div>

      {/* Related Notes */}
      {relatedNotes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-ink">
            More Notes for {note.subject.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedNotes.map((rel) => (
              <div
                key={rel.id}
                className="p-5 rounded-2xl desk-card hover:border-primary-violet flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-sm font-bold text-ink">{rel.title}</h3>
                  <p className="text-xs text-ink-3 mt-1 line-clamp-2">{rel.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-desk-border flex items-center justify-between">
                  <span className="font-mono text-[11px] text-ink-3">{rel.fileSize}</span>
                  <Link
                    href={`/notes/${rel.id}`}
                    className="font-mono text-xs font-bold text-primary-violet hover:underline"
                  >
                    View Note →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
