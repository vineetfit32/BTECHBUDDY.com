import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { liveRole } from "@/lib/live-access";
import { enforceRateLimits } from "@/lib/rate-limit";
import { ensureClassRoom } from "@/lib/live-class";
import { ensureRoom, liveKitBrowserUrl, mintRoomToken } from "@/lib/livekit";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to join this class" }, { status: 401 });

  const limited = enforceRateLimits([{ key: `live-token:${user.id}`, limit: 30, windowMs: 10 * 60_000 }]);
  if (limited) return limited;

  const { id } = await ctx.params;
  const liveClass = await prisma.liveClass.findUnique({
    where: { id },
    select: { id: true, instructorId: true, roomName: true, status: true },
  });
  if (!liveClass) {
    return NextResponse.json({ error: "Live class not found" }, { status: 404 });
  }
  const roomName = await ensureClassRoom(liveClass);
  if (liveClass.status !== "LIVE") {
    return NextResponse.json({ error: "This class is not live" }, { status: 409 });
  }

  const role = liveRole(user, liveClass);
  if (role === "denied") {
    return NextResponse.json({ error: "This lecture is assigned to another tutor" }, { status: 403 });
  }

  try {
    await ensureRoom(roomName);
    const token = await mintRoomToken({
      roomName,
      identity: user.id,
      name: user.name,
      host: role === "host",
    });
    return NextResponse.json({
      token,
      url: liveKitBrowserUrl(),
      role,
    });
  } catch (error) {
    console.error("LiveKit token error:", error);
    return NextResponse.json({ error: "Live server is not reachable" }, { status: 503 });
  }
}
