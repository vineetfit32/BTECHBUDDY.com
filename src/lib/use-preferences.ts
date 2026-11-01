"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_PREFERENCES, STORAGE, type Lang, type MotionLevel, type Preferences, type ThemeId } from "./preferences";

function read(): Preferences {
  const d = document.documentElement;
  const ls = window.localStorage;
  const override = ls.getItem(STORAGE.motion);
  return {
    theme: (d.dataset.theme as ThemeId) || "study",
    nightAuto: ls.getItem(STORAGE.nightAuto) === "1",
    saver: d.dataset.saver === "on",
    focus: d.dataset.focus === "on",
    motion: (d.dataset.motion as MotionLevel) || "full",
    motionOverride: override === "full" || override === "reduced" || override === "off" ? override : null,
    lang: d.lang === "hi" ? "hi" : "en",
  };
}

let snapshot: Preferences = DEFAULT_PREFERENCES;
let snapshotKey = "";

function getSnapshot(): Preferences {
  const next = read();
  const key = JSON.stringify(next);
  if (key !== snapshotKey) {
    snapshotKey = key;
    snapshot = next;
  }
  return snapshot;
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-saver", "data-focus", "data-motion", "lang"],
  });
  window.addEventListener("storage", onChange);
  window.addEventListener("btb-preferences", onChange);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", onChange);
    window.removeEventListener("btb-preferences", onChange);
  };
}

function notify() {
  window.dispatchEvent(new Event("btb-preferences"));
}

function autoMotion(saver: boolean): MotionLevel {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowEnd = (nav.hardwareConcurrency || 8) <= 2 || (nav.deviceMemory || 8) <= 2;
  return reduced ? "reduced" : saver || lowEnd ? "reduced" : "full";
}

export const preferenceActions = {
  setTheme(theme: ThemeId) {
    const d = document.documentElement;
    const apply = () => {
      d.dataset.theme = theme;
      d.classList.toggle("dark", theme !== "light");
    };
    localStorage.setItem(STORAGE.theme, theme);
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (doc.startViewTransition && d.dataset.motion === "full") doc.startViewTransition(apply);
    else apply();
  },
  setNightAuto(on: boolean) {
    localStorage.setItem(STORAGE.nightAuto, on ? "1" : "0");
    notify();
  },
  setSaver(on: boolean) {
    localStorage.setItem(STORAGE.saver, String(on));
    const d = document.documentElement;
    d.dataset.saver = on ? "on" : "off";
    if (!localStorage.getItem(STORAGE.motion)) d.dataset.motion = autoMotion(on);
  },
  setFocus(on: boolean) {
    sessionStorage.setItem(STORAGE.focus, on ? "on" : "off");
    document.documentElement.dataset.focus = on ? "on" : "off";
  },
  setMotion(level: MotionLevel | null) {
    if (level) localStorage.setItem(STORAGE.motion, level);
    else localStorage.removeItem(STORAGE.motion);
    document.documentElement.dataset.motion = level ?? autoMotion(document.documentElement.dataset.saver === "on");
  },
  setLang(lang: Lang) {
    localStorage.setItem(STORAGE.lang, lang);
    document.documentElement.lang = lang;
  },
};

export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_PREFERENCES);
}
