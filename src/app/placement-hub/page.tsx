"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Code2,
  CheckCircle2,
  Clock,
  RotateCcw,
  ExternalLink,
  Search,
  Building2,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
  FileText,
  Lightbulb,
  Sparkles,
} from "lucide-react";

export default function PlacementHubPage() {
  const [activeTab, setActiveTab] = useState<"dsa" | "companies" | "corecs">("dsa");
  const [dsaProblems, setDsaProblems] = useState<any[]>([]);
  const [companySets, setCompanySets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for DSA
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [dsaSearch, setDsaSearch] = useState("");

  // Filters for Companies
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRound, setSelectedRound] = useState("");

  // State for hint expansion and notes
  const [activeHintId, setActiveHintId] = useState<string | null>(null);
  const [expandedAnswers, setExpandedAnswers] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchDSA = async () => {
    try {
      const res = await fetch("/api/placement/dsa");
      const data = await res.json();
      if (data?.problems) setDsaProblems(data.problems);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/placement/companies");
      const data = await res.json();
      if (data?.sets) setCompanySets(data.sets);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([fetchDSA(), fetchCompanies()]).finally(() => setLoading(false));
  }, []);

  const handleUpdateStatus = async (problemId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/placement/dsa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, status: newStatus }),
      });

      if (res.status === 401) {
        alert("Please log in to track your DSA problem progress!");
        return;
      }

      const data = await res.json();
      setDsaProblems((prev) =>
        prev.map((p) => (p.id === problemId ? { ...p, status: newStatus } : p))
      );

      if (newStatus === "SOLVED" && data.xpEarned) {
        setToastMessage(`+${data.xpEarned} XP! Problem Solved.`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Compute DSA Progress
  const totalCount = dsaProblems.length;
  const solvedCount = dsaProblems.filter((p) => p.status === "SOLVED").length;
  const reviseCount = dsaProblems.filter((p) => p.status === "REVISE").length;
  const progressPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  const categories = Array.from(new Set(dsaProblems.map((p) => p.category)));

  const filteredDSA = dsaProblems.filter((p) => {
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (selectedDifficulty && p.difficulty !== selectedDifficulty) return false;
    if (dsaSearch) {
      const q = dsaSearch.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.companies && p.companies.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredCompanySets = companySets.filter((s) => {
    if (selectedCompany && s.companyName !== selectedCompany) return false;
    if (selectedRound && s.roundType !== selectedRound) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex flex-col font-sans transition-colors">
      
      {/* Floating XP Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white font-bold text-sm px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <Award className="w-5 h-5 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-cyan-300 text-xs font-semibold mb-4 border border-white/10">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Campus Placements 2025 • Service & Product Companies</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
              Placement & Coding Preparation Hub
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              Master the essential 450 DSA Sheet, company-specific technical rounds (TCS, Infosys,
              Amazon, Wipro), Core CS interview revision, and ATS-friendly resume creation.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/tools/resume-builder"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md hover:bg-indigo-700 transition-all"
              >
                <FileText className="w-4 h-4" />
                Build ATS Resume
              </Link>
              <Link
                href="/gate-prep"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm transition-all border border-white/20"
              >
                <Award className="w-4 h-4" />
                GATE 2025 Hub
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setActiveTab("dsa")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === "dsa"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-white dark:bg-[#1C2541] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
            }`}
          >
            <Code2 className="w-4 h-4" />
            DSA 450 Sheet Tracker
            <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px]">
              {solvedCount}/{totalCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("companies")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === "companies"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-white dark:bg-[#1C2541] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Company Interview Sets
          </button>

          <button
            onClick={() => setActiveTab("corecs")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === "corecs"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-white dark:bg-[#1C2541] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Core CS Revision Cheat Sheets
          </button>
        </div>

        {/* TAB 1: DSA 450 SHEET */}
        {activeTab === "dsa" && (
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-white dark:bg-[#1C2541] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Overall Completion
                  </span>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 text-center">
                <div>
                  <div className="text-xl font-black text-slate-900 dark:text-slate-100">
                    {solvedCount}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Solved
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                <div>
                  <div className="text-xl font-black text-slate-900 dark:text-slate-100">
                    {reviseCount}
                  </div>
                  <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    To Revise
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                <div>
                  <div className="text-xl font-black text-slate-900 dark:text-slate-100">
                    {totalCount - solvedCount}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400">
                    Remaining
                  </div>
                </div>
              </div>
            </div>

            {/* DSA Filter Toolbar */}
            <div className="bg-white dark:bg-[#1C2541] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search problem or company..."
                    value={dsaSearch}
                    onChange={(e) => setDsaSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 w-52 sm:w-64"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                >
                  <option value="">All Categories ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                >
                  <option value="">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>

            {/* Problem Table */}
            <div className="bg-white dark:bg-[#1C2541] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Problem Name</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Difficulty</th>
                      <th className="py-3.5 px-4">Companies</th>
                      <th className="py-3.5 px-4 text-right">Practice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredDSA.map((problem) => (
                      <tr
                        key={problem.id}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                          problem.status === "SOLVED"
                            ? "bg-emerald-50/20 dark:bg-emerald-950/10"
                            : ""
                        }`}
                      >
                        {/* Status Toggle Buttons */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                handleUpdateStatus(
                                  problem.id,
                                  problem.status === "SOLVED" ? "TODO" : "SOLVED"
                                )
                              }
                              className={`p-1.5 rounded-lg transition ${
                                problem.status === "SOLVED"
                                  ? "bg-emerald-600 text-white"
                                  : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              }`}
                              title={
                                problem.status === "SOLVED" ? "Mark as Unsolved" : "Mark as Solved"
                              }
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() =>
                                handleUpdateStatus(
                                  problem.id,
                                  problem.status === "REVISE" ? "TODO" : "REVISE"
                                )
                              }
                              className={`p-1.5 rounded-lg transition ${
                                problem.status === "REVISE"
                                  ? "bg-amber-500 text-white"
                                  : "text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                              }`}
                              title="Mark for Revision"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                        {/* Title & Hint */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <span>{problem.title}</span>
                            {problem.hints && (
                              <button
                                onClick={() =>
                                  setActiveHintId(
                                    activeHintId === problem.id ? null : problem.id
                                  )
                                }
                                className="text-amber-500 hover:text-amber-600"
                                title="View Hint"
                              >
                                <Lightbulb className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          {activeHintId === problem.id && (
                            <div className="mt-1 p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-[11px] text-amber-800 dark:text-amber-300">
                              💡 <strong>Hint:</strong> {problem.hints}
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                            {problem.category}
                          </span>
                        </td>

                        {/* Difficulty */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              problem.difficulty === "HARD"
                                ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                                : problem.difficulty === "MEDIUM"
                                ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                            }`}
                          >
                            {problem.difficulty}
                          </span>
                        </td>

                        {/* Company Tags */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {problem.companies?.split(",").map((c: string) => (
                              <span
                                key={c}
                                className="px-1.5 py-0.5 rounded-sm bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium"
                              >
                                {c.trim()}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Practice Link */}
                        <td className="py-3 px-4 text-right">
                          <a
                            href={problem.leetcodeUrl || problem.gfgUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition"
                          >
                            Solve <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPANY INTERVIEW SETS */}
        {activeTab === "companies" && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white dark:bg-[#1C2541] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200"
              >
                <option value="">All Companies (TCS, Infosys, Amazon, Wipro...)</option>
                <option value="TCS">TCS (Ninja & Digital)</option>
                <option value="Infosys">Infosys (Specialist Programmer)</option>
                <option value="Amazon">Amazon (SDE-1)</option>
                <option value="Wipro">Wipro (Elite NTH)</option>
              </select>

              <select
                value={selectedRound}
                onChange={(e) => setSelectedRound(e.target.value)}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200"
              >
                <option value="">All Rounds</option>
                <option value="ONLINE_ASSESSMENT">Online Assessment (Coding & Aptitude)</option>
                <option value="TECHNICAL_INTERVIEW">Technical Interview Round</option>
                <option value="HR">HR / Managerial Round</option>
              </select>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {filteredCompanySets.map((item) => {
                const isExpanded = expandedAnswers[item.id];
                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-[#1C2541] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-extrabold text-xs border border-indigo-200 dark:border-indigo-800">
                          {item.companyName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-200 dark:border-amber-800">
                          {item.role}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-semibold">
                          {item.roundType.replace("_", " ")} • {item.year}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mb-3">
                      {item.question}
                    </p>

                    <button
                      onClick={() =>
                        setExpandedAnswers((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" /> Hide Solution Approach
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" /> View Solution & Complexity
                        </>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-2">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 uppercase text-[11px]">
                          Interview Answer & Strategy
                        </div>
                        <p className="leading-relaxed whitespace-pre-line">{item.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: CORE CS REVISION CHEAT SHEETS */}
        {activeTab === "corecs" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Operating Systems */}
            <div className="bg-white dark:bg-[#1C2541] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                  OS
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Operating Systems Key Concepts
                </h3>
              </div>
              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <li className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <strong>Process vs Thread:</strong> Process is an executing program with isolated
                  address space; Thread is a lightweight execution unit sharing code, data, and OS
                  resources of parent process.
                </li>
                <li className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <strong>Deadlock Coffman Conditions:</strong> 1. Mutual Exclusion, 2. Hold and
                  Wait, 3. No Preemption, 4. Circular Wait. Breaking any one prevents deadlock.
                </li>
                <li className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <strong>Paging & Virtual Memory:</strong> Non-contiguous memory allocation dividing
                  physical memory into frames and logical memory into pages. TLB (Translation
                  Lookaside Buffer) accelerates page table address translation.
                </li>
              </ul>
            </div>

            {/* DBMS */}
            <div className="bg-white dark:bg-[#1C2541] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                  DB
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  DBMS & SQL Key Concepts
                </h3>
              </div>
              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <li className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <strong>ACID Properties:</strong> Atomicity (all or nothing), Consistency (preserves
                  invariants), Isolation (concurrent execution serializability), Durability (persisted
                  to disk).
                </li>
                <li className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <strong>Database Normalization:</strong> 1NF (atomic values), 2NF (1NF + no partial
                  dependency on composite key), 3NF (no transitive dependency), BCNF (every determinant
                  is a super key).
                </li>
                <li className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <strong>Clustered vs Non-Clustered Index:</strong> Clustered index physically sorts
                  and stores data rows in table (only 1 per table); Non-clustered index creates a separate
                  B+ tree pointing to physical row addresses.
                </li>
              </ul>
            </div>

            {/* Computer Networks */}
            <div className="bg-white dark:bg-[#1C2541] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  CN
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Computer Networks Key Concepts
                </h3>
              </div>
              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <li className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <strong>TCP 3-Way Handshake:</strong> SYN (client sends seq x) $\rightarrow$ SYN-ACK
                  (server acknowledges x+1 and sends seq y) $\rightarrow$ ACK (client acknowledges y+1).
                </li>
                <li className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <strong>TCP vs UDP:</strong> TCP is connection-oriented, reliable, guarantees order
                  and flow control (used in HTTP, FTP, SSH). UDP is connectionless, fast, lightweight
                  (used in DNS, VoIP, gaming).
                </li>
                <li className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <strong>What happens when you type a URL?</strong> 1. DNS resolution $\rightarrow$
                  2. TCP 3-way handshake $\rightarrow$ 3. TLS handshake (HTTPS) $\rightarrow$ 4. HTTP
                  GET request $\rightarrow$ 5. Server responds with HTML $\rightarrow$ 6. Browser renders
                  DOM/CSSOM.
                </li>
              </ul>
            </div>

            {/* OOP & System Design */}
            <div className="bg-white dark:bg-[#1C2541] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                  OOP
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Object-Oriented Programming (SOLID)
                </h3>
              </div>
              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <li className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <strong>4 Pillars:</strong> Encapsulation (data hiding), Abstraction (hiding implementation
                  details), Inheritance (reusability), Polymorphism (overloading & overriding).
                </li>
                <li className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <strong>SOLID Principles:</strong> Single Responsibility, Open/Closed, Liskov
                  Substitution, Interface Segregation, Dependency Inversion.
                </li>
                <li className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <strong>Common Design Patterns:</strong> Singleton (single instance), Factory (object
                  creation decoupling), Observer (event pub/sub), Strategy (interchangeable algorithms).
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>

          </div>
  );
}
