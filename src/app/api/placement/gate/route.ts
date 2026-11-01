import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { optionalId, parseQuery, z } from "@/lib/validation";

const query = z.object({
  subjectId: optionalId,
  year: z.string().regex(/^\d{4}$/).optional(),
  marks: z.enum(["1", "2"]).optional(),
});

const WEIGHTAGE = [
  { subject: "Engineering Mathematics", marks: "13-15%", color: "indigo" },
  { subject: "General Aptitude", marks: "15%", color: "blue" },
  { subject: "Data Structures & Algorithms", marks: "10-14%", color: "emerald" },
  { subject: "Operating Systems", marks: "8-10%", color: "amber" },
  { subject: "Databases (DBMS)", marks: "7-9%", color: "purple" },
  { subject: "Computer Networks", marks: "7-9%", color: "rose" },
  { subject: "Theory of Computation", marks: "8-10%", color: "cyan" },
  { subject: "Digital Logic & Architecture", marks: "9-11%", color: "orange" },
];

function parseOptions(json: string | null): string[] {
  if (!json) return [];
  try {
    const value = JSON.parse(json);
    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const parsed = parseQuery(req, query);
  if (parsed.error) return parsed.error;
  const { subjectId, year, marks } = parsed.data;

  try {
    const questions = await prisma.gateResource.findMany({
      where: {
        ...(subjectId && { subjectId }),
        ...(year && { year }),
        ...(marks && { marks: Number(marks) }),
      },
      include: { subject: { select: { id: true, name: true, code: true } } },
      orderBy: [{ year: "desc" }, { marks: "desc" }],
    });

    return NextResponse.json({
      questions: questions.map((q) => ({ ...q, options: parseOptions(q.optionsJson) })),
      weightage: WEIGHTAGE,
    });
  } catch (error) {
    console.error("Error fetching GATE resources:", error);
    return NextResponse.json({ error: "Failed to fetch GATE resources" }, { status: 500 });
  }
}
