import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";
import { id, optionalInt, optionalText, parseJson, parseQuery, text, z } from "@/lib/validation";
import { slugify } from "@/lib/utils";

const listQuery = z.object({
  branchId: z.string().max(64).optional(),
  semesterId: z.string().max(64).optional(),
  year: optionalInt(1, 4),
  featured: z.enum(["true", "false"]).optional(),
  search: optionalText(120),
});

const createBody = z.object({
  code: text(16, "Code").regex(/^[A-Za-z0-9-]+$/, "Code must be letters, numbers or dashes"),
  name: text(160, "Name"),
  description: optionalText(2000),
  credits: z.coerce.number().int().min(0).max(10).default(4),
  syllabus: optionalText(20_000),
  semesterId: id,
  branchId: id,
  isFeatured: z.boolean().default(false),
});

export async function GET(req: Request) {
  const parsed = parseQuery(req, listQuery);
  if (parsed.error) return parsed.error;
  const { branchId, semesterId, year, featured, search } = parsed.data;

  try {
    const subjects = await prisma.subject.findMany({
      where: {
        ...(branchId && { branchId }),
        ...(semesterId && { semesterId }),
        ...(featured === "true" && { isFeatured: true }),
        ...(year && { semester: { academicYear: { yearNumber: year } } }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { code: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        semester: { select: { id: true, title: true, semesterNumber: true } },
        units: { select: { id: true, title: true, unitNumber: true } },
        _count: { select: { notes: true, videos: true, quizzes: true } },
      },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Fetch subjects error:", error);
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN"])) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }
  const parsed = await parseJson(req, createBody);
  if (parsed.error) return parsed.error;
  const input = parsed.data;

  try {
    const subject = await prisma.subject.create({
      data: {
        ...input,
        code: input.code.toUpperCase(),
        slug: `${slugify(input.name)}-${input.code.toLowerCase()}`,
        description: input.description ?? null,
        syllabus: input.syllabus ?? null,
      },
    });
    return NextResponse.json({ success: true, subject });
  } catch (error) {
    console.error("Create subject error:", error);
    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 });
  }
}
