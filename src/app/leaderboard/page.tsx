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
    <div className="min-h-screen bg-surface-2 flex flex-col font-sans transition-colors">
      
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="bg-linear-to-r from-warn via-orange-600 to-danger rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-10 relative overflow-hidden text-center">
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-warn text-xs font-semibold mb-4 border border-white/20">
              <Trophy className="w-4 h-4 text-warn" />
              <span>National Engineering Leaderboard</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
              B.Tech Hall of Fame
            </h1>
            <p className="text-warn text-sm sm:text-base leading-relaxed mb-6">
              Compete with fellow engineers across India. Earn XP by completing lecture units, practicing
              quizzes, solving 450 DSA problems, and maintaining daily study streaks.
            </p>
            <Link
              href="/student/achievements"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface text-orange-700 font-bold text-sm shadow-md hover:bg-warn-soft transition-all"
            >
              <Award className="w-4 h-4" /> View My Badges & Streak
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface rounded-2xl p-4 sm:p-5 border border-line shadow-xs mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-line bg-surface-2 text-ink-2"
            >
              <option value="">All Engineering Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.code}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-3 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Filter by college..."
                value={collegeSearch}
                onChange={(e) => setCollegeSearch(e.target.value)}
                className="pl-8 pr-3 py-2 text-xs rounded-xl border border-line bg-surface-2 text-ink w-44 sm:w-56"
              />
            </div>
          </div>

          <span className="text-xs font-bold text-ink-3">
            {leaderboard.length} Engineers Ranked
          </span>
        </div>

        {/* Top 3 Podium */}
        {!loading && top3.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 items-end">
            {/* Rank 2 - Silver */}
            {top3[1] && (
              <div className="bg-surface rounded-3xl p-6 border border-line text-center shadow-md order-2 md:order-1">
                <div className="w-12 h-12 rounded-2xl bg-surface-3 text-ink-2 font-black text-base flex items-center justify-center mx-auto mb-3 shadow-inner">
                  #2
                </div>
                <h3 className="font-black text-ink text-base">
                  {top3[1].name}
                </h3>
                <span className="text-xs text-ink-3 block mb-3">
                  {top3[1].branch} • {top3[1].college}
                </span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 text-ink-2 font-extrabold text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-ink-3" />
                  {top3[1].totalXP} XP
                </div>
              </div>
            )}

            {/* Rank 1 - Gold Champion */}
            {top3[0] && (
              <div className="bg-linear-to-b from-warn-soft to-white dark:to-[#1C2541] rounded-3xl p-8 border-2 border-warn text-center shadow-xl order-1 md:order-2 scale-105 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-warn text-warn flex items-center justify-center shadow-md">
                  <Crown className="w-5 h-5 fill-warn" />
                </div>
                <div className="w-16 h-16 rounded-3xl bg-warn text-warn font-black text-xl flex items-center justify-center mx-auto mb-3 shadow-md mt-2">
                  #1
                </div>
                <h3 className="font-black text-ink text-lg">
                  {top3[0].name}
                </h3>
                <span className="text-xs text-ink-3 block mb-3">
                  {top3[0].branch} • {top3[0].college}
                </span>
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-warn/20 text-warn font-black text-sm border border-warn/40">
                  <Trophy className="w-4 h-4 text-warn" />
                  {top3[0].totalXP} XP
                </div>
              </div>
            )}

            {/* Rank 3 - Bronze */}
            {top3[2] && (
              <div className="bg-surface rounded-3xl p-6 border border-line text-center shadow-md order-3">
                <div className="w-12 h-12 rounded-2xl bg-warn-soft text-warn font-black text-base flex items-center justify-center mx-auto mb-3 shadow-inner">
                  #3
                </div>
                <h3 className="font-black text-ink text-base">
                  {top3[2].name}
                </h3>
                <span className="text-xs text-ink-3 block mb-3">
                  {top3[2].branch} • {top3[2].college}
                </span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warn/60 text-warn font-extrabold text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-warn" />
                  {top3[2].totalXP} XP
                </div>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-surface rounded-2xl border border-line overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-2 text-ink-3 font-bold border-b border-line uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-16">Rank</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Branch</th>
                  <th className="py-3.5 px-4">College</th>
                  <th className="py-3.5 px-4">Streak</th>
                  <th className="py-3.5 px-4 text-right">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-surface-2/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-black text-ink">
                      {entry.rank === 1 ? (
                        <span className="text-warn font-extrabold">🥇 1</span>
                      ) : entry.rank === 2 ? (
                        <span className="text-ink-3 font-extrabold">🥈 2</span>
                      ) : entry.rank === 3 ? (
                        <span className="text-warn font-extrabold">🥉 3</span>
                      ) : (
                        `#${entry.rank}`
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-ink">
                      {entry.name}
                    </td>
                    <td className="py-3.5 px-4 text-brand font-semibold">
                      {entry.branch}
                    </td>
                    <td className="py-3.5 px-4 text-ink-3">{entry.college}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-orange-600 font-bold">
                        <Flame className="w-3.5 h-3.5 fill-orange-500" />
                        {entry.streak} Days
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-brand">
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
