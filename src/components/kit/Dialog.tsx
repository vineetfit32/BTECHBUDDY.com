"use client";

import * as React from "react";
import { Dialog as D } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

const overlay =
  "fixed inset-0 z-50 bg-canvas/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0";

interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof D.Content> {
  title: string;
  description?: string;
  hideTitle?: boolean;
  showClose?: boolean;
}

export function DialogContent({ title, description, hideTitle, showClose = true, className, children, ...props }: DialogContentProps) {
  return (
    <D.Portal>
      <D.Overlay className={overlay} />
      <D.Content
        className={cn(
          "glass-strong fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl p-6 shadow-lift outline-none",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-4",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className
        )}
        {...props}
      >
        <D.Title className={cn("font-display text-lg font-bold text-ink", hideTitle && "sr-only")}>{title}</D.Title>
        {description ? (
          <D.Description className={cn("mt-1 text-sm text-ink-3", hideTitle && "sr-only")}>{description}</D.Description>
        ) : (
          <D.Description className="sr-only">{title}</D.Description>
        )}
        {children}
        {showClose && (
          <D.Close
            className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
            aria-label="Close"
          >
            <X className="size-4" />
          </D.Close>
        )}
      </D.Content>
    </D.Portal>
  );
}

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof D.Content> {
  title: string;
  side?: "left" | "right" | "bottom";
}

export function SheetContent({ title, side = "right", className, children, ...props }: SheetContentProps) {
  const position = {
    right: "inset-y-0 right-0 h-full w-[min(88vw,380px)] rounded-l-3xl data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
    left: "inset-y-0 left-0 h-full w-[min(88vw,380px)] rounded-r-3xl data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
    bottom: "inset-x-0 bottom-0 max-h-[88vh] rounded-t-3xl data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
  }[side];
  return (
    <D.Portal>
      <D.Overlay className={overlay} />
      <D.Content
        className={cn(
          "glass-strong fixed z-50 flex flex-col overflow-y-auto p-5 shadow-lift outline-none duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out",
          position,
          className
        )}
        {...props}
      >
        <D.Title className="sr-only">{title}</D.Title>
        <D.Description className="sr-only">{title}</D.Description>
        {children}
      </D.Content>
    </D.Portal>
  );
}
