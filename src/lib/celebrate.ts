"use client";

import confetti from "canvas-confetti";

function palette() {
  const s = getComputedStyle(document.documentElement);
  return ["--brand", "--accent", "--warn", "--ok"].map((v) => s.getPropertyValue(v).trim()).filter(Boolean);
}

/** Theme-coloured confetti burst. Skipped entirely when motion is reduced/off or data saver is on. */
export function celebrate(intensity: "small" | "big" = "small") {
  const d = document.documentElement;
  if (d.dataset.motion !== "full" || d.dataset.saver === "on") return;
  const colors = palette();
  const base = { colors, disableForReducedMotion: true, zIndex: 80, ticks: 220 };
  if (intensity === "small") {
    void confetti({ ...base, particleCount: 70, spread: 70, startVelocity: 38, origin: { x: 0.85, y: 0.85 } });
    return;
  }
  const end = Date.now() + 900;
  const frame = () => {
    void confetti({ ...base, particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.75 } });
    void confetti({ ...base, particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.75 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}
