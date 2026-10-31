import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ results: [] });
    }

    const results = await prisma.semesterGradeResult.findMany({
      where: { userId: user.id },
      orderBy: { semesterNumber: "asc" },
    });

    const parsed = results.map((r) => ({
      ...r,
      subjects: JSON.parse(r.subjectsJson),
    }));

    return NextResponse.json({ results: parsed });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to save your semester report" }, { status: 401 });
    }

    const body = await req.json();
    const { semesterNumber, totalCredits, sgpa, cgpa, percentage, subjects } = body;

    if (!semesterNumber || !totalCredits || sgpa === undefined || !subjects) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const record = await prisma.semesterGradeResult.create({
      data: {
        userId: user.id,
        semesterNumber: Number(semesterNumber),
        totalCredits: Number(totalCredits),
        sgpa: Number(sgpa),
        cgpa: cgpa ? Number(cgpa) : null,
        percentage: percentage ? Number(percentage) : null,
        subjectsJson: JSON.stringify(subjects),
      },
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error("Error saving grades:", error);
    return NextResponse.json({ error: "Failed to save grades" }, { status: 500 });
  }
}
