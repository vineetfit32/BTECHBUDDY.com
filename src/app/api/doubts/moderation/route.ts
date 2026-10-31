import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }

    const body = await req.json();
    const { action, postId, reportId, reason } = body;

    // Report a post (Available to students)
    if (action === "REPORT_POST") {
      if (!postId || !reason) {
        return NextResponse.json({ error: "Post ID and reason required" }, { status: 400 });
      }

      const report = await prisma.doubtReport.create({
        data: {
          postId,
          userId: user.id,
          reason,
        },
      });

      await prisma.doubtPost.update({
        where: { id: postId },
        data: { isReported: true },
      });

      return NextResponse.json({ report }, { status: 201 });
    }

    // Admin Moderation actions
    if (!isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (action === "DISMISS_REPORT" && reportId) {
      await prisma.doubtReport.update({
        where: { id: reportId },
        data: { status: "DISMISSED" },
      });

      await logActivity({
        userId: user.id,
        action: "DISMISS_DOUBT_REPORT",
        entityType: "DoubtReport",
        entityId: reportId,
      });

      return NextResponse.json({ success: true });
    }

    if (action === "DELETE_POST" && postId) {
      await prisma.doubtPost.delete({
        where: { id: postId },
      });

      await logActivity({
        userId: user.id,
        action: "DELETE_REPORTED_DOUBT",
        entityType: "DoubtPost",
        entityId: postId,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in doubt moderation:", error);
    return NextResponse.json({ error: "Moderation failed" }, { status: 500 });
  }
}
