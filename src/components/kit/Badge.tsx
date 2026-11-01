import * as React from "react";
import { cn } from "@/lib/utils";
import { tone as tones, type Tone } from "./surfaces";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  variant?: "soft" | "solid" | "sticker";
}

export function Badge({ tone = "brand", variant = "soft", className, ...props }: BadgeProps) {
  if (variant === "sticker") {
    return <span className={cn("sticker", tones[tone].solid, className)} {...props} />;
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
        tones[tone][variant],
        className
      )}
      {...props}
    />
  );
}
