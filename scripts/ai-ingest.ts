import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { embedModelName, embedText } from "../src/lib/ai/local";

interface Piece {
  sourceType: string;
  sourceId: string;
  subjectId: string | null;
  title: string;
  url: string | null;
  content: string;
}

function chunksOf(text: string, size = 900) {
  const clean = text.replace(/\s+/g, " ").trim();
  const parts: string[] = [];
  for (let i = 0; i < clean.length; i += size) parts.push(clean.slice(i, i + size));
  return parts.slice(0, 8);
}

async function collect(): Promise<Piece[]> {
  const [notes, questions, units] = await Promise.all([
    prisma.note.findMany({
      where: { isPublished: true },
      select: { id: true, title: true, description: true, subjectId: true },
      take: 500,
    }),
    prisma.questionBank.findMany({
      select: { id: true, questionText: true, solutionText: true, topicTag: true, subjectId: true, marks: true },
      take: 1000,
    }),
    prisma.syllabusUnit.findMany({
      select: { id: true, title: true, description: true, subjectId: true, unitNumber: true },
      take: 1000,
    }),
  ]);

  return [
    ...notes.map((note) => ({
      sourceType: "NOTE",
      sourceId: note.id,
      subjectId: note.subjectId,
      title: note.title,
      url: `/notes/${note.id}`,
      content: `${note.title}. ${note.description ?? ""}`,
    })),
    ...questions.map((question) => ({
      sourceType: "QUESTION",
      sourceId: question.id,
      subjectId: question.subjectId,
      title: question.topicTag,
      url: `/pyq`,
      content: `${question.topicTag} (${question.marks} marks): ${question.questionText}\n${question.solutionText ?? ""}`,
    })),
    ...units
      .filter((unit) => unit.description)
      .map((unit) => ({
        sourceType: "SYLLABUS",
        sourceId: unit.id,
        subjectId: unit.subjectId,
        title: `Unit ${unit.unitNumber}: ${unit.title}`,
        url: `/subjects/${unit.subjectId}`,
        content: `${unit.title}. ${unit.description}`,
      })),
  ];
}

async function main() {
  const pieces = await collect();
  let stored = 0;
  for (const piece of pieces) {
    const parts = chunksOf(piece.content);
    for (let chunkIndex = 0; chunkIndex < parts.length; chunkIndex++) {
      const embedding = await embedText(parts[chunkIndex]);
      await prisma.contentChunk.upsert({
        where: { sourceType_sourceId_chunkIndex: { sourceType: piece.sourceType, sourceId: piece.sourceId, chunkIndex } },
        create: { ...piece, content: parts[chunkIndex], chunkIndex, model: embedding ? embedModelName() : null },
        update: { title: piece.title, content: parts[chunkIndex], url: piece.url, model: embedding ? embedModelName() : null },
      });
      if (embedding) {
        await prisma.$executeRawUnsafe(
          `UPDATE "ContentChunk" SET embedding = $1::vector WHERE "sourceType" = $2 AND "sourceId" = $3 AND "chunkIndex" = $4`,
          `[${embedding.join(",")}]`,
          piece.sourceType,
          piece.sourceId,
          chunkIndex
        );
      }
      stored++;
    }
  }
  console.log(`[ai-ingest] stored ${stored} chunks from ${pieces.length} sources`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
