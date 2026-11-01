import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";
import { id, optionalId, optionalInt, optionalText, ownedFileUrl, parseJson, parseQuery, text, z } from "@/lib/validation";

const listQuery = z.object({
  branchId: optionalId,
  semesterId: optionalId,
  subjectId: optionalId,
  year: optionalInt(1, 4),
  search: optionalText(120),
  isPYQ: z.enum(["true", "false"]).optional(),
  featured: z.enum(["true", "false"]).optional(),
});

const noteBody = z.object({
  title: text(200, "Title"),
  description: optionalText(5000),
  fileUrl: ownedFileUrl.pipe(z.string({ error: "Upload the PDF first" })),
  fileSize: optionalText(20),
  fileType: z.enum(["PDF", "IMAGE"]).default("PDF"),
  subjectId: id,
  unitId: optionalId,
  branchId: optionalId,
  semesterId: optionalId,
  academicYearId: optionalId,
  isFeatured: z.boolean().default(false),
  isPYQ: z.boolean().default(false),
  yearPYQ: optionalText(20),
  tags: optionalText(300),
  language: z.enum(["ENGLISH", "HINDI", "HINGLISH"]).default("ENGLISH"),
});

export async function GET(req: Request) {
  const parsed = parseQuery(req, listQuery);
  if (parsed.error) return parsed.error;
  const { branchId, semesterId, subjectId, year, search, isPYQ, featured } = parsed.data;

  try {
    const where: Record<string, unknown> = { isPublished: true };
    if (branchId) where.branchId = branchId;
    if (semesterId) where.semesterId = semesterId;
    if (subjectId) where.subjectId = subjectId;
    if (isPYQ === "true") where.isPYQ = true;
    if (featured === "true") where.isFeatured = true;
    if (year) where.academicYear = { yearNumber: year };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } },
        { subject: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const notes = await prisma.note.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        branch: { select: { id: true, name: true, code: true } },
        semester: { select: { id: true, title: true, semesterNumber: true } },
        unit: { select: { id: true, title: true, unitNumber: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Fetch notes error:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR"])) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }
  const parsed = await parseJson(req, noteBody);
  if (parsed.error) return parsed.error;
  const input = parsed.data;

  try {
    const note = await prisma.note.create({
      data: {
        ...input,
        description: input.description ?? null,
        fileSize: input.fileSize ?? "1.5 MB",
        unitId: input.unitId ?? null,
        branchId: input.branchId ?? null,
        semesterId: input.semesterId ?? null,
        academicYearId: input.academicYearId ?? null,
        yearPYQ: input.yearPYQ ?? null,
        tags: input.tags ?? null,
      },
    });
    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error("Create note error:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
