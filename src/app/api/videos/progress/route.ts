import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { videoId, watchedSeconds, totalSeconds, isCompleted } = await req.json();

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
    }

    const progress = await prisma.videoProgress.upsert({
      where: {
        userId_videoId: {
          userId: user.id,
          videoId,
        },
      },
      update: {
        watchedSeconds: Math.floor(watchedSeconds || 0),
        totalSeconds: Math.floor(totalSeconds || 0),
        isCompleted: Boolean(isCompleted),
        lastWatchedAt: new Date(),
      },
      create: {
        userId: user.id,
        videoId,
        watchedSeconds: Math.floor(watchedSeconds || 0),
        totalSeconds: Math.floor(totalSeconds || 0),
        isCompleted: Boolean(isCompleted),
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error("Save video progress error:", error);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}
