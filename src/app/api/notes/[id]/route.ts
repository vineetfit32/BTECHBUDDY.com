import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";
import { optionalText, ownedFileUrl, parseJson, text, z } from "@/lib/validation";

const updateBody = z.object({
  title: text(200, "Title").optional(),
  description: optionalText(5000),
  fileUrl: ownedFileUrl,
  isFeatured: z.boolean().optional(),
  isPYQ: z.boolean().optional(),
  yearPYQ: optionalText(20),
  tags: optionalText(300),
  isPublished: z.boolean().optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const note = await prisma.note.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      include: {
        subject: { include: { branch: true } },
        unit: true,
        branch: true,
        semester: true,
      },
    });
    return NextResponse.json({ note });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    console.error("Fetch note detail error:", error);
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR"])) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }
  const parsed = await parseJson(req, updateBody);
  if (parsed.error) return parsed.error;

  try {
    const { id } = await params;
    const updated = await prisma.note.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ success: true, note: updated });
  } catch (error) {
    console.error("Update note error:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN"])) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.note.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Note deleted" });
  } catch (error) {
    console.error("Delete note error:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
