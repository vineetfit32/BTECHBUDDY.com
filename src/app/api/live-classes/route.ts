import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const branchId = searchParams.get("branchId");
    const semesterId = searchParams.get("semesterId");

    const where: any = {};
    if (status) where.status = status;
    if (branchId) where.branchId = branchId;
    if (semesterId) where.semesterId = semesterId;

    const classes = await prisma.liveClass.findMany({
      where,
      include: {
        instructor: { select: { id: true, name: true, college: true, avatar: true } },
        subject: { select: { id: true, name: true, code: true } },
        branch: { select: { id: true, name: true, code: true } },
        semester: { select: { id: true, title: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    return NextResponse.json({ liveClasses: classes });
  } catch (error) {
    console.error("Fetch live classes error:", error);
    return NextResponse.json({ error: "Failed to fetch live classes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR"])) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      subjectId,
      branchId,
      semesterId,
      scheduledAt,
      durationMinutes,
      meetingUrl,
      status,
    } = body;

    if (!title || !subjectId || !scheduledAt) {
      return NextResponse.json(
        { error: "Title, subject, and scheduled date/time are required" },
        { status: 400 }
      );
    }

    // Default room URL if none provided
    const safeRoomName = `BTechBuddy_${title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30)}_${Date.now()}`;
    const generatedMeetingUrl = meetingUrl || `https://meet.jit.si/${safeRoomName}`;

    const liveClass = await prisma.liveClass.create({
      data: {
        title,
        description,
        instructorId: user.id,
        subjectId,
        branchId: branchId || null,
        semesterId: semesterId || null,
        scheduledAt: new Date(scheduledAt),
        durationMinutes: parseInt(durationMinutes || 60),
        meetingUrl: generatedMeetingUrl,
        status: status || "SCHEDULED",
      },
    });

    return NextResponse.json({ success: true, liveClass });
  } catch (error) {
    console.error("Schedule live class error:", error);
    return NextResponse.json({ error: "Failed to schedule live class" }, { status: 500 });
  }
}
