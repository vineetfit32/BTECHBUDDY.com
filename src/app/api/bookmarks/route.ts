import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error("Fetch bookmarks error:", error);
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemType, itemId } = await req.json();
    if (!itemType || !itemId) {
      return NextResponse.json({ error: "Item type and ID required" }, { status: 400 });
    }

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_itemType_itemId: {
          userId: user.id,
          itemType,
          itemId,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, bookmarked: false });
    } else {
      await prisma.bookmark.create({
        data: {
          userId: user.id,
          itemType,
          itemId,
        },
      });
      return NextResponse.json({ success: true, bookmarked: true });
    }
  } catch (error) {
    console.error("Toggle bookmark error:", error);
    return NextResponse.json({ error: "Failed to update bookmark" }, { status: 500 });
  }
}
