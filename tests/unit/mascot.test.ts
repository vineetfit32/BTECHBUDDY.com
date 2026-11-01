import { describe, expect, it } from "vitest";
import { initialMascotState, mascotReducer, type MascotEvent, type MascotState } from "@/lib/mascot/machine";

const run = (events: MascotEvent[], start: MascotState = initialMascotState, now = 1000) =>
  events.reduce((s, e) => mascotReducer(s, e, now), start);

describe("mascotReducer", () => {
  it("thinks while the AI answers, then waves", () => {
    const thinking = run([{ type: "AI_START" }]);
    expect(thinking.mood).toBe("thinking");
    expect(thinking.until).toBeNull();
    const done = mascotReducer(thinking, { type: "AI_DONE" }, 1000);
    expect(done.mood).toBe("wave");
    expect(mascotReducer(done, { type: "TIMEOUT" }, 10_000).mood).toBe("idle");
  });

  it("ignores early timeouts", () => {
    const s = run([{ type: "XP_GAINED", amount: 15 }]);
    expect(mascotReducer(s, { type: "TIMEOUT" }, 1500).mood).toBe("celebrate");
  });

  it("returns to focus after a celebration during a pomodoro", () => {
    let s = run([{ type: "FOCUS_START", minutes: 25 }]);
    s = mascotReducer(s, { type: "XP_GAINED", amount: 10 }, 2000);
    expect(s.mood).toBe("celebrate");
    expect(mascotReducer(s, { type: "TIMEOUT" }, 60_000).mood).toBe("focus");
  });

  it("celebrates a completed focus session but not an abandoned one", () => {
    const focused = run([{ type: "FOCUS_START", minutes: 25 }]);
    expect(mascotReducer(focused, { type: "FOCUS_END", completed: true }, 2000).mood).toBe("celebrate");
    expect(mascotReducer(focused, { type: "FOCUS_END", completed: false }, 2000).mood).toBe("idle");
  });

  it("gets sleepy for a streak at risk and cheers up on streak up", () => {
    const risk = run([{ type: "STREAK_RISK" }]);
    expect(risk.mood).toBe("sleepy");
    expect(risk.message).toMatch(/streak/i);
    const up = mascotReducer(risk, { type: "STREAK_UP", days: 4 }, 2000);
    expect(up.mood).toBe("celebrate");
    expect(mascotReducer(up, { type: "TIMEOUT" }, 90_000).mood).toBe("idle");
  });

  it("encourages after a failed quiz and is sad on a lost streak", () => {
    expect(run([{ type: "QUIZ_FAILED", percentage: 30 }]).mood).toBe("cheer");
    expect(run([{ type: "STREAK_LOST" }]).mood).toBe("sad");
  });

  it("uses a sleepy baseline in Night Study", () => {
    const night = run([{ type: "SET_NIGHT", night: true }]);
    expect(night.mood).toBe("sleepy");
    expect(night.message).toBeNull();
  });

  it("names badges", () => {
    expect(run([{ type: "BADGE_EARNED", code: "QUIZ_WHIZ" }]).message).toMatch(/Quiz Whiz/);
  });
});
