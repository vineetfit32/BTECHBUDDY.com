"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/kit";
import { preferenceActions } from "@/lib/use-preferences";
import { emitMascot } from "@/lib/mascot/bus";
import { reward } from "@/lib/reward";
import { cn } from "@/lib/utils";

const PRESETS = [
  { kind: "FOCUS" as const, minutes: 25, label: "Focus" },
  { kind: "SHORT_BREAK" as const, minutes: 5, label: "Short break" },
  { kind: "LONG_BREAK" as const, minutes: 15, label: "Long break" },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function Pomodoro({ taskTitle }: { taskTitle?: string }) {
  const [preset, setPreset] = useState(0);
  const [remaining, setRemaining] = useState(PRESETS[0].minutes * 60);
  const [running, setRunning] = useState(false);
  const startedAt = useRef<Date | null>(null);
  const current = PRESETS[preset];

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (remaining !== 0 || !running) return;
    queueMicrotask(() => setRunning(false));
    const completed = current.kind === "FOCUS";
    preferenceActions.setFocus(false);
    emitMascot({ type: "FOCUS_END", completed });
    void fetch("/api/study-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: current.kind,
        minutes: current.minutes,
        taskTitle,
        startedAt: startedAt.current,
        completed: true,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.xpEarned) reward({ xp: data.xpEarned, badges: data.newBadges, reason: "Focus session" });
      })
      .catch(() => undefined);
  }, [remaining, running, current.kind, current.minutes, taskTitle]);

  const start = () => {
    if (!startedAt.current) startedAt.current = new Date();
    setRunning(true);
    if (current.kind === "FOCUS") {
      preferenceActions.setFocus(true);
      emitMascot({ type: "FOCUS_START", minutes: current.minutes });
    }
  };

  const reset = (index = preset) => {
    if (running && current.kind === "FOCUS") emitMascot({ type: "FOCUS_END", completed: false });
    preferenceActions.setFocus(false);
    setRunning(false);
    startedAt.current = null;
    setPreset(index);
    setRemaining(PRESETS[index].minutes * 60);
  };

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const total = current.minutes * 60;
  const progress = 1 - remaining / total;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-1 rounded-xl border border-line bg-surface-2 p-1">
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            type="button"
            onClick={() => reset(i)}
            className={cn("rounded-lg px-3 py-1.5 text-xs font-bold", i === preset ? "bg-surface text-ink" : "text-ink-3")}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div
        className="grid size-52 place-items-center rounded-full"
        style={{ background: `conic-gradient(var(--brand) ${progress * 360}deg, var(--surface-3) 0deg)` }}
        role="timer"
        aria-label={`${mins} minutes ${secs} seconds`}
      >
        <div className="grid size-44 place-items-center rounded-full bg-canvas">
          <span className="font-mono text-5xl font-black tabular-nums text-ink">
            {pad(mins)}:{pad(secs)}
          </span>
        </div>
      </div>
      {taskTitle && <p className="max-w-xs text-center text-sm text-ink-3">{taskTitle}</p>}
      <div className="flex gap-2">
        <Button type="button" onClick={running ? () => setRunning(false) : start} icon={running ? <Pause /> : <Play />}>
          {running ? "Pause" : remaining < total ? "Resume" : "Start"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => reset()} icon={<RotateCcw />} aria-label="Reset timer" />
        <Button
          type="button"
          variant="ghost"
          icon={<SkipForward />}
          aria-label="Skip to next"
          onClick={() => reset((preset + 1) % PRESETS.length)}
        />
      </div>
    </div>
  );
}
