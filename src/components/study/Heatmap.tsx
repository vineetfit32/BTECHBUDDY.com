"use client";

import { cn } from "@/lib/utils";

export interface HeatDay {
  date: string;
  minutes: number;
}

function dayKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Last `weeks` columns of study minutes, Monday-aligned, GitHub style. */
export function buildHeatmap(days: HeatDay[], weeks = 16, today = new Date()) {
  const byDay = new Map(days.map((d) => [d.date.slice(0, 10), d.minutes]));
  const end = new Date(today);
  end.setHours(0, 0, 0, 0);
  const mondayOffset = (end.getDay() + 6) % 7;
  const start = new Date(end);
  start.setDate(end.getDate() - mondayOffset - (weeks - 1) * 7);

  const cells: Array<{ key: string; minutes: number; future: boolean }> = [];
  for (let i = 0; i < weeks * 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = dayKey(date);
    cells.push({ key, minutes: byDay.get(key) ?? 0, future: date > end });
  }
  return cells;
}

function level(minutes: number) {
  if (minutes <= 0) return 0;
  if (minutes < 25) return 1;
  if (minutes < 50) return 2;
  if (minutes < 90) return 3;
  return 4;
}

const FILL = ["bg-surface-3", "bg-ok/30", "bg-ok/55", "bg-ok/80", "bg-ok"];

export default function Heatmap({ days, weeks = 16 }: { days: HeatDay[]; weeks?: number }) {
  const cells = buildHeatmap(days, weeks);
  return (
    <div>
      <div className="grid grid-flow-col grid-rows-7 gap-1" role="img" aria-label="Study activity">
        {cells.map((cell) => (
          <span
            key={cell.key}
            title={cell.future ? "" : `${cell.key}: ${cell.minutes} min`}
            className={cn("size-3 rounded-[3px] sm:size-3.5", cell.future ? "bg-transparent" : FILL[level(cell.minutes)])}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] text-ink-3">
        Less
        {FILL.map((c) => (
          <span key={c} className={cn("size-3 rounded-[3px]", c)} />
        ))}
        More
      </div>
    </div>
  );
}
