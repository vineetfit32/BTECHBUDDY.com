import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { freshCard } from "@/lib/fsrs";
import { id, optionalText, parseJson, parseQuery, text, z } from "@/lib/validation";

const listQuery = z.object({
  due: z.enum(["1"]).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const createBody = z.object({
  front: text(2000, "Front"),
  back: text(8000, "Back"),
  topic: optionalText(80),
  subjectId: id.optional(),
});

const generateBody = z.object({
  subjectId: id.optional(),
  limit: z.coerce.number().int().min(1).max(40).default(15),
});

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in" }, { status: 401 });
  const parsed = parseQuery(req, listQuery);
  if (parsed.error) return parsed.error;

  const now = new Date();
  const [cards, dueCount, total] = await Promise.all([
    prisma.flashcard.findMany({
      where: { userId: user.id, ...(parsed.data.due && { due: { lte: now } }) },
      orderBy: { due: "asc" },
      take: parsed.data.limit,
      include: { subject: { select: { name: true, code: true } } },
    }),
    prisma.flashcard.count({ where: { userId: user.id, due: { lte: now } } }),
    prisma.flashcard.count({ where: { userId: user.id } }),
  ]);

  return NextResponse.json({ cards, dueCount, total });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in" }, { status: 401 });
  const parsed = await parseJson(req, z.union([createBody, generateBody.extend({ generate: z.literal(true) })]));
  if (parsed.error) return parsed.error;
  const input = parsed.data;

  if ("generate" in input) {
    const questions = await prisma.questionBank.findMany({
      where: {
        ...(input.subjectId && { subjectId: input.subjectId }),
        flashcards: { none: { userId: user.id } },
      },
      take: input.limit,
      orderBy: [{ isImportant: "desc" }, { frequencyCount: "desc" }],
    });
    const blank = freshCard();
    if (questions.length) {
      await prisma.flashcard.createMany({
        data: questions.map((q) => ({
          userId: user.id,
          questionId: q.id,
          subjectId: q.subjectId,
          front: q.questionText,
          back: q.solutionText?.trim() || `Worth ${q.marks} marks. Topic: ${q.topicTag}. Write the full answer before you flip.`,
          topic: q.topicTag,
          ...blank,
        })),
        skipDuplicates: true,
      });
    }
    return NextResponse.json({ created: questions.length });
  }

  const card = await prisma.flashcard.create({
    data: { userId: user.id, front: input.front, back: input.back, topic: input.topic ?? null, subjectId: input.subjectId ?? null, ...freshCard() },
  });
  return NextResponse.json({ card }, { status: 201 });
}
