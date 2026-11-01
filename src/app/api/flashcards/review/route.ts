import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { RATINGS, reviewCard, type RatingName, type StoredCard } from "@/lib/fsrs";
import { emitReward } from "@/lib/server-reward";
import { id, parseJson, z } from "@/lib/validation";

const body = z.object({
  cardId: id,
  rating: z.enum(["again", "hard", "good", "easy"]),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in" }, { status: 401 });
  const parsed = await parseJson(req, body);
  if (parsed.error) return parsed.error;

  const existing = await prisma.flashcard.findFirst({ where: { id: parsed.data.cardId, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Card not found" }, { status: 404 });

  const stored: StoredCard = {
    due: existing.due,
    stability: existing.stability,
    difficulty: existing.difficulty,
    scheduledDays: existing.scheduledDays,
    learningSteps: existing.learningSteps,
    reps: existing.reps,
    lapses: existing.lapses,
    state: existing.state,
    lastReview: existing.lastReview,
  };
  const { card } = reviewCard(stored, RATINGS[parsed.data.rating as RatingName]);
  const grade = RATINGS[parsed.data.rating as RatingName];

  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.flashcard.update({
      where: { id: existing.id },
      data: card,
    });
    await tx.flashcardReview.create({
      data: {
        cardId: existing.id,
        userId: user.id,
        rating: Number(grade),
        state: card.state,
        scheduledDays: card.scheduledDays,
      },
    });
    return next;
  });

  const reviewed = await prisma.flashcardReview.count({ where: { userId: user.id } });
  let xpEarned = 0;
  const newBadges: string[] = [];
  if (reviewed % 10 === 0) {
    xpEarned = 10;
    await prisma.xpTransaction.create({ data: { userId: user.id, amount: 10, action: `CARDS:${reviewed}` } });
  }
  if (reviewed >= 100) {
    const created = await prisma.userBadge.createMany({
      data: [{ userId: user.id, badgeCode: "CARDS_100" }],
      skipDuplicates: true,
    });
    if (created.count) newBadges.push("CARDS_100");
  }

  const dueCount = await prisma.flashcard.count({ where: { userId: user.id, due: { lte: new Date() } } });
  return NextResponse.json({ card: updated, dueCount, reviewed, ...emitReward({ xpEarned, newBadges }) });
}
