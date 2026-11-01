import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { id, optionalText, parseJson, parseQuery, z } from "@/lib/validation";

const difficulty = z.enum(["EASY", "MEDIUM", "HARD"]);

const listQuery = z.object({
  category: optionalText(40),
  difficulty: difficulty.optional(),
  company: optionalText(40),
});

const progressBody = z.object({
  problemId: id,
  status: z.enum(["TODO", "SOLVED", "REVISE"]),
  notes: optionalText(5000),
});

export async function GET(req: NextRequest) {
  const parsed = parseQuery(req, listQuery);
  if (parsed.error) return parsed.error;
  const { category, difficulty: level, company } = parsed.data;

  try {
    const user = await getCurrentUser();
    const problems = await prisma.dsaProblem.findMany({
      where: {
        ...(category && { category }),
        ...(level && { difficulty: level }),
        ...(company && { companies: { contains: company, mode: "insensitive" as const } }),
      },
      include: {
        progress: user ? { where: { userId: user.id }, select: { status: true, notes: true, updatedAt: true } } : false,
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    const transformed = problems.map((p) => ({
      ...p,
      status: p.progress?.[0]?.status || "TODO",
      studentNotes: p.progress?.[0]?.notes || null,
    }));

    return NextResponse.json({ problems: transformed });
  } catch (error) {
    console.error("Error fetching DSA problems:", error);
    return NextResponse.json({ error: "Failed to fetch DSA problems" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  }
  const parsed = await parseJson(req, progressBody);
  if (parsed.error) return parsed.error;
  const { problemId, status, notes } = parsed.data;

  try {
    const previous = await prisma.studentDsaProgress.findUnique({
      where: { userId_problemId: { userId: user.id, problemId } },
      select: { status: true },
    });

    const progress = await prisma.studentDsaProgress.upsert({
      where: { userId_problemId: { userId: user.id, problemId } },
      update: { status, notes },
      create: { userId: user.id, problemId, status, notes: notes ?? null },
    });

    const firstSolve = status === "SOLVED" && previous?.status !== "SOLVED";
    if (firstSolve) {
      const alreadyRewarded = await prisma.xpTransaction.findFirst({
        where: { userId: user.id, action: `DSA_SOLVED:${problemId}` },
        select: { id: true },
      });
      if (!alreadyRewarded) {
        await prisma.xpTransaction.create({ data: { userId: user.id, amount: 25, action: `DSA_SOLVED:${problemId}` } });
        return NextResponse.json({ progress, xpEarned: 25 });
      }
    }

    return NextResponse.json({ progress, xpEarned: 0 });
  } catch (error) {
    console.error("Error updating DSA progress:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}
