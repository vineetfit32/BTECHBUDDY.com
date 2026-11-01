"use client";

import * as React from "react";
import { DropdownMenu as M, Tooltip as T, Popover as P } from "radix-ui";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const floating =
  "glass-strong z-50 min-w-[12rem] overflow-hidden rounded-2xl p-1.5 shadow-lift data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2";

export const Menu = M.Root;
export const MenuTrigger = M.Trigger;
export const MenuGroup = M.Group;
export const MenuRadioGroup = M.RadioGroup;

export function MenuContent({ className, sideOffset = 8, ...props }: React.ComponentPropsWithoutRef<typeof M.Content>) {
  return (
    <M.Portal>
      <M.Content sideOffset={sideOffset} className={cn(floating, className)} {...props} />
    </M.Portal>
  );
}

const item =
  "relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-2 outline-none transition-colors data-[highlighted]:bg-surface-2 data-[highlighted]:text-ink data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

export function MenuItem({ className, ...props }: React.ComponentPropsWithoutRef<typeof M.Item>) {
  return <M.Item className={cn(item, className)} {...props} />;
}

export function MenuRadioItem({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof M.RadioItem>) {
  return (
    <M.RadioItem className={cn(item, "pr-8", className)} {...props}>
      {children}
      <M.ItemIndicator className="absolute right-3">
        <Check className="text-brand" />
      </M.ItemIndicator>
    </M.RadioItem>
  );
}

export function MenuCheckboxItem({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof M.CheckboxItem>) {
  return (
    <M.CheckboxItem className={cn(item, "pr-8", className)} {...props}>
      {children}
      <M.ItemIndicator className="absolute right-3">
        <Check className="text-brand" />
      </M.ItemIndicator>
    </M.CheckboxItem>
  );
}

export function MenuLabel({ className, ...props }: React.ComponentPropsWithoutRef<typeof M.Label>) {
  return <M.Label className={cn("px-3 pb-1 pt-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-ink-3", className)} {...props} />;
}

export function MenuSeparator({ className, ...props }: React.ComponentPropsWithoutRef<typeof M.Separator>) {
  return <M.Separator className={cn("my-1 h-px bg-line", className)} {...props} />;
}

export const TooltipProvider = T.Provider;

export function Tooltip({ content, children, side = "bottom" }: { content: React.ReactNode; children: React.ReactNode; side?: "top" | "bottom" | "left" | "right" }) {
  return (
    <T.Root delayDuration={250}>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal>
        <T.Content
          side={side}
          sideOffset={8}
          className="z-50 rounded-lg border border-line-strong bg-surface-3 px-2.5 py-1.5 text-xs font-semibold text-ink shadow-lift data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95"
        >
          {content}
        </T.Content>
      </T.Portal>
    </T.Root>
  );
}

export const Popover = P.Root;
export const PopoverTrigger = P.Trigger;
export const PopoverClose = P.Close;

export function PopoverContent({ className, sideOffset = 8, align = "end", ...props }: React.ComponentPropsWithoutRef<typeof P.Content>) {
  return (
    <P.Portal>
      <P.Content sideOffset={sideOffset} align={align} className={cn(floating, "w-80 p-4", className)} {...props} />
    </P.Portal>
  );
}
