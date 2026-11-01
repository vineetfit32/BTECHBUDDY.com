"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Flame, Layers, Sparkles } from "lucide-react";
import { Badge, Button, ButtonLink, Eyebrow } from "@/components/kit";
import Heatmap, { type HeatDay } from "@/components/study/Heatmap";
import Pomodoro from "@/components/study/Pomodoro";
import { preferenceActions } from "@/lib/use-preferences";

export interface BoardTarget {
  id: string;
  subjectName: string;
  examDate: string;
  daysLeft: number;
  todayTitle: string | null;
  todayTasks: Array<{ id: string; title: string; isDone: boolean }>;
}

export default function StudyBoardClient({
  name,
  streak,
  atRisk,
  minutesToday,
  heat,
  targets,
  dueCards,
}: {
  name: string;
  streak: number;
  atRisk: boolean;
  minutesToday: number;
  heat: HeatDay[];
  targets: BoardTarget[];
  dueCards: number;
}) {
  const [tasks, setTasks] = useState(targets);
  const [making, setMaking] = useState(false);
  const todayTask = tasks.find((t) => t.todayTitle)?.todayTitle;

  const toggle = async (targetId: string, taskId: string, isDone: boolean) => {
    setTasks((all) =>
      all.map((t) =>
        t.id === targetId ? { ...t, todayTasks: t.todayTasks.map((task) => (task.id === taskId ? { ...task, isDone } : task)) } : t
      )
    );
    await fetch("/api/study-planner", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "TOGGLE_TASK", taskId, isDone }),
    });
  };

  const generateCards = async () => {
    setMaking(true);
    try {
      await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generate: true, limit: 15 }),
      });
      window.location.href = "/student/flashcards";
    } finally {
      setMaking(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Study Board</Eyebrow>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">Evening, {name.split(" ")[0]}.</h1>
          <p className="mt-1 text-sm text-ink-3">One plan, one timer, one deck. Everything else can wait.</p>
        </div>
        <Button type="button" variant="secondary" onClick={() => preferenceActions.setFocus(true)}>
          Enter focus
        </Button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="bento p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Focus</h2>
            <span className="font-mono text-xs text-ink-3">{minutesToday} min today</span>
          </div>
          <Pomodoro taskTitle={todayTask ?? undefined} />
        </section>

        <div className="grid gap-4">
          <section className="brutal p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                <Flame className="size-5 text-warn" /> {streak}-day streak
              </h2>
              {atRisk && <Badge tone="warn">At risk</Badge>}
            </div>
            <div className="mt-4 overflow-x-auto">
              <Heatmap days={heat} />
            </div>
          </section>

          <section className="bento flex items-center justify-between gap-4 p-5">
            <div>
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                <Layers className="size-5 text-accent" /> {dueCards} cards due
              </h2>
              <p className="mt-1 text-xs text-ink-3">Spaced repetition from your PYQs.</p>
            </div>
            {dueCards > 0 ? (
              <ButtonLink href="/student/flashcards">Review</ButtonLink>
            ) : (
              <Button type="button" loading={making} onClick={generateCards} icon={<Sparkles />}>
                Build deck
              </Button>
            )}
          </section>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Today&apos;s plan</h2>
          <Link href="/study-planner" className="inline-flex items-center gap-1 text-xs font-bold text-brand">
            Exam planner <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {tasks.length === 0 ? (
          <div className="bento p-6 text-sm text-ink-3">
            No exam plan yet.{" "}
            <Link href="/study-planner" className="font-bold text-brand">
              Create one
            </Link>{" "}
            and today&apos;s tasks land here.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {tasks.map((target) => (
              <article key={target.id} className="bento p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold text-ink">{target.subjectName}</h3>
                  <Badge tone={target.daysLeft <= 3 ? "danger" : "warn"}>{target.daysLeft}d left</Badge>
                </div>
                <p className="mt-1 text-xs text-ink-3">{target.todayTitle ?? "No task scheduled today"}</p>
                <ul className="mt-3 space-y-2">
                  {target.todayTasks.map((task) => (
                    <li key={task.id}>
                      <label className="flex items-start gap-2 text-sm text-ink-2">
                        <input
                          type="checkbox"
                          checked={task.isDone}
                          onChange={(e) => toggle(target.id, task.id, e.target.checked)}
                          className="mt-1 accent-[var(--brand)]"
                        />
                        <span className={task.isDone ? "text-ink-3 line-through" : ""}>{task.title.replace(/^\[Rebalanced\] /, "")}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
