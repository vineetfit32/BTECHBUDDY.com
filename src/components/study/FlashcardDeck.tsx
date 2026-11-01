"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button, ButtonLink } from "@/components/kit";
import { reward } from "@/lib/reward";
import { emitMascot } from "@/lib/mascot/bus";
import { spring } from "@/lib/motion";

export interface DeckCard {
  id: string;
  front: string;
  back: string;
  topic: string | null;
  subject?: { name: string; code: string } | null;
}

const GRADES = [
  { id: "again", label: "Again", tone: "text-danger" },
  { id: "hard", label: "Hard", tone: "text-warn" },
  { id: "good", label: "Good", tone: "text-ok" },
  { id: "easy", label: "Easy", tone: "text-accent" },
] as const;

export default function FlashcardDeck({ initial, dueCount: initialDue }: { initial: DeckCard[]; dueCount: number }) {
  const [queue, setQueue] = useState(initial);
  const [flipped, setFlipped] = useState(false);
  const [busy, setBusy] = useState(false);
  const [due, setDue] = useState(initialDue);
  const [reviewed, setReviewed] = useState(0);
  const card = queue[0];

  const grade = async (rating: (typeof GRADES)[number]["id"]) => {
    if (!card || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/flashcards/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, rating }),
      });
      const data = await res.json();
      if (!res.ok) return;
      if (data.xpEarned || data.newBadges?.length) reward({ xp: data.xpEarned, badges: data.newBadges, reason: "Flashcards" });
      setDue(data.dueCount ?? Math.max(0, due - 1));
      setReviewed((n) => n + 1);
      setFlipped(false);
      setQueue((q) => q.slice(1));
      if (queue.length === 1) emitMascot({ type: "CARDS_DONE", reviewed: reviewed + 1 });
    } finally {
      setBusy(false);
    }
  };

  if (!card) {
    return (
      <div className="bento mx-auto max-w-lg p-10 text-center">
        <p className="font-display text-2xl font-bold text-ink">{reviewed ? "Deck clear." : "Nothing due."}</p>
        <p className="mt-2 text-sm text-ink-3">
          {reviewed ? `You reviewed ${reviewed} cards. Come back when the next ones are due.` : "Generate a deck from your PYQs to start."}
        </p>
        <ButtonLink href="/student/board" className="mt-6" variant="secondary">
          Back to the board
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-ink-3">
        {due} due · {queue.length} in this sitting
      </p>
      <button type="button" onClick={() => setFlipped((f) => !f)} className="w-full [perspective:1200px]" aria-label="Flip card">
        <motion.div
          className="relative h-72 w-full"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={spring.gentle}
          style={{ transformStyle: "preserve-3d" }}
        >
          <Face className="brutal" style={{ backfaceVisibility: "hidden" }}>
            <Tag>{card.topic ?? card.subject?.code ?? "Card"}</Tag>
            <p className="font-display text-xl font-bold text-ink">{card.front}</p>
            <span className="mt-auto font-mono text-[10px] text-ink-3">Tap to reveal</span>
          </Face>
          <Face className="brutal bg-surface-2" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <Tag>Answer</Tag>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{card.back}</p>
          </Face>
        </motion.div>
      </button>
      {flipped ? (
        <div className="grid w-full grid-cols-4 gap-2">
          {GRADES.map((g) => (
            <Button key={g.id} type="button" variant="secondary" disabled={busy} className={g.tone} onClick={() => grade(g.id)}>
              {g.label}
            </Button>
          ))}
        </div>
      ) : (
        <Button type="button" variant="secondary" onClick={() => setFlipped(true)}>
          Show answer
        </Button>
      )}
    </div>
  );
}

function Face({ className, children, style }: { className?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className={`absolute inset-0 flex flex-col gap-3 p-6 text-left ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-accent">{children}</span>;
}
