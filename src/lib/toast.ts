"use client";

import { useSyncExternalStore } from "react";

export type ToastTone = "xp" | "badge" | "success" | "error" | "info";

export interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
  xp?: number;
}

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function toast(input: Omit<Toast, "id">, ttl = 4200) {
  const id = nextId++;
  toasts = [...toasts.slice(-3), { ...input, id }];
  emit();
  setTimeout(() => dismissToast(id), ttl);
  return id;
}

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function useToasts() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => toasts,
    () => toasts
  );
}
