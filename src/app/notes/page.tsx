"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Check,
  Bookmark,
  Share2,
  Sparkles,
  Layers,
  Loader2,
  Compass,
} from "lucide-react";
import PDFViewerModal from "@/components/pdf/PDFViewerModal";
import Breadcrumbs from "@/components/design-system/Breadcrumbs";
import EmptyState from "@/components/design-system/EmptyState";

function NotesContent() {
  const searchParams = useSearchParams();
  const initialBranch = searchParams.get("branchId") || "";
  const initialYear = searchParams.get("year") || "";
  const initialPYQ = searchParams.get("isPYQ") === "true";
  const initialSubject = searchParams.get("subjectId") || "";

  const [notes, setNotes] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(initialBranch);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [isPYQOnly, setIsPYQOnly] = useState(initialPYQ);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);

  // PDF Preview Modal
  const [activePdf, setActivePdf] = useState<{ url: string; title: string; id: string } | null>(null);

  // Fetch initial branches & subjects
  useEffect(() => {
    Promise.all([
      fetch("/api/branches").then((r) => r.json()),
      fetch("/api/subjects").then((r) => r.json()),
    ])
      .then(([bData, sData]) => {
        setBranches(bData.branches || []);
        setSubjects(sData.subjects || []);
      })
      .catch(console.error);
  }, []);

  // Fetch notes when filters change
  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (selectedBranch) query.set("branchId", selectedBranch);
    if (selectedYear) query.set("year", selectedYear);
    if (selectedSubject) query.set("subjectId", selectedSubject);
    if (isPYQOnly) query.set("isPYQ", "true");

    fetch(`/api/notes?${query.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setNotes(data.notes || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, selectedBranch, selectedYear, selectedSubject, isPYQOnly]);

  const handleDownload = async (note: any) => {
    await fetch(`/api/notes/${note.id}/download`, { method: "POST" });
    const link = document.createElement("a");
    link.href = note.fileUrl;
    link.download = `${note.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: "Study Desk", href: "/" }, { label: "Notes & PDFs" }]} />

      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/30 uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5" /> High-Yield Engineering Notes
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Study Materials, Notes & PYQs
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
          Search and download verified handwritten university topper notes, formula cheat sheets, and solved previous year question papers.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-6 rounded-2xl desk-card space-y-4">
        {/* Top search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes by subject name, topic, or keyword (e.g. DSA, Trees, Normalization)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-desk-canvas border border-desk-border rounded-xl text-xs sm:text-sm outline-none focus:border-primary-violet transition-colors text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Year */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            aria-label="Filter by Year"
            className="w-full p-2.5 bg-slate-50 dark:bg-desk-canvas border border-desk-border rounded-xl font-mono text-xs font-semibold outline-none text-slate-700 dark:text-slate-200 focus:border-primary-violet"
          >
            <option value="">All Academic Years</option>
            <option value="1">1st Year (Sem 1 & 2)</option>
            <option value="2">2nd Year (Sem 3 & 4)</option>
            <option value="3">3rd Year (Sem 5 & 6)</option>
            <option value="4">4th Year (Sem 7 & 8)</option>
          </select>

          {/* Branch */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            aria-label="Filter by Branch"
            className="w-full p-2.5 bg-slate-50 dark:bg-desk-canvas border border-desk-border rounded-xl font-mono text-xs font-semibold outline-none text-slate-700 dark:text-slate-200 focus:border-primary-violet"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} - {b.name}
              </option>
            ))}
          </select>

          {/* Subject */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            aria-label="Filter by Subject"
            className="w-full p-2.5 bg-slate-50 dark:bg-desk-canvas border border-desk-border rounded-xl font-mono text-xs font-semibold outline-none text-slate-700 dark:text-slate-200 focus:border-primary-violet"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code}: {s.name}
              </option>
            ))}
          </select>

          {/* Solved PYQ Toggle */}
          <button
            onClick={() => setIsPYQOnly(!isPYQOnly)}
            className={`w-full p-2.5 rounded-xl font-mono text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
              isPYQOnly
                ? "bg-accent-amber text-slate-950 border-accent-amber shadow-xs"
                : "desk-card hover:border-accent-amber text-slate-700 dark:text-slate-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isPYQOnly ? "Showing Solved PYQs" : "Show Solved PYQs"}
          </button>
        </div>
      </div>

      {/* Notes Results Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 text-primary-violet animate-spin mb-2" />
          <span className="font-mono text-xs font-semibold">Filtering study notes catalog...</span>
        </div>
      ) : notes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl desk-card space-y-3">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Notes Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search filters or clearing the branch/year selection.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedBranch("");
              setSelectedYear("");
              setSelectedSubject("");
              setIsPYQOnly(false);
            }}
            className="font-mono px-4 py-2 text-xs font-bold text-primary-violet hover:underline"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-6 rounded-2xl desk-card hover:border-primary-violet flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {note.fileType}
                  </span>
                  {note.isPYQ ? (
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-accent-amber/10 text-accent-amber border border-accent-amber/30">
                      PYQ Solved {note.yearPYQ ? `(${note.yearPYQ})` : ""}
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-primary-violet/10 text-primary-violet border border-primary-violet/30">
                      Topper Notes
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                  {note.title}
                </h3>

                <div className="mt-2 font-mono text-xs font-semibold text-primary-violet">
                  {note.subject?.name} ({note.subject?.code})
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {note.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-desk-border flex items-center justify-between">
                <div className="font-mono text-[11px] text-slate-400">
                  <span>{note.fileSize}</span> • <span>{note.downloadCount} dl</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Download button */}
                  <button
                    onClick={() => handleDownload(note)}
                    aria-label="Download note"
                    className="p-2 rounded-xl desk-card hover:border-primary-violet text-slate-400 hover:text-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {/* Preview PDF */}
                  <button
                    onClick={() =>
                      setActivePdf({
                        url: note.fileUrl,
                        title: note.title,
                        id: note.id,
                      })
                    }
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold bg-primary-violet hover:bg-primary-violet/90 text-white shadow-glow-sm transition-all hover:scale-105"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* In-App PDF Preview Modal */}
      {activePdf && (
        <PDFViewerModal
          isOpen={Boolean(activePdf)}
          onClose={() => setActivePdf(null)}
          pdfUrl={activePdf.url}
          title={activePdf.title}
          noteId={activePdf.id}
        />
      )}
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div className="font-mono text-center py-20 text-slate-400">Loading notes catalog...</div>}>
      <NotesContent />
    </Suspense>
  );
}
