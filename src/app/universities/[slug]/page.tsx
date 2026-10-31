"use client";

import { useState, useEffect, use } from "react";
import PDFViewerModal from "@/components/pdf/PDFViewerModal";
import Link from "next/link";
import {
  School,
  FileText,
  Download,
  Eye,
  MapPin,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";

export default function UniversityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [university, setUniversity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePdf, setActivePdf] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    fetch(`/api/universities/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.university) setUniversity(data.university);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex flex-col font-sans transition-colors">
                <div className="py-24 text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 text-sm">Loading university details...</p>
        </div>
              </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex flex-col font-sans transition-colors">
                <div className="py-24 text-center max-w-md mx-auto px-4">
          <School className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
            University Not Found
          </h2>
          <Link
            href="/universities"
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            ← Back to Universities Directory
          </Link>
        </div>
              </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex flex-col font-sans transition-colors">
      
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <Link
          href="/universities"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Universities
        </Link>

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold mb-3 border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{university.state} Technical Board</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black mb-2">
                {university.name} ({university.code})
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Semester question papers, official syllabus structure, and exam resources for all affiliated colleges.
              </p>
            </div>

            {university.website && (
              <a
                href={university.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs shadow-md hover:bg-blue-50 transition shrink-0"
              >
                Official Portal <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Papers List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              {university.code} Question Papers
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              {university.papers?.length || 0} Papers Available
            </span>
          </div>

          {university.papers?.length === 0 ? (
            <div className="bg-white dark:bg-[#1C2541] rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No papers uploaded for this university yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {university.papers.map((p: any) => (
                <div
                  key={p.id}
                  className="bg-white dark:bg-[#1C2541] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold text-xs">
                        {p.examYear} • {p.examType}
                      </span>
                      <span className="text-xs text-slate-400">
                        {p.fileSize}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 mb-2 line-clamp-2">
                      {p.title}
                    </h3>

                    <div className="text-xs text-slate-500 mb-4 space-y-1">
                      <div>Subject: {p.subject?.name}</div>
                      <div>Branch: {p.branch?.code}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setActivePdf({ url: p.pdfUrl, title: p.title })}
                      className="py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <a
                      href={p.pdfUrl}
                      download
                      className="py-2 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
