"use client";

import { useEffect } from "react";
import { emitMascot } from "@/lib/mascot/bus";
import { reward } from "@/lib/reward";

/** Checks the streak once per browser session and tells Buddy what changed. */
export default function StreakPing() {
  useEffect(() => {
    if (sessionStorage.getItem("btb-streak-ping")) return;
    sessionStorage.setItem("btb-streak-ping", "1");
    void fetch("/api/gamification/streak")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.streak) return;
        if (data.event === "INCREMENTED") emitMascot({ type: "STREAK_UP", days: data.streak.currentStreak });
        else if (data.event === "RESET") emitMascot({ type: "STREAK_LOST" });
        else if (data.atRisk) emitMascot({ type: "STREAK_RISK" });
        reward({ xp: data.xpEarned, badges: data.newBadges, reason: "Daily streak" });
      })
      .catch(() => undefined);
  }, []);
  return null;
}
