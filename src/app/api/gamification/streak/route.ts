import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ streak: null });
    }

    let streak = await prisma.userStreak.findUnique({
      where: { userId: user.id },
    });

    if (!streak) {
      streak = await prisma.userStreak.create({
        data: {
          userId: user.id,
          currentStreak: 1,
          longestStreak: 1,
          freezesLeft: 2,
        },
      });
    }

    // Check days since lastActiveAt
    const now = new Date();
    const last = new Date(streak.lastActiveAt);
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Active yesterday -> Increment streak!
      const newCurrent = streak.currentStreak + 1;
      const newLongest = Math.max(newCurrent, streak.longestStreak);
      streak = await prisma.userStreak.update({
        where: { id: streak.id },
        data: {
          currentStreak: newCurrent,
          longestStreak: newLongest,
          lastActiveAt: now,
        },
      });

      // Award XP
      await prisma.xpTransaction.create({
        data: {
          userId: user.id,
          amount: 15,
          action: "STREAK_CHECKIN",
        },
      });

      // Award 3-day / 7-day badge if reached
      if (newCurrent >= 3) {
        await prisma.userBadge.upsert({
          where: { userId_badgeCode: { userId: user.id, badgeCode: "STREAK_3" } },
          update: {},
          create: { userId: user.id, badgeCode: "STREAK_3" },
        });
      }
      if (newCurrent >= 7) {
        await prisma.userBadge.upsert({
          where: { userId_badgeCode: { userId: user.id, badgeCode: "STREAK_7" } },
          update: {},
          create: { userId: user.id, badgeCode: "STREAK_7" },
        });
      }
    } else if (diffDays > 1) {
      // Missed more than 1 day
      if (streak.freezesLeft > 0) {
        // Use freeze
        streak = await prisma.userStreak.update({
          where: { id: streak.id },
          data: {
            freezesLeft: streak.freezesLeft - 1,
            lastActiveAt: now,
          },
        });
      } else {
        // Reset streak
        streak = await prisma.userStreak.update({
          where: { id: streak.id },
          data: {
            currentStreak: 1,
            lastActiveAt: now,
          },
        });
      }
    }

    return NextResponse.json({ streak });
  } catch (error) {
    console.error("Error evaluating streak:", error);
    return NextResponse.json({ error: "Failed to evaluate streak" }, { status: 500 });
  }
}
