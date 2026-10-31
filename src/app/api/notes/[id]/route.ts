import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        subject: { include: { branch: true } },
        unit: true,
        branch: true,
        semester: true,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Increment view count
    await prisma.note.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Fetch note detail error:", error);
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR"])) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.note.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        fileUrl: body.fileUrl,
        isFeatured: body.isFeatured,
        isPYQ: body.isPYQ,
        yearPYQ: body.yearPYQ,
        tags: body.tags,
        isPublished: body.isPublished !== undefined ? body.isPublished : true,
      },
    });

    return NextResponse.json({ success: true, note: updated });
  } catch (error) {
    console.error("Update note error:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.note.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Note deleted" });
  } catch (error) {
    console.error("Delete note error:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
