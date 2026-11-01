import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { FileText, Download, Eye, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentNotesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch recommended & recent notes matching student branch/sem
  const notes = await prisma.note.findMany({
    where: { isPublished: true },
    include: {
      subject: true,
      branch: true,
    },
    take: 12,
    orderBy: { downloadCount: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div>
          <h1 className="text-2xl font-black text-ink">
            My Study Notes & Downloads
          </h1>
          <p className="text-xs text-ink-3">
            Quick access to your semester notes and saved PDF study materials
          </p>
        </div>
        <Link
          href="/notes"
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-strong"
        >
          All Notes Directory
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notes.map((note) => (
          <div
            key={note.id}
            className="p-5 rounded-2xl bg-surface border border-line shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-danger-soft text-danger">
                  {note.fileType}
                </span>
                {note.isPYQ && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-warn-soft text-warn">
                    Solved PYQ
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-ink line-clamp-2">
                {note.title}
              </h3>
              <p className="text-xs text-brand mt-1">
                {note.subject.name}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-line flex items-center justify-between">
              <span className="text-[11px] text-ink-3">{note.fileSize}</span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/notes/${note.id}`}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-brand text-white hover:bg-brand-strong"
                >
                  Open PDF
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
