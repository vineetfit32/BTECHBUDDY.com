import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Eyebrow } from "@/components/kit";
import FlashcardDeck from "@/components/study/FlashcardDeck";

export const dynamic = "force-dynamic";

export default async function FlashcardsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const now = new Date();
  const [cards, dueCount] = await Promise.all([
    prisma.flashcard.findMany({
      where: { userId: user.id, due: { lte: now } },
      orderBy: { due: "asc" },
      take: 30,
      include: { subject: { select: { name: true, code: true } } },
    }),
    prisma.flashcard.count({ where: { userId: user.id, due: { lte: now } } }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <Eyebrow>Spaced repetition</Eyebrow>
        <h1 className="mt-1 font-display text-3xl font-bold text-ink">Flashcards</h1>
      </header>
      <FlashcardDeck
        dueCount={dueCount}
        initial={cards.map((c) => ({
          id: c.id,
          front: c.front,
          back: c.back,
          topic: c.topic,
          subject: c.subject,
        }))}
      />
    </div>
  );
}
