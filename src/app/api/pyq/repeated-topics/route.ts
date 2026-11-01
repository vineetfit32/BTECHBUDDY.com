import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { optionalId, parseQuery, z } from "@/lib/validation";

const query = z.object({ subjectId: optionalId });

export async function GET(req: NextRequest) {
  const parsed = parseQuery(req, query);
  if (parsed.error) return parsed.error;

  try {
    const groups = await prisma.questionBank.groupBy({
      by: ["subjectId", "topicTag"],
      where: parsed.data.subjectId ? { subjectId: parsed.data.subjectId } : undefined,
      _sum: { frequencyCount: true, marks: true },
      _count: { _all: true },
    });

    const subjects = await prisma.subject.findMany({
      where: { id: { in: [...new Set(groups.map((g) => g.subjectId))] } },
      select: { id: true, name: true, code: true },
    });
    const subjectById = new Map(subjects.map((s) => [s.id, s]));

    const topics = groups
      .map((g) => {
        const count = g._count._all;
        const totalMarks = g._sum.marks ?? 0;
        const subject = subjectById.get(g.subjectId);
        return {
          topic: g.topicTag,
          frequency: g._sum.frequencyCount ?? 0,
          questionCount: count,
          subjectName: subject?.name ?? "",
          subjectCode: subject?.code ?? "",
          averageMarks: count ? Math.round(totalMarks / count) : 0,
          totalMarks,
        };
      })
      .sort((a, b) => b.frequency - a.frequency);

    return NextResponse.json({ topics });
  } catch (error) {
    console.error("Error computing repeated topics:", error);
    return NextResponse.json({ error: "Failed to compute topics" }, { status: 500 });
  }
}
