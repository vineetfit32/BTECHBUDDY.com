import * as React from "react";
import { cn } from "@/lib/utils";
import { surface, type SurfaceVariant } from "./surfaces";

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  variant?: SurfaceVariant;
  interactive?: boolean;
  as?: "div" | "section" | "article";
}

export function Card({ variant = "surface", interactive, as: Tag = "div", className, ...props }: CardProps) {
  return (
    <Tag
      className={cn(
        surface[variant],
        interactive && variant === "brutal" && "brutal-interactive cursor-pointer",
        interactive && variant !== "brutal" && "transition-transform duration-300 hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-start justify-between gap-3 p-5 pb-0", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-display text-base font-bold text-ink", className)} {...props} />;
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink-3", className)}
      {...props}
    />
  );
}
