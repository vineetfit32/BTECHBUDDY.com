export type Mood = "idle" | "wave" | "thinking" | "celebrate" | "cheer" | "sleepy" | "focus" | "sad";

export type MascotEvent =
  | { type: "GREET"; name?: string }
  | { type: "POKE" }
  | { type: "AI_START" }
  | { type: "AI_DONE" }
  | { type: "AI_FAILED" }
  | { type: "QUIZ_PASSED"; percentage: number }
  | { type: "QUIZ_FAILED"; percentage: number }
  | { type: "XP_GAINED"; amount: number; reason?: string }
  | { type: "BADGE_EARNED"; code: string }
  | { type: "STREAK_UP"; days: number }
  | { type: "STREAK_RISK" }
  | { type: "STREAK_LOST" }
  | { type: "FOCUS_START"; minutes: number }
  | { type: "FOCUS_END"; completed: boolean }
  | { type: "CARDS_DONE"; reviewed: number }
  | { type: "SET_NIGHT"; night: boolean }
  | { type: "TIMEOUT" };

export interface MascotState {
  mood: Mood;
  message: string | null;
  until: number | null;
  night: boolean;
  focusActive: boolean;
  aiActive: boolean;
  streakAtRisk: boolean;
}

export const initialMascotState: MascotState = {
  mood: "idle",
  message: null,
  until: null,
  night: false,
  focusActive: false,
  aiActive: false,
  streakAtRisk: false,
};

export const BADGE_NAMES: Record<string, string> = {
  FIRST_STEP: "First Step",
  STREAK_3: "Streak Starter",
  STREAK_7: "Streak Warrior",
  QUIZ_WHIZ: "Quiz Whiz",
  DSA_PIONEER: "DSA Pioneer",
  NIGHT_OWL: "Night Owl",
  FOCUS_10: "Deep Worker",
  CARDS_100: "Memory Master",
};

/** The mood Buddy falls back to once a transient reaction ends. */
function baseline(s: MascotState): Pick<MascotState, "mood" | "message" | "until"> {
  if (s.aiActive) return { mood: "thinking", message: "Hmm, let me check your notes…", until: null };
  if (s.focusActive) return { mood: "focus", message: null, until: null };
  if (s.streakAtRisk) return { mood: "sleepy", message: "Your streak ends at midnight. One quick card?", until: null };
  if (s.night) return { mood: "sleepy", message: null, until: null };
  return { mood: "idle", message: null, until: null };
}

function react(s: MascotState, mood: Mood, message: string, ms: number, now: number): MascotState {
  return { ...s, mood, message, until: now + ms };
}

export function mascotReducer(s: MascotState, e: MascotEvent, now = Date.now()): MascotState {
  switch (e.type) {
    case "GREET":
      return react(s, "wave", e.name ? `Hi ${e.name.split(" ")[0]}! Ready to crush today's plan?` : "Hi, I'm Buddy. Tap me any time!", 4000, now);
    case "POKE":
      if (s.focusActive) return react(s, "focus", "Shh, deep work mode. You've got this.", 2000, now);
      return react(s, "wave", s.night ? "Late-night grind? Warm screen is on." : "Need a hand? Try Ctrl K to search anything.", 2500, now);
    case "AI_START":
      return { ...s, aiActive: true, mood: "thinking", message: "Hmm, let me check your notes…", until: null };
    case "AI_DONE":
      return react({ ...s, aiActive: false }, "wave", "Here you go! Ask a follow-up if anything's fuzzy.", 2500, now);
    case "AI_FAILED":
      return react({ ...s, aiActive: false }, "sad", "My brain server is napping. Showing what I found in your notes.", 3500, now);
    case "QUIZ_PASSED":
      return react(s, "celebrate", e.percentage >= 90 ? `${Math.round(e.percentage)}%! Topper energy!` : `Passed with ${Math.round(e.percentage)}%. Nice work!`, 4500, now);
    case "QUIZ_FAILED":
      return react(s, "cheer", "Not this time, but every wrong answer is a flashcard now. Let's revise!", 4500, now);
    case "XP_GAINED":
      return react(s, "celebrate", `+${e.amount} XP${e.reason ? ` · ${e.reason}` : ""}`, 2200, now);
    case "BADGE_EARNED":
      return react(s, "celebrate", `New badge unlocked: ${BADGE_NAMES[e.code] ?? e.code}!`, 4500, now);
    case "STREAK_UP":
      return react({ ...s, streakAtRisk: false }, "celebrate", `${e.days}-day streak! Keep the fire going.`, 3500, now);
    case "STREAK_RISK":
      return { ...s, streakAtRisk: true, ...baseline({ ...s, streakAtRisk: true }) };
    case "STREAK_LOST":
      return react({ ...s, streakAtRisk: false }, "sad", "Streak reset… but day 1 is the best day to restart.", 5000, now);
    case "FOCUS_START":
      return react({ ...s, focusActive: true }, "focus", `${e.minutes} minutes of deep focus. Headphones on!`, 2500, now);
    case "FOCUS_END": {
      const next = { ...s, focusActive: false };
      return e.completed ? react(next, "celebrate", "Session complete! Take a 5 minute break.", 4000, now) : { ...next, ...baseline(next) };
    }
    case "CARDS_DONE":
      return react(s, "celebrate", `${e.reviewed} cards reviewed. Your future self says thanks!`, 4000, now);
    case "SET_NIGHT": {
      const next = { ...s, night: e.night };
      return next.until ? next : { ...next, ...baseline(next) };
    }
    case "TIMEOUT":
      if (s.until && now < s.until) return s;
      return { ...s, ...baseline(s) };
  }
}
