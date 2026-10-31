import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const courseId = searchParams.get("courseId");
    const search = searchParams.get("search");

    const where: any = { isPublished: true };
    if (subjectId) where.subjectId = subjectId;
    if (courseId) where.courseId = courseId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const videos = await prisma.videoLecture.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        unit: { select: { id: true, title: true, unitNumber: true } },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Fetch videos error:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
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
      videoUrl,
      videoProvider,
      duration,
      durationSec,
      thumbnail,
      subjectId,
      unitId,
      courseId,
      order,
      isFree,
    } = body;

    if (!title || !videoUrl || !subjectId) {
      return NextResponse.json(
        { error: "Title, video URL, and subject are required" },
        { status: 400 }
      );
    }

    const video = await prisma.videoLecture.create({
      data: {
        title,
        description,
        videoUrl,
        videoProvider: videoProvider || "YOUTUBE",
        duration: duration || "45:00",
        durationSec: durationSec || 2700,
        thumbnail,
        subjectId,
        unitId: unitId || null,
        courseId: courseId || null,
        order: order ? parseInt(order) : 1,
        isFree: isFree !== undefined ? Boolean(isFree) : true,
      },
    });

    return NextResponse.json({ success: true, video });
  } catch (error) {
    console.error("Create video error:", error);
    return NextResponse.json({ error: "Failed to add video" }, { status: 500 });
  }
}
