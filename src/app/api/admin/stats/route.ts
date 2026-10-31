import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const [
      totalStudents,
      totalInstructors,
      totalAdmins,
      totalCourses,
      totalNotes,
      totalVideos,
      totalLiveClasses,
      totalQuizzes,
      totalQuizAttempts,
      recentUsers,
      recentNotes,
      recentAttempts,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "INSTRUCTOR" } }),
      prisma.user.count({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } } }),
      prisma.course.count(),
      prisma.note.count(),
      prisma.videoLecture.count(),
      prisma.liveClass.count(),
      prisma.quiz.count(),
      prisma.quizAttempt.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, createdAt: true, branch: true },
      }),
      prisma.note.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { subject: { select: { name: true, code: true } } },
      }),
      prisma.quizAttempt.findMany({
        take: 5,
        orderBy: { completedAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          quiz: { select: { title: true } },
        },
      }),
    ]);

    // Calculate total downloads
    const noteAggregations = await prisma.note.aggregate({
      _sum: {
        downloadCount: true,
        viewCount: true,
      },
    });

    return NextResponse.json({
      stats: {
        totalStudents,
        totalInstructors,
        totalAdmins,
        totalCourses,
        totalNotes,
        totalVideos,
        totalLiveClasses,
        totalQuizzes,
        totalQuizAttempts,
        totalDownloads: noteAggregations._sum.downloadCount || 0,
        totalViews: noteAggregations._sum.viewCount || 0,
      },
      recentUsers,
      recentNotes,
      recentAttempts,
    });
  } catch (error) {
    console.error("Fetch admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch platform analytics" }, { status: 500 });
  }
}
