"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  School,
  FileText,
  MapPin,
  ExternalLink,
  Search,
  Sparkles,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("");

  useEffect(() => {
    fetch("/api/universities")
      .then((r) => r.json())
      .then((data) => {
        if (data?.universities) setUniversities(data.universities);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const states = Array.from(new Set(universities.map((u) => u.state)));

  const filtered = universities.filter((u) => {
    if (selectedState && u.state !== selectedState) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.code.toLowerCase().includes(q) ||
        u.state.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex flex-col font-sans transition-colors">
      
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-800 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-cyan-300 text-xs font-semibold mb-4 border border-white/10">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>State Technical Universities Curriculum Directory</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
              Explore Universities & Schemes
            </h1>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-6">
              Browse customized curriculum, solved previous year question papers, and syllabus schemes
              tailored to your engineering university.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/pyq"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-sm shadow-md hover:bg-blue-50 transition-all"
              >
                <FileText className="w-4 h-4" />
                Browse All PYQs
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#1C2541] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search university or code (e.g. AKTU, RTU)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 w-56 sm:w-72"
              />
            </div>

            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200"
            >
              <option value="">All States ({states.length})</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs font-bold text-slate-500">
            {filtered.length} Universities Available
          </span>
        </div>

        {/* Universities Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 text-sm">Loading universities...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((u) => (
              <div
                key={u.id}
                className="bg-white dark:bg-[#1C2541] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-black text-xs border border-indigo-200 dark:border-indigo-800">
                      {u.code}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {u.state}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                    {u.name}
                  </h3>

                  <div className="text-xs text-slate-500 mb-6 space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{u._count?.papers || 0} Solved Question Papers</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Link
                    href={`/universities/${u.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View Papers & Syllabus <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {u.website && (
                    <a
                      href={u.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="Official Website"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

          </div>
  );
}
