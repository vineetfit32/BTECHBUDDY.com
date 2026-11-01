export type StreakEvent = "STARTED" | "SAME_DAY" | "INCREMENTED" | "FREEZE_USED" | "RESET";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Whole calendar days between two instants, measured in India Standard Time. */
export function istDayDiff(from: Date, to: Date): number {
  const dayOf = (d: Date) => Math.floor((d.getTime() + IST_OFFSET_MS) / 86_400_000);
  return dayOf(to) - dayOf(from);
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  freezesLeft: number;
  lastActiveAt: Date;
}

export function advanceStreak(state: StreakState, now: Date): { next: StreakState; event: StreakEvent } {
  const diff = istDayDiff(state.lastActiveAt, now);
  if (diff <= 0) return { next: state, event: "SAME_DAY" };
  if (diff === 1) {
    const currentStreak = state.currentStreak + 1;
    return {
      next: { ...state, currentStreak, longestStreak: Math.max(currentStreak, state.longestStreak), lastActiveAt: now },
      event: "INCREMENTED",
    };
  }
  if (state.freezesLeft > 0 && diff === 2) {
    return { next: { ...state, freezesLeft: state.freezesLeft - 1, lastActiveAt: now }, event: "FREEZE_USED" };
  }
  return { next: { ...state, currentStreak: 1, lastActiveAt: now }, event: "RESET" };
}

/** A streak is "at risk" late in the IST evening when the student hasn't studied yet today. */
export function isStreakAtRisk(lastActiveAt: Date, now: Date): boolean {
  if (istDayDiff(lastActiveAt, now) !== 1) return false;
  const istHour = new Date(now.getTime() + IST_OFFSET_MS).getUTCHours();
  return istHour >= 20;
}
