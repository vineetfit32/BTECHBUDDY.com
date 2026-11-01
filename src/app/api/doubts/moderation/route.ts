import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";
import { enforceRateLimits } from "@/lib/rate-limit";
import { id, parseJson, text, z } from "@/lib/validation";

const body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("REPORT_POST"), postId: id, reason: text(500, "Reason") }),
  z.object({ action: z.literal("DISMISS_REPORT"), reportId: id }),
  z.object({ action: z.literal("DELETE_POST"), postId: id }),
]);

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const reports = await prisma.doubtReport.findMany({
      include: {
        post: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            subject: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in" }, { status: 401 });
  }
  const parsed = await parseJson(req, body);
  if (parsed.error) return parsed.error;
  const input = parsed.data;

  try {
    if (input.action === "REPORT_POST") {
      const limited = enforceRateLimits([{ key: `report:${user.id}`, limit: 10, windowMs: 60 * 60_000 }]);
      if (limited) return limited;

      const report = await prisma.doubtReport.create({
        data: { postId: input.postId, userId: user.id, reason: input.reason },
      });
      await prisma.doubtPost.update({ where: { id: input.postId }, data: { isReported: true } });
      return NextResponse.json({ report }, { status: 201 });
    }

    if (!isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (input.action === "DISMISS_REPORT") {
      await prisma.doubtReport.update({ where: { id: input.reportId }, data: { status: "DISMISSED" } });
      await logActivity({ userId: user.id, action: "DISMISS_DOUBT_REPORT", entityType: "DoubtReport", entityId: input.reportId });
      return NextResponse.json({ success: true });
    }

    await prisma.doubtPost.delete({ where: { id: input.postId } });
    await logActivity({ userId: user.id, action: "DELETE_REPORTED_DOUBT", entityType: "DoubtPost", entityId: input.postId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in doubt moderation:", error);
    return NextResponse.json({ error: "Moderation failed" }, { status: 500 });
  }
}
