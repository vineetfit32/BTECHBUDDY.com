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
    <div className="min-h-screen bg-surface-2 flex flex-col font-sans transition-colors">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <StudentSidebar />

          <main className="flex-1 w-full space-y-6">
            {/* Header */}
            <div className="bg-linear-to-r from-orange-600 via-warn to-brand p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-warn text-xs font-semibold mb-3 border border-white/20">
                  <Flame className="w-3.5 h-3.5 fill-warn" />
                  <span>Consistency & Milestones</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black">
                  My Badges, Streaks & XP
                </h1>
                <p className="text-warn text-xs sm:text-sm mt-1 max-w-xl">
                  Learn every day, practice coding problems, and collect milestone badges on your B.Tech journey.
                </p>
              </div>

              <Link
                href="/leaderboard"
                className="px-5 py-2.5 rounded-xl bg-surface text-orange-700 font-bold text-xs shadow-md hover:bg-warn-soft transition shrink-0 inline-flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" /> View Leaderboard
              </Link>
            </div>

            {/* Streak & Freeze Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface p-5 rounded-2xl border border-line shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
                    Current Streak
                  </span>
                  <div className="text-3xl font-black text-orange-600 flex items-center gap-1.5 mt-1">
                    <Flame className="w-6 h-6 fill-orange-500" />
                    {streak?.currentStreak || 1} Days
                  </div>
                </div>
                <div className="text-right text-xs text-ink-3 font-semibold">
                  Record: {streak?.longestStreak || 1}d
                </div>
              </div>

              <div className="bg-surface p-5 rounded-2xl border border-line shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
                    Streak Freezes Left
                  </span>
                  <div className="text-3xl font-black text-accent mt-1">
                    {streak?.freezesLeft || 0}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-surface p-5 rounded-2xl border border-line shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
                    Badges Unlocked
                  </span>
                  <div className="text-3xl font-black text-brand mt-1">
                    {unlockedCount} / {badges.length}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Badges Showcase */}
            <div className="bg-surface rounded-2xl p-6 border border-line shadow-xs">
              <h3 className="text-base font-bold text-ink mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-brand" />
                Achievement Badges Showcase
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((b) => (
                  <div
                    key={b.code}
                    className={`p-5 rounded-2xl border transition-all ${
                      b.isUnlocked
                        ? "bg-linear-to-br from-warn/60 to-white dark:to-slate-900 border-warn/35 shadow-xs"
                        : "bg-surface-2 border-line opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="text-3xl">{b.icon}</div>
                      {b.isUnlocked ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-ok-soft text-ok">
                          <CheckCircle2 className="w-3 h-3" /> Unlocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-3 text-ink-2">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-ink mb-1">
                      {b.title}
                    </h4>
                    <p className="text-xs text-ink-3 leading-relaxed">
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
