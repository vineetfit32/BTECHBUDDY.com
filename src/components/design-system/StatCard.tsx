import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: string;
  color?: "violet" | "cyan" | "amber" | "emerald";
  className?: string;
}

export default function StatCard({
  label,
  value,
  subtext,
  icon,
  trend,
  color = "violet",
  className = "",
}: StatCardProps) {
  const colorStyles = {
    violet: "bg-primary-violet-subtle text-primary-violet border-primary-violet/20",
    cyan: "bg-accent-cyan-subtle text-accent-cyan border-accent-cyan/20",
    amber: "bg-accent-amber-subtle text-accent-amber border-accent-amber/20",
    emerald: "bg-accent-emerald-subtle text-accent-emerald border-accent-emerald/20",
  }[color];

  return (
    <div
      className={`bento p-5 flex items-center justify-between gap-4 ${className}`}
    >
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-ink-3 block">
          {label}
        </span>
        <div className="font-mono text-2xl sm:text-3xl font-black text-ink">
          {value}
        </div>
        {(subtext || trend) && (
          <div className="text-[11px] text-ink-3 font-medium flex items-center gap-1.5">
            {trend && <span className="font-bold text-accent-emerald">{trend}</span>}
            {subtext && <span>{subtext}</span>}
          </div>
        )}
      </div>

      {icon && (
        <div
          className={`clay size-12 !rounded-2xl border flex items-center justify-center shrink-0 ${colorStyles}`}
        >
          {icon}
        </div>
      )}
    </div>
  );
}
