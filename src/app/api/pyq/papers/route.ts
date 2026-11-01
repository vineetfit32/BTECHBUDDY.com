import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";
import { id, optionalId, optionalText, ownedFileUrl, parseJson, parseQuery, text, z } from "@/lib/validation";

const examType = z.enum(["END_TERM", "MID_TERM", "BACKLOG"]);
const examYear = z.string().regex(/^\d{4}(-\d{2})?$/, "Exam year must look like 2024 or 2023-24");

const listQuery = z.object({
  universityId: optionalId,
  branchId: optionalId,
  subjectId: optionalId,
  semesterId: optionalId,
  examYear: examYear.optional(),
  examType: examType.optional(),
});

const createBody = z.object({
  universityId: id,
  branchId: id,
  subjectId: id,
  semesterId: optionalId,
  examYear,
  examType: examType.default("END_TERM"),
  title: text(200, "Title"),
  pdfUrl: ownedFileUrl.pipe(z.string({ error: "Upload the paper PDF first" })),
  fileSize: optionalText(20),
});

export async function GET(req: NextRequest) {
  const parsed = parseQuery(req, listQuery);
  if (parsed.error) return parsed.error;

  try {
    const where = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined));
    const papers = await prisma.examPaper.findMany({
      where,
      include: {
        university: true,
        branch: true,
        subject: true,
        semester: true,
        _count: { select: { questions: true } },
      },
      orderBy: [{ examYear: "desc" }, { createdAt: "desc" }],
      take: 300,
    });
    return NextResponse.json({ papers });
  } catch (error) {
    console.error("Error fetching PYQ papers:", error);
    return NextResponse.json({ error: "Failed to fetch papers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const parsed = await parseJson(req, createBody);
  if (parsed.error) return parsed.error;
  const input = parsed.data;

  try {
    const paper = await prisma.examPaper.create({
      data: { ...input, semesterId: input.semesterId ?? null, fileSize: input.fileSize ?? "1.8 MB" },
    });
    await logActivity({
      userId: user.id,
      action: "CREATE_EXAM_PAPER",
      entityType: "ExamPaper",
      entityId: paper.id,
      details: { title: input.title, examYear: input.examYear, subjectId: input.subjectId },
    });
    return NextResponse.json({ paper }, { status: 201 });
  } catch (error) {
    console.error("Error creating PYQ paper:", error);
    return NextResponse.json({ error: "Failed to create paper" }, { status: 500 });
  }
}
