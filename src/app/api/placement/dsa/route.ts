import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const company = searchParams.get("company");

    const user = await getCurrentUser();

    const where: any = {};
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (company) where.companies = { contains: company };

    const problems = await prisma.dsaProblem.findMany({
      where,
      include: {
        progress: user
          ? {
              where: { userId: user.id },
              select: { status: true, notes: true, updatedAt: true },
            }
          : false,
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
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in" }, { status: 401 });
    }

    const body = await req.json();
    const { problemId, status, notes } = body;

    if (!problemId || !status) {
      return NextResponse.json({ error: "Missing problemId or status" }, { status: 400 });
    }

    const progress = await prisma.studentDsaProgress.upsert({
      where: {
        userId_problemId: {
          userId: user.id,
          problemId,
        },
      },
      update: {
        status,
        notes: notes !== undefined ? notes : undefined,
      },
      create: {
        userId: user.id,
        problemId,
        status,
        notes: notes || null,
      },
    });

    // If solved, award 25 XP
    if (status === "SOLVED") {
      await prisma.xpTransaction.create({
        data: {
          userId: user.id,
          amount: 25,
          action: "DSA_SOLVED",
        },
      });
    }

    return NextResponse.json({ progress, xpEarned: status === "SOLVED" ? 25 : 0 });
  } catch (error) {
    console.error("Error updating DSA progress:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}
