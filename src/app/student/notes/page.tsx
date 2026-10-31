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
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            My Study Notes & Downloads
          </h1>
          <p className="text-xs text-slate-500">
            Quick access to your semester notes and saved PDF study materials
          </p>
        </div>
        <Link
          href="/notes"
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"
        >
          All Notes Directory
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notes.map((note) => (
          <div
            key={note.id}
            className="p-5 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950 text-rose-600">
                  {note.fileType}
                </span>
                {note.isPYQ && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-600">
                    Solved PYQ
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                {note.title}
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                {note.subject.name}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">{note.fileSize}</span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/notes/${note.id}`}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"
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
