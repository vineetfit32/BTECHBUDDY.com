import { prisma } from "@/lib/prisma";
import { embedText } from "./local";

export interface RetrievedChunk {
  title: string;
  content: string;
  url: string | null;
  score: number;
}

function vectorLiteral(values: number[]) {
  if (!values.every((n) => Number.isFinite(n))) throw new Error("Invalid embedding");
  return `[${values.join(",")}]`;
}

export async function retrieveChunks(query: string, limit = 6): Promise<RetrievedChunk[]> {
  const embedding = await embedText(query.slice(0, 2000));
  if (embedding?.length) {
    const literal = vectorLiteral(embedding);
    const rows = await prisma.$queryRawUnsafe<RetrievedChunk[]>(
      `SELECT title, content, url, (1 - (embedding <=> $1::vector))::float8 AS score
       FROM "ContentChunk"
       WHERE embedding IS NOT NULL
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      literal,
      limit
    );
    if (rows.length) return rows;
  }

  return prisma.$queryRawUnsafe<RetrievedChunk[]>(
    `SELECT title, content, url,
            ts_rank(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,'')),
                    plainto_tsquery('english', $1))::float8 AS score
     FROM "ContentChunk"
     WHERE to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,''))
           @@ plainto_tsquery('english', $1)
     ORDER BY score DESC
     LIMIT $2`,
    query.slice(0, 400),
    limit
  );
}

export function formatContext(chunks: RetrievedChunk[]) {
  return chunks
    .map((chunk, index) => `[${index + 1}] ${chunk.title}${chunk.url ? ` (${chunk.url})` : ""}\n${chunk.content}`)
    .join("\n\n");
}
