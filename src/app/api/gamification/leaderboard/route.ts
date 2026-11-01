import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { optionalText, parseQuery, z } from "@/lib/validation";

const query = z.object({
  branch: optionalText(16),
  college: optionalText(160),
});

export async function GET(req: NextRequest) {
  const parsed = parseQuery(req, query);
  if (parsed.error) return parsed.error;
  const { branch, college } = parsed.data;

  try {
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        isActive: true,
        ...(branch && { branch }),
        ...(college && { college: { contains: college, mode: "insensitive" as const } }),
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        branch: true,
        college: true,
        streak: { select: { currentStreak: true } },
        badges: { select: { badgeCode: true } },
      },
      take: 200,
    });

    const ids = students.map((s) => s.id);
    const [xpSums, quizSums] = await Promise.all([
      prisma.xpTransaction.groupBy({ by: ["userId"], where: { userId: { in: ids } }, _sum: { amount: true } }),
      prisma.quizAttempt.groupBy({ by: ["userId"], where: { userId: { in: ids } }, _sum: { score: true } }),
    ]);
    const xpBy = new Map(xpSums.map((r) => [r.userId, r._sum.amount ?? 0]));
    const quizBy = new Map(quizSums.map((r) => [r.userId, r._sum.score ?? 0]));

    const ranked = students
      .map((s) => {
        const streak = s.streak?.currentStreak || 1;
        return {
          id: s.id,
          name: s.name,
          avatar: s.avatar,
          branch: s.branch || "CSE",
          college: s.college || "B.Tech Institute",
          streak,
          badgeCount: s.badges.length,
          totalXP: (xpBy.get(s.id) ?? 0) + Math.round((quizBy.get(s.id) ?? 0) * 2) + streak * 10,
        };
      })
      .sort((a, b) => b.totalXP - a.totalXP)
      .slice(0, 50)
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

    return NextResponse.json({ leaderboard: ranked });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
