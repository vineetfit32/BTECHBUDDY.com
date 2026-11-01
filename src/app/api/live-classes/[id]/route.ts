import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";
import { id, parseJson, z } from "@/lib/validation";

const liveInclude = {
  instructor: { select: { id: true, name: true, college: true, avatar: true } },
  subject: { select: { id: true, name: true, code: true } },
  branch: { select: { id: true, name: true, code: true } },
  semester: { select: { id: true, title: true } },
} as const;

const assignBody = z.object({
  instructorId: id,
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: classId } = await ctx.params;
  try {
    const liveClass = await prisma.liveClass.findUnique({
      where: { id: classId },
      include: liveInclude,
    });
    if (!liveClass) return NextResponse.json({ error: "Live class not found" }, { status: 404 });
    return NextResponse.json({ liveClass });
  } catch (error) {
    console.error("Fetch live class error:", error);
    return NextResponse.json({ error: "Failed to fetch live class" }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN"])) {
    return NextResponse.json({ error: "Only an admin can assign a tutor" }, { status: 403 });
  }
  const parsed = await parseJson(req, assignBody);
  if (parsed.error) return parsed.error;
  const { id: classId } = await ctx.params;

  try {
    const existing = await prisma.liveClass.findUnique({ where: { id: classId } });
    if (!existing) return NextResponse.json({ error: "Live class not found" }, { status: 404 });
    if (existing.status !== "SCHEDULED") {
      return NextResponse.json({ error: "Only a scheduled class can be reassigned" }, { status: 409 });
    }

    const tutor = await prisma.user.findUnique({
      where: { id: parsed.data.instructorId },
      select: { id: true, role: true, isActive: true, name: true },
    });
    if (!tutor || !tutor.isActive || tutor.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "That account is not an active tutor" }, { status: 400 });
    }

    const liveClass = await prisma.liveClass.update({
      where: { id: classId },
      data: { instructorId: tutor.id },
      include: liveInclude,
    });
    return NextResponse.json({ success: true, liveClass });
  } catch (error) {
    console.error("Assign tutor error:", error);
    return NextResponse.json({ error: "Failed to assign tutor" }, { status: 500 });
  }
}
