import React from "react";

export type BadgeVariant =
  | "default"
  | "primary"
  | "live"
  | "success"
  | "warning"
  | "danger"
  | "cyan"
  | "mono";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  className?: string;
  icon?: React.ReactNode;
  ping?: boolean;
}

export default function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
  icon,
  ping = false,
}: BadgeProps) {
  const sizeClasses =
    size === "sm"
      ? "text-[10px] px-2 py-0.5 rounded-md"
      : "text-xs px-2.5 py-1 rounded-lg";

  const variantClasses: Record<BadgeVariant, string> = {
    default:
      "bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80",
    primary:
      "bg-primary-violet-subtle text-primary-violet border border-primary-violet/20 font-bold",
    live:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-black tracking-wider uppercase",
    success:
      "bg-accent-emerald-subtle text-accent-emerald border border-accent-emerald/20 font-semibold",
    warning:
      "bg-accent-amber-subtle text-accent-amber border border-accent-amber/20 font-semibold",
    danger:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold",
    cyan:
      "bg-accent-cyan-subtle text-accent-cyan border border-accent-cyan/20 font-semibold",
    mono:
      "font-mono bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold tracking-tight",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 transition-colors select-none font-medium ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      {ping && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
        </span>
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
