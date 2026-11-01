"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { reward } from "@/lib/reward";
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
        reward({ xp: data.xpEarned, reason: "Problem solved" });
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
    <div className="min-h-screen bg-surface-2 flex flex-col font-sans transition-colors">
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="bg-linear-to-r from-slate-900 via-brand to-blue-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-accent text-xs font-semibold mb-4 border border-white/10">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>Campus Placements 2025 • Service & Product Companies</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
              Placement & Coding Preparation Hub
            </h1>
            <p className="text-ink-2 text-sm sm:text-base leading-relaxed mb-6">
              Master the essential 450 DSA Sheet, company-specific technical rounds (TCS, Infosys,
              Amazon, Wipro), Core CS interview revision, and ATS-friendly resume creation.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/tools/resume-builder"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white font-bold text-sm shadow-md hover:bg-brand-strong transition-all"
              >
                <FileText className="w-4 h-4" />
                Build ATS Resume
              </Link>
              <Link
                href="/gate-prep"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-xs transition-all border border-white/20"
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
                ? "bg-brand text-white shadow-md shadow-brand/20"
                : "bg-surface text-ink-2 border border-line hover:bg-surface-2"
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
                ? "bg-brand text-white shadow-md shadow-brand/20"
                : "bg-surface text-ink-2 border border-line hover:bg-surface-2"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Company Interview Sets
          </button>

          <button
            onClick={() => setActiveTab("corecs")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === "corecs"
                ? "bg-brand text-white shadow-md shadow-brand/20"
                : "bg-surface text-ink-2 border border-line hover:bg-surface-2"
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
            <div className="bg-surface rounded-2xl p-6 border border-line shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
                    Overall Completion
                  </span>
                  <span className="text-xs font-black text-brand">
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full bg-surface-2 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-brand h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 text-center">
                <div>
                  <div className="text-xl font-black text-ink">
                    {solvedCount}
                  </div>
                  <div className="text-[11px] font-semibold text-ok">
                    Solved
                  </div>
                </div>
                <div className="w-px h-8 bg-surface-3" />
                <div>
                  <div className="text-xl font-black text-ink">
                    {reviseCount}
                  </div>
                  <div className="text-[11px] font-semibold text-warn">
                    To Revise
                  </div>
                </div>
                <div className="w-px h-8 bg-surface-3" />
                <div>
                  <div className="text-xl font-black text-ink">
                    {totalCount - solvedCount}
                  </div>
                  <div className="text-[11px] font-semibold text-ink-3">
                    Remaining
                  </div>
                </div>
              </div>
            </div>

            {/* DSA Filter Toolbar */}
            <div className="bg-surface rounded-2xl p-4 border border-line shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-ink-3 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search problem or company..."
                    value={dsaSearch}
                    onChange={(e) => setDsaSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 text-xs rounded-xl border border-line bg-surface-2 text-ink w-52 sm:w-64"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs font-semibold px-3 py-2 rounded-xl border border-line bg-surface-2 text-ink-2"
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
                  className="text-xs font-semibold px-3 py-2 rounded-xl border border-line bg-surface-2 text-ink-2"
                >
                  <option value="">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>

            {/* Problem Table */}
            <div className="bg-surface rounded-2xl border border-line overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-2 text-ink-3 font-bold border-b border-line uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Problem Name</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Difficulty</th>
                      <th className="py-3.5 px-4">Companies</th>
                      <th className="py-3.5 px-4 text-right">Practice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredDSA.map((problem) => (
                      <tr
                        key={problem.id}
                        className={`hover:bg-surface-2/50 transition-colors ${
                          problem.status === "SOLVED"
                            ? "bg-ok/20"
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
                                  ? "bg-ok text-white"
                                  : "text-ink-3 hover:text-ok hover:bg-ok-soft"
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
                                  ? "bg-warn text-white"
                                  : "text-ink-3 hover:text-warn hover:bg-warn-soft"
                              }`}
                              title="Mark for Revision"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                        {/* Title & Hint */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-ink flex items-center gap-2">
                            <span>{problem.title}</span>
                            {problem.hints && (
                              <button
                                onClick={() =>
                                  setActiveHintId(
                                    activeHintId === problem.id ? null : problem.id
                                  )
                                }
                                className="text-warn hover:text-warn"
                                title="View Hint"
                              >
                                <Lightbulb className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          {activeHintId === problem.id && (
                            <div className="mt-1 p-2 bg-warn-soft border border-warn/35 rounded-lg text-[11px] text-warn">
                              💡 <strong>Hint:</strong> {problem.hints}
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-surface-2 text-ink-2 font-semibold text-[11px]">
                            {problem.category}
                          </span>
                        </td>

                        {/* Difficulty */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              problem.difficulty === "HARD"
                                ? "bg-danger-soft text-danger"
                                : problem.difficulty === "MEDIUM"
                                ? "bg-warn-soft text-warn"
                                : "bg-ok-soft text-ok"
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
                                className="px-1.5 py-0.5 rounded-xs bg-brand-soft text-brand text-[10px] font-medium"
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
            <div className="bg-surface rounded-2xl p-4 border border-line shadow-xs flex flex-wrap items-center gap-3">
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-line bg-surface-2 text-ink-2"
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
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-line bg-surface-2 text-ink-2"
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
                    className="bg-surface rounded-2xl p-6 border border-line shadow-xs hover:border-line-strong transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-brand-soft text-brand font-extrabold text-xs border border-brand/35">
                          {item.companyName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-warn-soft text-warn text-xs font-semibold border border-warn/35">
                          {item.role}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-surface-2 text-ink-2 text-[11px] font-semibold">
                          {item.roundType.replace("_", " ")} • {item.year}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base font-bold text-ink mb-3">
                      {item.question}
                    </p>

                    <button
                      onClick={() =>
                        setExpandedAnswers((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
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
                      <div className="mt-4 p-4 rounded-xl bg-surface-2 border border-line text-xs sm:text-sm text-ink-2 space-y-2">
                        <div className="font-bold text-ok uppercase text-[11px]">
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
            <div className="bg-surface rounded-2xl p-6 border border-line shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                  OS
                </div>
                <h3 className="text-base font-bold text-ink">
                  Operating Systems Key Concepts
                </h3>
              </div>
              <ul className="space-y-3 text-xs text-ink-2">
                <li className="p-3 bg-surface-2 rounded-xl border border-line/80">
                  <strong>Process vs Thread:</strong> Process is an executing program with isolated
                  address space; Thread is a lightweight execution unit sharing code, data, and OS
                  resources of parent process.
                </li>
                <li className="p-3 bg-surface-2 rounded-xl border border-line/80">
                  <strong>Deadlock Coffman Conditions:</strong> 1. Mutual Exclusion, 2. Hold and
                  Wait, 3. No Preemption, 4. Circular Wait. Breaking any one prevents deadlock.
                </li>
                <li className="p-3 bg-surface-2 rounded-xl border border-line/80">
                  <strong>Paging & Virtual Memory:</strong> Non-contiguous memory allocation dividing
                  physical memory into frames and logical memory into pages. TLB (Translation
                  Lookaside Buffer) accelerates page table address translation.
                </li>
              </ul>
            </div>

            {/* DBMS */}
            <div className="bg-surface rounded-2xl p-6 border border-line shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center font-bold text-xs">
                  DB
                </div>
                <h3 className="text-base font-bold text-ink">
                  DBMS & SQL Key Concepts
                </h3>
              </div>
              <ul className="space-y-3 text-xs text-ink-2">
                <li className="p-3 bg-surface-2 rounded-xl border border-line/80">
                  <strong>ACID Properties:</strong> Atomicity (all or nothing), Consistency (preserves
                  invariants), Isolation (concurrent execution serializability), Durability (persisted
                  to disk).
                </li>
                <li className="p-3 bg-surface-2 rounded-xl border border-line/80">
                  <strong>Database Normalization:</strong> 1NF (atomic values), 2NF (1NF + no partial
                  dependency on composite key), 3NF (no transitive dependency), BCNF (every determinant
                  is a super key).
                </li>
                <li className="p-3 bg-surface-2 rounded-xl border border-line/80">
                  <strong>Clustered vs Non-Clustered Index:</strong> Clustered index physically sorts
                  and stores data rows in table (only 1 per table); Non-clustered index creates a separate
                  B+ tree pointing to physical row addresses.
                </li>
              </ul>
            </div>

            {/* Computer Networks */}
            <div className="bg-surface rounded-2xl p-6 border border-line shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-ok-soft text-ok flex items-center justify-center font-bold text-xs">
                  CN
                </div>
                <h3 className="text-base font-bold text-ink">
                  Computer Networks Key Concepts
                </h3>
              </div>
              <ul className="space-y-3 text-xs text-ink-2">
                <li className="p-3 bg-surface-2 rounded-xl border border-line/80">
                  <strong>TCP 3-Way Handshake:</strong> SYN (client sends seq x) $\rightarrow$ SYN-ACK
                  (server acknowledges x+1 and sends seq y) $\rightarrow$ ACK (client acknowledges y+1).
                </li>
                <li className="p-3 bg-surface-2 rounded-xl border border-line/80">
                  <strong>TCP vs UDP:</strong> TCP is connection-oriented, reliable, guarantees order
                  and flow control (used in HTTP, FTP, SSH). UDP is connectionless, fast, lightweight
                  (used in DNS, VoIP, gaming).
                </li>
                <li className="p-3 bg-surface-2 rounded-xl border border-line/80">
                  <strong>What happens when you type a URL?</strong> 1. DNS resolution $\rightarrow$
                  2. TCP 3-way handshake $\rightarrow$ 3. TLS handshake (HTTPS) $\rightarrow$ 4. HTTP
                  GET request $\rightarrow$ 5. Server responds with HTML $\rightarrow$ 6. Browser renders
                  DOM/CSSOM.
                </li>
              </ul>
            </div>

            {/* OOP & System Design */}
            <div className="bg-surface rounded-2xl p-6 border border-line shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-danger-soft text-danger flex items-center justify-center font-bold text-xs">
                  OOP
                </div>
                <h3 className="text-base font-bold text-ink">
                  Object-Oriented Programming (SOLID)
                </h3>
              </div>
              <ul className="space-y-3 text-xs text-ink-2">
                <li className="p-3 bg-surface-2 rounded-xl border border-line/80">
                  <strong>4 Pillars:</strong> Encapsulation (data hiding), Abstraction (hiding implementation
                  details), Inheritance (reusability), Polymorphism (overloading & overriding).
                </li>
                <li className="p-3 bg-surface-2 rounded-xl border border-line/80">
                  <strong>SOLID Principles:</strong> Single Responsibility, Open/Closed, Liskov
                  Substitution, Interface Segregation, Dependency Inversion.
                </li>
                <li className="p-3 bg-surface-2 rounded-xl border border-line/80">
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
