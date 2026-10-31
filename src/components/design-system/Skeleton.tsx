import React from "react";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export default function Skeleton({ className = "h-4 w-full", count = 1 }: SkeletonProps) {
  if (count === 1) {
    return (
      <div
        className={`animate-pulse bg-slate-200/80 dark:bg-slate-800/80 rounded-xl ${className}`}
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-200/80 dark:bg-slate-800/80 rounded-xl ${className}`}
        />
      ))}
    </div>
  );
}
