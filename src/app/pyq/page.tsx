"use client";

import { useState, useEffect } from "react";
import PDFViewerModal from "@/components/pdf/PDFViewerModal";
import Link from "next/link";
import {
  FileText,
  Download,
  Eye,
  Filter,
  Search,
  School,
  GraduationCap,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
} from "lucide-react";

export default function PYQPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedUni, setSelectedUni] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // PDF Preview Modal
  const [activePdf, setActivePdf] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    // Fetch initial options
    Promise.all([
      fetch("/api/universities").then((r) => r.json()),
      fetch("/api/academic/branches").then((r) => (r.ok ? r.json() : { branches: [] })),
    ])
      .then(([uniData, branchData]) => {
        if (uniData?.universities) setUniversities(uniData.universities);
        if (branchData?.branches) setBranches(branchData.branches);
      })
      .catch((err) => console.error("Error loading filter data:", err));
  }, []);

  const loadPapers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedUni) params.append("universityId", selectedUni);
    if (selectedBranch) params.append("branchId", selectedBranch);
    if (selectedYear) params.append("examYear", selectedYear);
    if (selectedType) params.append("examType", selectedType);

    fetch(`/api/pyq/papers?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setPapers(data.papers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadPapers();
  }, [selectedUni, selectedBranch, selectedYear, selectedType]);

  const filteredPapers = papers.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.subject.name.toLowerCase().includes(q) ||
      p.subject.code.toLowerCase().includes(q) ||
      p.university.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex flex-col font-sans transition-colors">
      
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-cyan-300 text-xs font-semibold mb-4 border border-white/10">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>AKTU • RTU • VTU • SPPU • GTU • JNTUH & More</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
              Previous Year Question Papers (PYQ Bank)
            </h1>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-6">
              Official university semester exam papers, mid-term sessionals, and backlogs papers.
              Download genuine PDF question papers or preview them instantly in your browser.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/subjects"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-sm shadow-md hover:bg-blue-50 transition-all"
              >
                <BookOpen className="w-4 h-4" />
                Browse by Subject
              </Link>
              <Link
                href="/universities"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm transition-all border border-white/20"
              >
                <School className="w-4 h-4" />
                Select University
              </Link>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white dark:bg-[#1C2541] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search subject, university, or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* University Filter */}
            <div>
              <select
                value={selectedUni}
                onChange={(e) => setSelectedUni(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Universities</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.code} ({u.name.length > 25 ? u.name.slice(0, 25) + "..." : u.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Exam Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
              </select>
            </div>

            {/* Exam Type Filter */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Exam Types</option>
                <option value="END_TERM">End-Term Regular</option>
                <option value="MID_TERM">Mid-Term Sessional</option>
                <option value="BACKLOG">Carry Over / Backlog</option>
              </select>
            </div>
          </div>
        </div>

        {/* Papers Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 text-sm">Loading exam papers...</p>
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="bg-white dark:bg-[#1C2541] rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
              No Question Papers Found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              Try adjusting your university, year, or search filters to find available past exam papers.
            </p>
            <button
              onClick={() => {
                setSelectedUni("");
                setSelectedBranch("");
                setSelectedYear("");
                setSelectedType("");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPapers.map((paper) => (
              <div
                key={paper.id}
                className="bg-white dark:bg-[#1C2541] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-6 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                      {paper.university?.code || "UNIV"}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-[11px] font-semibold border border-amber-200/80 dark:border-amber-800/80">
                      {paper.examYear} • {paper.examType.replace("_", " ")}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2 line-clamp-2">
                    {paper.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-6">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{paper.subject?.name} ({paper.subject?.code})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{paper.branch?.name} • Sem {paper.semester?.semesterNumber || "Any"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Size: {paper.fileSize} • {paper.downloadCount} Downloads</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setActivePdf({ url: paper.pdfUrl, title: paper.title })}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview PDF
                    </button>
                    <a
                      href={paper.pdfUrl}
                      download
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  </div>

                  <Link
                    href={`/subjects/${paper.subjectId}/important-questions`}
                    className="block text-center py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View Subject's Repeated Questions →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* PDF Modal Reader */}
      {activePdf && (
        <PDFViewerModal
          isOpen={true}
          onClose={() => setActivePdf(null)}
          pdfUrl={activePdf.url}
          title={activePdf.title}
        />
      )}

          </div>
  );
}
