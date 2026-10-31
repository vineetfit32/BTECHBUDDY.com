import React from "react";
import Button from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`desk-card rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto ${className}`}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-primary-violet-subtle text-primary-violet flex items-center justify-center mx-auto mb-4 border border-primary-violet/20 shadow-glow-sm">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
        {description}
      </p>
      {actionLabel && (
        <Button
          variant="primary"
          size="sm"
          href={actionHref}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
