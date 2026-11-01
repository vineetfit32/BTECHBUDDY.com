import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";
import { id, optionalId, optionalText, parseJson, parseQuery, text, z } from "@/lib/validation";

const status = z.enum(["SCHEDULED", "LIVE", "COMPLETED", "CANCELLED"]);

const listQuery = z.object({
  status: status.optional(),
  branchId: optionalId,
  semesterId: optionalId,
});

const createBody = z.object({
  title: text(200, "Title"),
  description: optionalText(5000),
  subjectId: id,
  branchId: optionalId,
  semesterId: optionalId,
  instructorId: optionalId,
  scheduledAt: z.coerce.date(),
  durationMinutes: z.coerce.number().int().min(10).max(600).default(60),
});

export async function GET(req: Request) {
  const parsed = parseQuery(req, listQuery);
  if (parsed.error) return parsed.error;

  try {
    const classes = await prisma.liveClass.findMany({
      where: {
        ...(parsed.data.status && { status: parsed.data.status }),
        ...(parsed.data.branchId && { branchId: parsed.data.branchId }),
        ...(parsed.data.semesterId && { semesterId: parsed.data.semesterId }),
      },
      include: {
        instructor: { select: { id: true, name: true, college: true, avatar: true } },
        subject: { select: { id: true, name: true, code: true } },
        branch: { select: { id: true, name: true, code: true } },
        semester: { select: { id: true, title: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 200,
    });
    return NextResponse.json({ liveClasses: classes });
  } catch (error) {
    console.error("Fetch live classes error:", error);
    return NextResponse.json({ error: "Failed to fetch live classes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR"])) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }
  const parsed = await parseJson(req, createBody);
  if (parsed.error) return parsed.error;
  const input = parsed.data;
  const admin = isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN"]) && user.role !== "INSTRUCTOR";
  let instructorId = user.id;
  if (admin) {
    if (!input.instructorId) {
      return NextResponse.json({ error: "Choose a tutor to take this lecture" }, { status: 400 });
    }
    instructorId = input.instructorId;
  }

  try {
    const tutor = await prisma.user.findUnique({
      where: { id: instructorId },
      select: { id: true, role: true, isActive: true },
    });
    if (!tutor || !tutor.isActive || tutor.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "That account is not an active tutor" }, { status: 400 });
    }

    const liveClass = await prisma.liveClass.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        instructorId: tutor.id,
        subjectId: input.subjectId,
        branchId: input.branchId ?? null,
        semesterId: input.semesterId ?? null,
        scheduledAt: input.scheduledAt,
        durationMinutes: input.durationMinutes,
        roomName: `btb-${crypto.randomBytes(9).toString("base64url")}`,
        status: "SCHEDULED",
      },
    });
    return NextResponse.json({ success: true, liveClass });
  } catch (error) {
    console.error("Schedule live class error:", error);
    return NextResponse.json({ error: "Failed to schedule live class" }, { status: 500 });
  }
}
