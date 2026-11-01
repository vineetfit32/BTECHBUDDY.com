import { createEmptyCard, fsrs, Rating, State, type Card, type Grade } from "ts-fsrs";

export const scheduler = fsrs({ enable_fuzz: true, request_retention: 0.9 });

export const RATINGS = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
} as const;

export type RatingName = keyof typeof RATINGS;

export interface StoredCard {
  due: Date;
  stability: number;
  difficulty: number;
  scheduledDays: number;
  learningSteps: number;
  reps: number;
  lapses: number;
  state: number;
  lastReview: Date | null;
}

export function freshCard(now = new Date()): StoredCard {
  return fromFsrs(createEmptyCard(now));
}

export function reviewCard(stored: StoredCard, rating: Grade, now = new Date()) {
  const result = scheduler.next(toFsrs(stored), now, rating);
  return { card: fromFsrs(result.card), scheduledDays: result.card.scheduled_days };
}

export function toFsrs(stored: StoredCard): Card {
  return {
    due: stored.due,
    stability: stored.stability,
    difficulty: stored.difficulty,
    scheduled_days: stored.scheduledDays,
    learning_steps: stored.learningSteps,
    reps: stored.reps,
    lapses: stored.lapses,
    state: stored.state as State,
    last_review: stored.lastReview ?? undefined,
  };
}

export function fromFsrs(card: Card): StoredCard {
  return {
    due: new Date(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    scheduledDays: card.scheduled_days,
    learningSteps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: Number(card.state),
    lastReview: card.last_review ? new Date(card.last_review) : null,
  };
}
