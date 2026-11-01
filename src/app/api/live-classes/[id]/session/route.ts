import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";
import { parseJson, z } from "@/lib/validation";
import { ensureClassRoom } from "@/lib/live-class";
import { ensureRoom, publishRecording, startParticipantRecording, stopRoomRecording } from "@/lib/livekit";

const body = z.object({
  action: z.enum(["start", "record", "end"]),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const parsed = await parseJson(req, body);
  if (parsed.error) return parsed.error;

  const { id } = await ctx.params;
  const liveClass = await prisma.liveClass.findUnique({ where: { id } });
  if (!liveClass) {
    return NextResponse.json({ error: "Live class not found" }, { status: 404 });
  }
  const roomName = await ensureClassRoom(liveClass);

  const isHost = user.id === liveClass.instructorId;
  const isAdmin = isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN"]);
  if ((parsed.data.action === "start" || parsed.data.action === "record") && !isHost) {
    return NextResponse.json({ error: "Only the assigned tutor can go live" }, { status: 403 });
  }
  if (parsed.data.action === "end" && !isHost && !isAdmin) {
    return NextResponse.json({ error: "Only the assigned tutor can end this class" }, { status: 403 });
  }

  try {
    if (parsed.data.action === "start") {
      if (liveClass.status === "COMPLETED" || liveClass.status === "CANCELLED") {
        return NextResponse.json({ error: "This class has already finished" }, { status: 409 });
      }
      await ensureRoom(roomName);
      const updated = await prisma.liveClass.update({
        where: { id },
        data: { status: "LIVE" },
      });
      return NextResponse.json({ success: true, status: updated.status });
    }

    if (parsed.data.action === "record") {
      if (liveClass.status !== "LIVE") {
        return NextResponse.json({ error: "Go live before recording" }, { status: 409 });
      }
      if (liveClass.recordingEgressId) {
        return NextResponse.json({ success: true, recording: true });
      }
      try {
        const recordingEgressId = await startParticipantRecording(roomName, user.id);
        await prisma.liveClass.update({ where: { id }, data: { recordingEgressId } });
        return NextResponse.json({ success: true, recording: true });
      } catch (error) {
        console.error("Start recording error:", error);
        const message = error instanceof Error ? error.message : "";
        if (/participant|not found|no such/i.test(message)) {
          return NextResponse.json({ error: "Waiting for the tutor to join the room" }, { status: 409 });
        }
        return NextResponse.json(
          { error: "The recorder is not running. Start the live profile to save this session." },
          { status: 503 },
        );
      }
    }

    let recordingUrl = liveClass.recordingUrl;
    if (liveClass.recordingEgressId) {
      try {
        await stopRoomRecording(liveClass.recordingEgressId);
      } catch (error) {
        console.error("Stop recording error:", error);
      }
      recordingUrl = (await publishRecording(roomName)) ?? recordingUrl;
    }
    const updated = await prisma.liveClass.update({
      where: { id },
      data: {
        status: "COMPLETED",
        recordingEgressId: null,
        recordingUrl,
      },
    });
    return NextResponse.json({ success: true, status: updated.status, recordingUrl: updated.recordingUrl });
  } catch (error) {
    console.error("Live session error:", error);
    return NextResponse.json({ error: "Live server is not reachable" }, { status: 503 });
  }
}
