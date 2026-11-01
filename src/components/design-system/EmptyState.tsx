import React from "react";
import Button from "./Button";
import Buddy from "@/components/mascot/Buddy";
import type { Mood } from "@/lib/mascot/machine";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
  mood?: Mood;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = "",
  mood = "sleepy",
}: EmptyStateProps) {
  return (
    <div className={`bento mx-auto max-w-lg p-8 text-center sm:p-12 ${className}`}>
      {icon ? (
        <div className="clay mx-auto mb-4 flex size-16 items-center justify-center text-brand">{icon}</div>
      ) : (
        <Buddy mood={mood} className="mx-auto mb-2 h-28 w-28" />
      )}
      <h3 className="mb-2 font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mb-6 text-sm leading-relaxed text-ink-3">{description}</p>
      {actionLabel && (
        <Button variant="primary" size="sm" href={actionHref} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
