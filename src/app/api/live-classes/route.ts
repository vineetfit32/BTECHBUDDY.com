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
  scheduledAt: z.coerce.date(),
  durationMinutes: z.coerce.number().int().min(10).max(600).default(60),
  status: status.default("SCHEDULED"),
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

  try {
    const liveClass = await prisma.liveClass.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        instructorId: user.id,
        subjectId: input.subjectId,
        branchId: input.branchId ?? null,
        semesterId: input.semesterId ?? null,
        scheduledAt: input.scheduledAt,
        durationMinutes: input.durationMinutes,
        roomName: `btb-${crypto.randomBytes(9).toString("base64url")}`,
        status: input.status,
      },
    });
    return NextResponse.json({ success: true, liveClass });
  } catch (error) {
    console.error("Schedule live class error:", error);
    return NextResponse.json({ error: "Failed to schedule live class" }, { status: 500 });
  }
}
