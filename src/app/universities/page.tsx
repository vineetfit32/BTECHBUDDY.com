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
    <div className="min-h-screen bg-surface-2 flex flex-col font-sans transition-colors">
      
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Banner */}
        <div className="bg-linear-to-r from-blue-800 via-brand to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-accent text-xs font-semibold mb-4 border border-white/10">
              <Sparkles className="w-4 h-4 text-accent" />
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface text-brand font-bold text-sm shadow-md hover:bg-blue-50 transition-all"
              >
                <FileText className="w-4 h-4" />
                Browse All PYQs
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface rounded-2xl p-4 sm:p-5 border border-line shadow-xs mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-ink-3 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search university or code (e.g. AKTU, RTU)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs rounded-xl border border-line bg-surface-2 text-ink w-56 sm:w-72"
              />
            </div>

            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-line bg-surface-2 text-ink-2"
            >
              <option value="">All States ({states.length})</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs font-bold text-ink-3">
            {filtered.length} Universities Available
          </span>
        </div>

        {/* Universities Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-ink-3 text-sm">Loading universities...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((u) => (
              <div
                key={u.id}
                className="bg-surface rounded-2xl border border-line p-6 shadow-xs hover:shadow-md hover:border-line-strong transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-xl bg-brand-soft text-brand font-black text-xs border border-brand/35">
                      {u.code}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-3">
                      <MapPin className="w-3.5 h-3.5" />
                      {u.state}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-ink group-hover:text-brand transition-colors mb-2">
                    {u.name}
                  </h3>

                  <div className="text-xs text-ink-3 mb-6 space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-ink-3" />
                      <span>{u._count?.papers || 0} Solved Question Papers</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-line flex items-center justify-between">
                  <Link
                    href={`/universities/${u.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
                  >
                    View Papers & Syllabus <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {u.website && (
                    <a
                      href={u.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink-3 hover:text-ink-2"
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
