"use client";

import { celebrate } from "./celebrate";
import { emitMascot } from "./mascot/bus";
import { BADGE_NAMES } from "./mascot/machine";
import { toast } from "./toast";

/** One call for every XP/badge-bearing API response: toast, Buddy reaction and confetti. */
export function reward({ xp, badges, reason }: { xp?: number | null; badges?: string[] | null; reason?: string }) {
  const earned = xp ?? 0;
  if (earned > 0) {
    toast({ tone: "xp", title: reason ?? "Nice work!", xp: earned });
    emitMascot({ type: "XP_GAINED", amount: earned, reason });
  }
  for (const code of badges ?? []) {
    toast({ tone: "badge", title: `Badge unlocked: ${BADGE_NAMES[code] ?? code}`, description: "Find it in your achievements." }, 6000);
    emitMascot({ type: "BADGE_EARNED", code });
  }
  if (badges?.length) celebrate("big");
  else if (earned > 0) celebrate("small");
}
