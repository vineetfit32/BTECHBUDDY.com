import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ subjects: [] });
    }

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
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to track attendance" }, { status: 401 });
    }

    const body = await req.json();
    const { subjectName, attendedClasses, totalClasses, minimumPercentage } = body;

    if (!subjectName) {
      return NextResponse.json({ error: "Subject name is required" }, { status: 400 });
    }

    const subject = await prisma.attendanceSubject.create({
      data: {
        userId: user.id,
        subjectName,
        attendedClasses: attendedClasses ? Number(attendedClasses) : 0,
        totalClasses: totalClasses ? Number(totalClasses) : 0,
        minimumPercentage: minimumPercentage ? Number(minimumPercentage) : 75.0,
      },
    });

    return NextResponse.json({ subject }, { status: 201 });
  } catch (error) {
    console.error("Error creating attendance subject:", error);
    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, attendedChange, totalChange, attendedClasses, totalClasses } = body;

    const existing = await prisma.attendanceSubject.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    let newAttended = existing.attendedClasses;
    let newTotal = existing.totalClasses;

    if (attendedChange !== undefined) newAttended += attendedChange;
    if (totalChange !== undefined) newTotal += totalChange;

    if (attendedClasses !== undefined) newAttended = attendedClasses;
    if (totalClasses !== undefined) newTotal = totalClasses;

    // Safety checks
    if (newAttended < 0) newAttended = 0;
    if (newTotal < 0) newTotal = 0;
    if (newAttended > newTotal) newTotal = newAttended;

    const updated = await prisma.attendanceSubject.update({
      where: { id },
      data: {
        attendedClasses: newAttended,
        totalClasses: newTotal,
      },
    });

    return NextResponse.json({ subject: updated });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing subject id" }, { status: 400 });
    }

    await prisma.attendanceSubject.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting attendance subject:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
