"use client";

import type { MascotEvent } from "./machine";

const EVENT = "btb-mascot";

export function emitMascot(event: MascotEvent) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<MascotEvent>(EVENT, { detail: event }));
}

export function onMascot(handler: (event: MascotEvent) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<MascotEvent>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
