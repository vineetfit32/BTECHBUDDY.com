import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const BADGE_DEFINITIONS = [
  {
    code: "FIRST_STEP",
    title: "First Step",
    description: "Completed your first study resource or lecture on BTECHBUDDY.",
    icon: "🌱",
    category: "BEGINNER",
  },
  {
    code: "STREAK_3",
    title: "Streak Starter (3 Days)",
    description: "Maintained a consistent 3-day active study streak.",
    icon: "🔥",
    category: "STREAK",
  },
  {
    code: "STREAK_7",
    title: "Streak Warrior (7 Days)",
    description: "Consistent learning streak for 7 consecutive days.",
    icon: "⚡",
    category: "STREAK",
  },
  {
    code: "QUIZ_WHIZ",
    title: "Quiz Whiz",
    description: "Passed an engineering practice test with high distinction.",
    icon: "🎯",
    category: "ASSESSMENT",
  },
  {
    code: "DSA_PIONEER",
    title: "DSA Pioneer",
    description: "Solved 10+ core algorithmic problems from the Placement Sheet.",
    icon: "💻",
    category: "CODING",
  },
  {
    code: "NIGHT_OWL",
    title: "Night Owl Engineer",
    description: "Studied exam units during late night engineering sprint hours.",
    icon: "🦉",
    category: "SPECIAL",
  },
];

export async function GET() {
  try {
    const user = await getCurrentUser();
    let earnedCodes: string[] = [];

    if (user) {
      const userBadges = await prisma.userBadge.findMany({
        where: { userId: user.id },
      });
      earnedCodes = userBadges.map((b) => b.badgeCode);
    }

    const badges = BADGE_DEFINITIONS.map((b) => ({
      ...b,
      isUnlocked: earnedCodes.includes(b.code),
    }));

    return NextResponse.json({ badges, earnedCount: earnedCodes.length });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 });
  }
}
