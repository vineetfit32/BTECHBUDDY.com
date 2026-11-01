"use client";

import * as React from "react";
import { Switch as S, Tabs as Tb, RadioGroup as R } from "radix-ui";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: React.ComponentPropsWithoutRef<typeof S.Root>) {
  return (
    <S.Root
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-line-strong bg-surface-3 transition-colors data-[state=checked]:border-brand data-[state=checked]:bg-brand disabled:opacity-50",
        className
      )}
      {...props}
    >
      <S.Thumb className="block size-4 translate-x-0.5 rounded-full bg-ink shadow-md transition-transform duration-200 ease-[var(--ease-spring)] data-[state=checked]:translate-x-[22px] data-[state=checked]:bg-on-brand" />
    </S.Root>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: ReadonlyArray<{ value: T; label: React.ReactNode; title?: string }>;
  layoutId: string;
  className?: string;
  ariaLabel: string;
}

/** Radio group styled as a segmented control with a sliding active pill. */
export function Segmented<T extends string>({ value, onValueChange, options, layoutId, className, ariaLabel }: SegmentedProps<T>) {
  return (
    <R.Root
      value={value}
      onValueChange={(v) => onValueChange(v as T)}
      aria-label={ariaLabel}
      className={cn("relative inline-flex rounded-xl border border-line bg-surface-2 p-1", className)}
    >
      {options.map((opt) => (
        <R.Item
          key={opt.value}
          value={opt.value}
          title={opt.title}
          className="relative z-10 flex-1 rounded-lg px-3 py-1.5 text-xs font-bold text-ink-3 outline-none transition-colors data-[state=checked]:text-ink focus-visible:ring-2 focus-visible:ring-brand"
        >
          {value === opt.value && (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 -z-10 rounded-lg border border-line-strong bg-surface shadow-sm"
              transition={{ type: "spring", stiffness: 500, damping: 38 }}
            />
          )}
          {opt.label}
        </R.Item>
      ))}
    </R.Root>
  );
}

export const Tabs = Tb.Root;
export const TabsContent = Tb.Content;

export function TabsList({ className, ...props }: React.ComponentPropsWithoutRef<typeof Tb.List>) {
  return <Tb.List className={cn("inline-flex gap-1 rounded-2xl border border-line bg-surface-2 p-1", className)} {...props} />;
}

export function TabsTrigger({ className, ...props }: React.ComponentPropsWithoutRef<typeof Tb.Trigger>) {
  return (
    <Tb.Trigger
      className={cn(
        "rounded-xl px-4 py-2 text-xs font-bold text-ink-3 outline-none transition-all hover:text-ink data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-sm focus-visible:ring-2 focus-visible:ring-brand",
        className
      )}
      {...props}
    />
  );
}
