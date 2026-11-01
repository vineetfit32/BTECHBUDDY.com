import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";
import { optionalText, parseJson, text, z } from "@/lib/validation";
import { slugify } from "@/lib/utils";

const createBody = z.object({
  code: text(12, "Code").regex(/^[A-Za-z0-9]+$/, "Code must be letters and numbers only"),
  name: text(120, "Name"),
  description: optionalText(1000),
  icon: optionalText(40),
  isFeatured: z.boolean().default(false),
});

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { subjects: true, notes: true } } },
    });
    return NextResponse.json({ branches });
  } catch (error) {
    console.error("Fetch branches error:", error);
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN"])) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }
  const parsed = await parseJson(req, createBody);
  if (parsed.error) return parsed.error;
  const { code, name, description, icon, isFeatured } = parsed.data;

  try {
    const branch = await prisma.branch.create({
      data: {
        code: code.toUpperCase(),
        name,
        slug: slugify(name),
        description: description ?? null,
        icon: icon ?? "BookOpen",
        isFeatured,
      },
    });
    return NextResponse.json({ success: true, branch });
  } catch (error) {
    console.error("Create branch error:", error);
    return NextResponse.json({ error: "Failed to create branch" }, { status: 500 });
  }
}
