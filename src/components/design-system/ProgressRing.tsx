import React from "react";

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number; // diameter in px
  strokeWidth?: number;
  className?: string;
  showText?: boolean;
  color?: string;
}

export default function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 6,
  className = "",
  showText = true,
  color = "var(--primary-violet)",
}: ProgressRingProps) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="text-slate-200 dark:text-slate-800"
        />
        {/* Animated Progress circle */}
        <circle
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      {showText && (
        <span className="absolute font-mono text-xs font-black text-ink">
          {Math.round(normalizedProgress)}%
        </span>
      )}
    </div>
  );
}
