import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branch = searchParams.get("branch");
    const college = searchParams.get("college");

    const where: any = { role: "STUDENT", isActive: true };
    if (branch) where.branch = branch;
    if (college) where.college = { contains: college };

    const students = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        avatar: true,
        branch: true,
        college: true,
        streak: { select: { currentStreak: true } },
        xpTransactions: { select: { amount: true } },
        quizAttempts: { select: { score: true } },
        badges: { select: { badgeCode: true } },
      },
      take: 50,
    });

    const ranked = students
      .map((s) => {
        const txXP = s.xpTransactions.reduce((acc, t) => acc + t.amount, 0);
        const quizXP = s.quizAttempts.reduce((acc, q) => acc + Math.round(q.score * 2), 0);
        const totalXP = txXP + quizXP + (s.streak?.currentStreak || 1) * 10;

        return {
          id: s.id,
          name: s.name,
          avatar: s.avatar,
          branch: s.branch || "CSE",
          college: s.college || "B.Tech Institute",
          streak: s.streak?.currentStreak || 1,
          badgeCount: s.badges.length,
          totalXP,
        };
      })
      .sort((a, b) => b.totalXP - a.totalXP)
      .map((entry, idx) => ({
        ...entry,
        rank: idx + 1,
      }));

    return NextResponse.json({ leaderboard: ranked });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
