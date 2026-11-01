import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";
import { isSafeKey } from "@/lib/storage";
import { id, optionalId, optionalText, ownedFileUrl, parseJson, parseQuery, text, z } from "@/lib/validation";

const listQuery = z.object({
  subjectId: optionalId,
  courseId: optionalId,
  search: optionalText(120),
});

const createBody = z
  .object({
    title: text(200, "Title"),
    description: optionalText(5000),
    sourceKey: z.string().max(512).refine(isSafeKey, "Invalid upload key").optional(),
    videoUrl: ownedFileUrl,
    thumbnail: ownedFileUrl,
    subjectId: id,
    unitId: optionalId,
    courseId: optionalId,
    order: z.coerce.number().int().min(1).max(10_000).default(1),
    isFree: z.boolean().default(true),
    language: z.enum(["ENGLISH", "HINDI", "HINGLISH"]).default("HINGLISH"),
  })
  .refine((v) => v.sourceKey || v.videoUrl, "Upload a lecture video first");

export async function GET(req: Request) {
  const parsed = parseQuery(req, listQuery);
  if (parsed.error) return parsed.error;
  const { subjectId, courseId, search } = parsed.data;

  try {
    const videos = await prisma.videoLecture.findMany({
      where: {
        isPublished: true,
        ...(subjectId && { subjectId }),
        ...(courseId && { courseId }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        unit: { select: { id: true, title: true, unitNumber: true } },
      },
      orderBy: { order: "asc" },
      take: 300,
    });
    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Fetch videos error:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR"])) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }
  const parsed = await parseJson(req, createBody);
  if (parsed.error) return parsed.error;
  const input = parsed.data;

  try {
    const video = await prisma.videoLecture.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        videoUrl: input.videoUrl ?? "",
        videoProvider: input.sourceKey ? "HLS" : "DIRECT",
        sourceKey: input.sourceKey ?? null,
        transcodeStatus: input.sourceKey ? "PENDING" : "NONE",
        thumbnail: input.thumbnail ?? null,
        subjectId: input.subjectId,
        unitId: input.unitId ?? null,
        courseId: input.courseId ?? null,
        order: input.order,
        isFree: input.isFree,
        language: input.language,
        isPublished: !input.sourceKey,
      },
    });
    return NextResponse.json({ success: true, video });
  } catch (error) {
    console.error("Create video error:", error);
    return NextResponse.json({ error: "Failed to add video" }, { status: 500 });
  }
}
