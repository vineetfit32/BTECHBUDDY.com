import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { id, parseJson, parseQuery, text, z } from "@/lib/validation";

const count = z.coerce.number().int().min(0).max(10_000);

const createBody = z.object({
  subjectName: text(160, "Subject"),
  attendedClasses: count.default(0),
  totalClasses: count.default(0),
  minimumPercentage: z.coerce.number().min(0).max(100).default(75),
});

const updateBody = z.object({
  id,
  attendedChange: z.coerce.number().int().min(-100).max(100).optional(),
  totalChange: z.coerce.number().int().min(-100).max(100).optional(),
  attendedClasses: count.optional(),
  totalClasses: count.optional(),
});

const deleteQuery = z.object({ id });

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ subjects: [] });

  try {
    const subjects = await prisma.attendanceSubject.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to track attendance" }, { status: 401 });
  }
  const parsed = await parseJson(req, createBody);
  if (parsed.error) return parsed.error;
  const input = parsed.data;

  try {
    const subject = await prisma.attendanceSubject.create({
      data: {
        userId: user.id,
        ...input,
        totalClasses: Math.max(input.totalClasses, input.attendedClasses),
      },
    });
    return NextResponse.json({ subject }, { status: 201 });
  } catch (error) {
    console.error("Error creating attendance subject:", error);
    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = await parseJson(req, updateBody);
  if (parsed.error) return parsed.error;
  const input = parsed.data;

  try {
    const existing = await prisma.attendanceSubject.findFirst({ where: { id: input.id, userId: user.id } });
    if (!existing) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    let attended = input.attendedClasses ?? existing.attendedClasses + (input.attendedChange ?? 0);
    let total = input.totalClasses ?? existing.totalClasses + (input.totalChange ?? 0);
    attended = Math.max(0, attended);
    total = Math.max(attended, total, 0);

    const subject = await prisma.attendanceSubject.update({
      where: { id: existing.id },
      data: { attendedClasses: attended, totalClasses: total },
    });
    return NextResponse.json({ subject });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = parseQuery(req, deleteQuery);
  if (parsed.error) return parsed.error;

  try {
    await prisma.attendanceSubject.deleteMany({ where: { id: parsed.data.id, userId: user.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting attendance subject:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
