import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const note = await prisma.note.update({
      where: { id },
      data: {
        downloadCount: { increment: 1 },
      },
      select: {
        id: true,
        fileUrl: true,
        downloadCount: true,
      },
    });

    return NextResponse.json({ success: true, downloadUrl: note.fileUrl, downloadCount: note.downloadCount });
  } catch (error) {
    console.error("Track download error:", error);
    return NextResponse.json({ error: "Failed to record download" }, { status: 500 });
  }
}
