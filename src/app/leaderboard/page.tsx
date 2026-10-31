"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Flame,
  Award,
  Sparkles,
  School,
  Medal,
  Crown,
  Search,
} from "lucide-react";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState("");
  const [collegeSearch, setCollegeSearch] = useState("");

  const fetchLeaderboard = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedBranch) params.append("branch", selectedBranch);
    if (collegeSearch) params.append("college", collegeSearch);

    fetch(`/api/gamification/leaderboard?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.leaderboard) setLeaderboard(data.leaderboard);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetch("/api/academic/branches")
      .then((r) => (r.ok ? r.json() : { branches: [] }))
      .then((d) => {
        if (d?.branches) setBranches(d.branches);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedBranch, collegeSearch]);

  const top3 = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex flex-col font-sans transition-colors">
      
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-10 relative overflow-hidden text-center">
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-amber-200 text-xs font-semibold mb-4 border border-white/20">
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>National Engineering Leaderboard</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
              B.Tech Hall of Fame
            </h1>
            <p className="text-amber-100 text-sm sm:text-base leading-relaxed mb-6">
              Compete with fellow engineers across India. Earn XP by completing lecture units, practicing
              quizzes, solving 450 DSA problems, and maintaining daily study streaks.
            </p>
            <Link
              href="/student/achievements"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-orange-700 font-bold text-sm shadow-md hover:bg-amber-50 transition-all"
            >
              <Award className="w-4 h-4" /> View My Badges & Streak
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#1C2541] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Engineering Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.code}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Filter by college..."
                value={collegeSearch}
                onChange={(e) => setCollegeSearch(e.target.value)}
                className="pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 w-44 sm:w-56"
              />
            </div>
          </div>

          <span className="text-xs font-bold text-slate-500">
            {leaderboard.length} Engineers Ranked
          </span>
        </div>

        {/* Top 3 Podium */}
        {!loading && top3.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 items-end">
            {/* Rank 2 - Silver */}
            {top3[1] && (
              <div className="bg-white dark:bg-[#1C2541] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 text-center shadow-md order-2 md:order-1">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-base flex items-center justify-center mx-auto mb-3 shadow-inner">
                  #2
                </div>
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                  {top3[1].name}
                </h3>
                <span className="text-xs text-slate-500 block mb-3">
                  {top3[1].branch} • {top3[1].college}
                </span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                  {top3[1].totalXP} XP
                </div>
              </div>
            )}

            {/* Rank 1 - Gold Champion */}
            {top3[0] && (
              <div className="bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/20 dark:to-[#1C2541] rounded-3xl p-8 border-2 border-amber-400 dark:border-amber-600 text-center shadow-xl order-1 md:order-2 scale-105 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-md">
                  <Crown className="w-5 h-5 fill-amber-950" />
                </div>
                <div className="w-16 h-16 rounded-3xl bg-amber-400 text-amber-950 font-black text-xl flex items-center justify-center mx-auto mb-3 shadow-md mt-2">
                  #1
                </div>
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg">
                  {top3[0].name}
                </h3>
                <span className="text-xs text-slate-500 block mb-3">
                  {top3[0].branch} • {top3[0].college}
                </span>
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-300 font-black text-sm border border-amber-400/40">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  {top3[0].totalXP} XP
                </div>
              </div>
            )}

            {/* Rank 3 - Bronze */}
            {top3[2] && (
              <div className="bg-white dark:bg-[#1C2541] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 text-center shadow-md order-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 font-black text-base flex items-center justify-center mx-auto mb-3 shadow-inner">
                  #3
                </div>
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                  {top3[2].name}
                </h3>
                <span className="text-xs text-slate-500 block mb-3">
                  {top3[2].branch} • {top3[2].college}
                </span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {top3[2].totalXP} XP
                </div>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white dark:bg-[#1C2541] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-16">Rank</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Branch</th>
                  <th className="py-3.5 px-4">College</th>
                  <th className="py-3.5 px-4">Streak</th>
                  <th className="py-3.5 px-4 text-right">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-slate-100">
                      {entry.rank === 1 ? (
                        <span className="text-amber-500 font-extrabold">🥇 1</span>
                      ) : entry.rank === 2 ? (
                        <span className="text-slate-400 font-extrabold">🥈 2</span>
                      ) : entry.rank === 3 ? (
                        <span className="text-amber-700 font-extrabold">🥉 3</span>
                      ) : (
                        `#${entry.rank}`
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {entry.name}
                    </td>
                    <td className="py-3.5 px-4 text-indigo-600 dark:text-indigo-400 font-semibold">
                      {entry.branch}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{entry.college}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-orange-600 font-bold">
                        <Flame className="w-3.5 h-3.5 fill-orange-500" />
                        {entry.streak} Days
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-indigo-600 dark:text-indigo-400">
                      {entry.totalXP} XP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

          </div>
  );
}
