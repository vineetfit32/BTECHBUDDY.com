import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");

    const where: any = {};
    if (subjectId) where.subjectId = subjectId;

    const questions = await prisma.questionBank.findMany({
      where,
      select: {
        id: true,
        topicTag: true,
        marks: true,
        frequencyCount: true,
        subjectId: true,
        subject: { select: { name: true, code: true } },
      },
    });

    // Aggregate frequency and count by topic
    const topicMap: Record<
      string,
      {
        topic: string;
        frequency: number;
        questionCount: number;
        subjectName: string;
        subjectCode: string;
        averageMarks: number;
        totalMarks: number;
      }
    > = {};

    for (const q of questions) {
      const key = `${q.subjectId}_${q.topicTag}`;
      if (!topicMap[key]) {
        topicMap[key] = {
          topic: q.topicTag,
          frequency: q.frequencyCount,
          questionCount: 1,
          subjectName: q.subject.name,
          subjectCode: q.subject.code,
          averageMarks: q.marks,
          totalMarks: q.marks,
        };
      } else {
        topicMap[key].frequency += q.frequencyCount;
        topicMap[key].questionCount += 1;
        topicMap[key].totalMarks += q.marks;
        topicMap[key].averageMarks = Math.round(
          topicMap[key].totalMarks / topicMap[key].questionCount
        );
      }
    }

    const repeatedTopics = Object.values(topicMap).sort(
      (a, b) => b.frequency - a.frequency
    );

    return NextResponse.json({ topics: repeatedTopics });
  } catch (error) {
    console.error("Error computing repeated topics:", error);
    return NextResponse.json({ error: "Failed to compute topics" }, { status: 500 });
  }
}
