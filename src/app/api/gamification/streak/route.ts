import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { advanceStreak, isStreakAtRisk, type StreakEvent } from "@/lib/streak";

const STREAK_BADGES: Array<[number, string]> = [
  [3, "STREAK_3"],
  [7, "STREAK_7"],
];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ streak: null });

  try {
    const now = new Date();
    const existing = await prisma.userStreak.findUnique({ where: { userId: user.id } });

    if (!existing) {
      const streak = await prisma.userStreak.create({
        data: { userId: user.id, currentStreak: 1, longestStreak: 1, freezesLeft: 2, lastActiveAt: now },
      });
      return NextResponse.json({ streak, event: "STARTED" satisfies StreakEvent, xpEarned: 0, newBadges: [], atRisk: false });
    }

    const atRisk = isStreakAtRisk(existing.lastActiveAt, now);
    const { next, event } = advanceStreak(existing, now);
    if (event === "SAME_DAY") {
      return NextResponse.json({ streak: existing, event, xpEarned: 0, newBadges: [], atRisk: false });
    }

    const streak = await prisma.userStreak.update({
      where: { id: existing.id },
      data: {
        currentStreak: next.currentStreak,
        longestStreak: next.longestStreak,
        freezesLeft: next.freezesLeft,
        lastActiveAt: next.lastActiveAt,
      },
    });

    let xpEarned = 0;
    const newBadges: string[] = [];
    if (event === "INCREMENTED") {
      xpEarned = 15;
      await prisma.xpTransaction.create({ data: { userId: user.id, amount: xpEarned, action: "STREAK_CHECKIN" } });
      for (const [days, code] of STREAK_BADGES) {
        if (streak.currentStreak < days) continue;
        const created = await prisma.userBadge.createMany({
          data: [{ userId: user.id, badgeCode: code }],
          skipDuplicates: true,
        });
        if (created.count) newBadges.push(code);
      }
    }

    return NextResponse.json({ streak, event, xpEarned, newBadges, atRisk });
  } catch (error) {
    console.error("Error evaluating streak:", error);
    return NextResponse.json({ error: "Failed to evaluate streak" }, { status: 500 });
  }
}
