import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { subjects: true, notes: true },
        },
      },
    });
    return NextResponse.json({ branches });
  } catch (error) {
    console.error("Fetch branches error:", error);
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { code, name, description, icon, isFeatured } = await req.json();
    if (!code || !name) {
      return NextResponse.json({ error: "Code and name are required" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const branch = await prisma.branch.create({
      data: {
        code: code.toUpperCase().trim(),
        name: name.trim(),
        slug,
        description,
        icon: icon || "BookOpen",
        isFeatured: Boolean(isFeatured),
      },
    });

    return NextResponse.json({ success: true, branch });
  } catch (error) {
    console.error("Create branch error:", error);
    return NextResponse.json({ error: "Failed to create branch" }, { status: 500 });
  }
}
