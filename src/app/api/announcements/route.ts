import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";
import { optionalId, parseJson, parseQuery, text, z } from "@/lib/validation";

const priority = z.enum(["NORMAL", "HIGH", "URGENT"]);

const listQuery = z.object({
  branchId: optionalId,
  priority: priority.optional(),
});

const createBody = z.object({
  title: text(200, "Title"),
  content: text(5000, "Content"),
  type: z.enum(["GENERAL", "EXAM", "ALERT", "UPDATE"]).default("GENERAL"),
  priority: priority.default("NORMAL"),
  branchId: optionalId,
  semesterId: optionalId,
});

export async function GET(req: Request) {
  const parsed = parseQuery(req, listQuery);
  if (parsed.error) return parsed.error;

  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        isPublished: true,
        ...(parsed.data.branchId && { branchId: parsed.data.branchId }),
        ...(parsed.data.priority && { priority: parsed.data.priority }),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("Fetch announcements error:", error);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN"])) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }
  const parsed = await parseJson(req, createBody);
  if (parsed.error) return parsed.error;

  try {
    const announcement = await prisma.announcement.create({
      data: {
        ...parsed.data,
        branchId: parsed.data.branchId ?? null,
        semesterId: parsed.data.semesterId ?? null,
      },
    });
    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error("Create announcement error:", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
