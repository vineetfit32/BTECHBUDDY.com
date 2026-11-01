import { prisma } from "@/lib/prisma";

export async function ensureClassRoom(liveClass: { id: string; roomName: string | null }): Promise<string> {
  if (liveClass.roomName) return liveClass.roomName;
  const roomName = `btb-${liveClass.id.replace(/-/g, "").slice(0, 20)}`;
  await prisma.liveClass.update({
    where: { id: liveClass.id },
    data: { roomName, meetingUrl: null },
  });
  return roomName;
}
