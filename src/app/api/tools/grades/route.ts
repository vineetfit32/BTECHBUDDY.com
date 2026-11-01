import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { parseJson, text, z } from "@/lib/validation";

const subjectRow = z.object({
  name: text(160, "Subject name"),
  grade: z.string().trim().max(4),
  credits: z.coerce.number().min(0).max(10),
  gradePoints: z.coerce.number().min(0).max(10).optional(),
});

const createBody = z.object({
  semesterNumber: z.coerce.number().int().min(1).max(10),
  totalCredits: z.coerce.number().min(1).max(60),
  sgpa: z.coerce.number().min(0).max(10),
  cgpa: z.preprocess((v) => (v === "" || v === null ? undefined : v), z.coerce.number().min(0).max(10).optional()),
  percentage: z.preprocess((v) => (v === "" || v === null ? undefined : v), z.coerce.number().min(0).max(100).optional()),
  subjects: z.array(subjectRow).min(1).max(20),
});

function parseSubjects(json: string) {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ results: [] });

  try {
    const results = await prisma.semesterGradeResult.findMany({
      where: { userId: user.id },
      orderBy: { semesterNumber: "asc" },
    });
    return NextResponse.json({ results: results.map((r) => ({ ...r, subjects: parseSubjects(r.subjectsJson) })) });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to save your semester report" }, { status: 401 });
  }
  const parsed = await parseJson(req, createBody);
  if (parsed.error) return parsed.error;
  const { subjects, cgpa, percentage, ...rest } = parsed.data;

  try {
    const record = await prisma.semesterGradeResult.create({
      data: {
        userId: user.id,
        ...rest,
        cgpa: cgpa ?? null,
        percentage: percentage ?? null,
        subjectsJson: JSON.stringify(subjects),
      },
    });
    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error("Error saving grades:", error);
    return NextResponse.json({ error: "Failed to save grades" }, { status: 500 });
  }
}
