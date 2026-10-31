"use client";

import { useState, useEffect } from "react";
import StudentSidebar from "@/components/student/StudentSidebar";
import Link from "next/link";
import {
  Sparkles,
  Flame,
  Award,
  Shield,
  Trophy,
  CheckCircle2,
  Lock,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function StudentAchievementsPage() {
  const [streak, setStreak] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/gamification/streak").then((r) => r.json()),
      fetch("/api/gamification/badges").then((r) => r.json()),
    ])
      .then(([sData, bData]) => {
        if (sData?.streak) setStreak(sData.streak);
        if (bData?.badges) setBadges(bData.badges);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex flex-col font-sans transition-colors">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <StudentSidebar />

          <main className="flex-1 w-full space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-indigo-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-amber-200 text-xs font-semibold mb-3 border border-white/20">
                  <Flame className="w-3.5 h-3.5 fill-amber-300" />
                  <span>Consistency & Milestones</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black">
                  My Badges, Streaks & XP
                </h1>
                <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-xl">
                  Learn every day, practice coding problems, and collect milestone badges on your B.Tech journey.
                </p>
              </div>

              <Link
                href="/leaderboard"
                className="px-5 py-2.5 rounded-xl bg-white text-orange-700 font-bold text-xs shadow-md hover:bg-amber-50 transition shrink-0 inline-flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" /> View Leaderboard
              </Link>
            </div>

            {/* Streak & Freeze Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-[#1C2541] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Current Streak
                  </span>
                  <div className="text-3xl font-black text-orange-600 flex items-center gap-1.5 mt-1">
                    <Flame className="w-6 h-6 fill-orange-500" />
                    {streak?.currentStreak || 1} Days
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400 font-semibold">
                  Record: {streak?.longestStreak || 1}d
                </div>
              </div>

              <div className="bg-white dark:bg-[#1C2541] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Streak Freezes Left
                  </span>
                  <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
                    {streak?.freezesLeft || 0}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white dark:bg-[#1C2541] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Badges Unlocked
                  </span>
                  <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                    {unlockedCount} / {badges.length}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Badges Showcase */}
            <div className="bg-white dark:bg-[#1C2541] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Achievement Badges Showcase
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((b) => (
                  <div
                    key={b.code}
                    className={`p-5 rounded-2xl border transition-all ${
                      b.isUnlocked
                        ? "bg-gradient-to-br from-amber-50/60 to-white dark:from-amber-950/20 dark:to-slate-900 border-amber-300 dark:border-amber-800/80 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="text-3xl">{b.icon}</div>
                      {b.isUnlocked ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" /> Unlocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">
                      {b.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
