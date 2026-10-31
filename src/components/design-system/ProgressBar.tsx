import React from "react";

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number; // height in px
  color?: string;
  className?: string;
  showLabel?: boolean;
}

export default function ProgressBar({
  progress,
  height = 8,
  color = "bg-primary-violet",
  className = "",
  showLabel = false,
}: ProgressBarProps) {
  const normalized = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold mb-1 text-slate-500">
          <span>Progress</span>
          <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
            {Math.round(normalized)}%
          </span>
        </div>
      )}
      <div
        className="w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"
        style={{ height }}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
}
