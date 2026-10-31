import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const year = searchParams.get("year");
    const marks = searchParams.get("marks");

    const where: any = {};
    if (subjectId) where.subjectId = subjectId;
    if (year) where.year = year;
    if (marks) where.marks = Number(marks);

    const questions = await prisma.gateResource.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, code: true } },
      },
      orderBy: [{ year: "desc" }, { marks: "desc" }],
    });

    const parsed = questions.map((q) => ({
      ...q,
      options: q.optionsJson ? JSON.parse(q.optionsJson) : [],
    }));

    // GATE weightage analysis for CSE
    const weightage = [
      { subject: "Engineering Mathematics", marks: "13-15%", color: "indigo" },
      { subject: "General Aptitude", marks: "15%", color: "blue" },
      { subject: "Data Structures & Algorithms", marks: "10-14%", color: "emerald" },
      { subject: "Operating Systems", marks: "8-10%", color: "amber" },
      { subject: "Databases (DBMS)", marks: "7-9%", color: "purple" },
      { subject: "Computer Networks", marks: "7-9%", color: "rose" },
      { subject: "Theory of Computation", marks: "8-10%", color: "cyan" },
      { subject: "Digital Logic & Architecture", marks: "9-11%", color: "orange" },
    ];

    return NextResponse.json({ questions: parsed, weightage });
  } catch (error) {
    console.error("Error fetching GATE resources:", error);
    return NextResponse.json({ error: "Failed to fetch GATE resources" }, { status: 500 });
  }
}
