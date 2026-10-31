"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  Briefcase,
  Code2,
  Building2,
  Plus,
  CheckCircle2,
  Trash2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminPlacementPage() {
  const [activeTab, setActiveTab] = useState<"dsa" | "companies">("dsa");
  const [problems, setProblems] = useState<any[]>([]);
  const [companySets, setCompanySets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New Problem Form
  const [problemModalOpen, setProblemModalOpen] = useState(false);
  const [problemForm, setProblemForm] = useState({
    title: "",
    category: "Arrays",
    difficulty: "EASY",
    leetcodeUrl: "",
    gfgUrl: "",
    companies: "TCS,Infosys,Amazon",
    hints: "",
  });

  // New Company Set Form
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    companyName: "TCS",
    roundType: "ONLINE_ASSESSMENT",
    role: "Ninja / Digital",
    year: "2024",
    question: "",
    answer: "",
    tags: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dRes, cRes] = await Promise.all([
        fetch("/api/placement/dsa").then((r) => r.json()),
        fetch("/api/placement/companies").then((r) => r.json()),
      ]);
      if (dRes?.problems) setProblems(dRes.problems);
      if (cRes?.sets) setCompanySets(cRes.sets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCompanySet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/placement/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyForm),
      });
      if (res.ok) {
        setStatusMessage("Company interview question added!");
        setCompanyModalOpen(false);
        fetchData();
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        const d = await res.json();
        alert(d.error || "Failed to create company set");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex flex-col font-sans transition-colors">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AdminSidebar />

          <main className="flex-1 w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1C2541] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-rose-600" />
                  Placement & GATE Hub Management
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Manage the DSA 450 Sheet and real company interview questions.
                </p>
              </div>

              <div className="flex gap-2">
                {activeTab === "companies" && (
                  <button
                    onClick={() => setCompanyModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm transition"
                  >
                    <Plus className="w-4 h-4" /> Add Company Question
                  </button>
                )}
              </div>
            </div>

            {/* Status Alert */}
            {statusMessage && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Tab Nav */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
              <button
                onClick={() => setActiveTab("dsa")}
                className={`pb-3 text-sm font-bold border-b-2 transition ${
                  activeTab === "dsa"
                    ? "border-rose-600 text-rose-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                DSA Problem Sheet ({problems.length})
              </button>
              <button
                onClick={() => setActiveTab("companies")}
                className={`pb-3 text-sm font-bold border-b-2 transition ${
                  activeTab === "companies"
                    ? "border-rose-600 text-rose-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Company Sets ({companySets.length})
              </button>
            </div>

            {/* DSA Sheet Tab */}
            {activeTab === "dsa" && (
              <div className="bg-white dark:bg-[#1C2541] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Problem</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Difficulty</th>
                        <th className="py-3 px-4">Companies</th>
                        <th className="py-3 px-4">Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {problems.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                            {p.title}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                            {p.category}
                          </td>
                          <td className="py-3 px-4 uppercase text-[10px] font-bold">
                            {p.difficulty}
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {p.companies}
                          </td>
                          <td className="py-3 px-4 text-indigo-600 font-semibold">
                            {p.leetcodeUrl ? "LeetCode" : "GFG"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Company Sets Tab */}
            {activeTab === "companies" && (
              <div className="bg-white dark:bg-[#1C2541] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Company / Role</th>
                        <th className="py-3 px-4">Round</th>
                        <th className="py-3 px-4">Question</th>
                        <th className="py-3 px-4">Year</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {companySets.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">
                              {s.companyName}
                            </span>
                            <span className="text-[11px] text-slate-400">{s.role}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                              {s.roundType}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-md text-slate-700 dark:text-slate-300 line-clamp-2">
                            {s.question}
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-semibold">{s.year}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Add Company Set Modal */}
      {companyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C2541] rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
              Add Company Interview Question
            </h3>
            <form onSubmit={handleCreateCompanySet} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Company</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TCS, Infosys, Amazon"
                    value={companyForm.companyName}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, companyName: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Round Type</label>
                  <select
                    value={companyForm.roundType}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, roundType: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  >
                    <option value="ONLINE_ASSESSMENT">Online Assessment</option>
                    <option value="TECHNICAL_INTERVIEW">Technical Interview</option>
                    <option value="HR">HR / Managerial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Target Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SDE-1 / Digital"
                    value={companyForm.role}
                    onChange={(e) => setCompanyForm({ ...companyForm, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Year</label>
                  <input
                    type="text"
                    value={companyForm.year}
                    onChange={(e) => setCompanyForm({ ...companyForm, year: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Interview Question</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter full interview question or problem statement..."
                  value={companyForm.question}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, question: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Expected Solution / Strategy</label>
                <textarea
                  rows={3}
                  placeholder="Enter solution strategy, time/space complexity..."
                  value={companyForm.answer}
                  onChange={(e) => setCompanyForm({ ...companyForm, answer: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setCompanyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
