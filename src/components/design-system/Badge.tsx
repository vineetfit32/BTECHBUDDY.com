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
      "bg-surface-2 text-ink-2 border border-line/80",
    primary:
      "bg-primary-violet-subtle text-primary-violet border border-primary-violet/20 font-bold",
    live:
      "bg-danger/10 text-danger border border-danger/20 font-black tracking-wider uppercase",
    success:
      "bg-accent-emerald-subtle text-accent-emerald border border-accent-emerald/20 font-semibold",
    warning:
      "bg-accent-amber-subtle text-accent-amber border border-accent-amber/20 font-semibold",
    danger:
      "bg-danger/10 text-danger border border-danger/20 font-semibold",
    cyan:
      "bg-accent-cyan-subtle text-accent-cyan border border-accent-cyan/20 font-semibold",
    mono:
      "font-mono bg-surface-2 text-ink border border-line font-bold tracking-tight",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 transition-colors select-none font-medium ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      {ping && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-danger" />
        </span>
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
