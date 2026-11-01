import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { id, parseJson, z } from "@/lib/validation";

const seconds = z.coerce.number().min(0).max(24 * 3600).transform(Math.floor);

const body = z.object({
  videoId: id,
  watchedSeconds: seconds.default(0),
  totalSeconds: seconds.default(0),
  isCompleted: z.boolean().default(false),
});

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ progress: null });
  const videoId = id.safeParse(new URL(req.url).searchParams.get("videoId"));
  if (!videoId.success) return NextResponse.json({ error: "videoId is required" }, { status: 400 });

  const progress = await prisma.videoProgress.findUnique({
    where: { userId_videoId: { userId: user.id, videoId: videoId.data } },
  });
  return NextResponse.json({ progress });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const parsed = await parseJson(req, body);
  if (parsed.error) return parsed.error;
  const { videoId, watchedSeconds, totalSeconds, isCompleted } = parsed.data;

  try {
    const progress = await prisma.videoProgress.upsert({
      where: { userId_videoId: { userId: user.id, videoId } },
      update: { watchedSeconds, totalSeconds, isCompleted, lastWatchedAt: new Date() },
      create: { userId: user.id, videoId, watchedSeconds, totalSeconds, isCompleted },
    });
    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error("Save video progress error:", error);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}
