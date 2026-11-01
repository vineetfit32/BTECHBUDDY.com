import { describe, expect, it } from "vitest";
import { advanceStreak, isStreakAtRisk, istDayDiff } from "@/lib/streak";
import { buildPlan } from "@/lib/study-plan";

const ist = (iso: string) => new Date(`${iso}+05:30`);

describe("istDayDiff", () => {
  it("counts calendar days in IST, not 24h periods", () => {
    expect(istDayDiff(ist("2026-11-01T23:00:00"), ist("2026-11-02T08:00:00"))).toBe(1);
    expect(istDayDiff(ist("2026-11-01T00:10:00"), ist("2026-11-01T23:50:00"))).toBe(0);
  });
});

describe("advanceStreak", () => {
  const base = { currentStreak: 4, longestStreak: 6, freezesLeft: 1, lastActiveAt: ist("2026-11-01T22:00:00") };

  it("keeps the streak on the same day", () => {
    expect(advanceStreak(base, ist("2026-11-01T23:59:00")).event).toBe("SAME_DAY");
  });

  it("increments on the next calendar day even if under 24h later", () => {
    const { next, event } = advanceStreak(base, ist("2026-11-02T07:00:00"));
    expect(event).toBe("INCREMENTED");
    expect(next.currentStreak).toBe(5);
    expect(next.longestStreak).toBe(6);
  });

  it("spends a freeze for exactly one missed day", () => {
    const { next, event } = advanceStreak(base, ist("2026-11-03T09:00:00"));
    expect(event).toBe("FREEZE_USED");
    expect(next.freezesLeft).toBe(0);
    expect(next.currentStreak).toBe(4);
  });

  it("resets after a longer gap", () => {
    const { next, event } = advanceStreak(base, ist("2026-11-06T09:00:00"));
    expect(event).toBe("RESET");
    expect(next.currentStreak).toBe(1);
  });
});

describe("isStreakAtRisk", () => {
  it("flags late evening when yesterday was the last study day", () => {
    expect(isStreakAtRisk(ist("2026-11-01T10:00:00"), ist("2026-11-02T21:00:00"))).toBe(true);
    expect(isStreakAtRisk(ist("2026-11-01T10:00:00"), ist("2026-11-02T12:00:00"))).toBe(false);
    expect(isStreakAtRisk(ist("2026-11-02T10:00:00"), ist("2026-11-02T21:00:00"))).toBe(false);
  });
});

describe("buildPlan", () => {
  it("caps at 14 days and ends with a mock test", () => {
    const today = new Date("2026-11-01T06:00:00Z");
    const plan = buildPlan("DBMS", new Date("2026-12-20T06:00:00Z"), 5, today);
    expect(plan).toHaveLength(14);
    expect(plan[0].title).toBe("Unit 1 Intensive Study");
    expect(plan.at(-1)?.title).toMatch(/Mock Test/);
  });

  it("still finishes with the mock test when the exam is tomorrow", () => {
    const today = new Date("2026-11-01T06:00:00Z");
    const plan = buildPlan("OS", new Date("2026-11-02T06:00:00Z"), 5, today);
    expect(plan).toHaveLength(1);
    expect(plan[0].title).toMatch(/Mock Test/);
  });
});
