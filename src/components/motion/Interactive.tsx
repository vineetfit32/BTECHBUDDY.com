"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import { usePreferences } from "@/lib/use-preferences";
import { cn } from "@/lib/utils";

/** Counts up to `value` the first time it scrolls into view. */
export function CountUp({ value, suffix = "", prefix = "", className, duration = 1.4 }: { value: number; suffix?: string; prefix?: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const { motion: level } = usePreferences();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (level === "off") {
      queueMicrotask(() => setDisplay(value));
      return;
    }
    const controls = animate(0, value, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setDisplay(Math.round(v)) });
    return () => controls.stop();
  }, [inView, value, duration, level]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

function usePointerFine() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return fine;
}

/** Element drifts toward the cursor while hovered (desktop, full motion only). */
export function Magnetic({ children, strength = 0.25, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { motion: level } = usePreferences();
  const fine = usePointerFine();
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 18 });
  const enabled = fine && level === "full";

  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={enabled ? { x, y } : undefined}
      onPointerMove={(e) => {
        if (!enabled || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** 3D tilt with a moving glare highlight. */
export function TiltCard({ children, className, max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const { motion: level } = usePreferences();
  const fine = usePointerFine();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 200, damping: 20 });
  const glare = useTransform([px, py], ([gx, gy]) => `radial-gradient(circle at ${(gx as number) * 100}% ${(gy as number) * 100}%, rgb(255 255 255 / 0.14), transparent 55%)`);
  const enabled = fine && level === "full";

  return (
    <motion.div
      className={cn("relative [transform-style:preserve-3d]", className)}
      style={enabled ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
      onPointerMove={(e) => {
        if (!enabled) return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
    >
      {children}
      {enabled && <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: glare }} />}
    </motion.div>
  );
}

/** Infinite horizontal ticker; static row when motion is reduced. */
export function Marquee({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("group relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]", className)}>
      <div className="flex w-max shrink-0 gap-3 pr-3 motion-safe:animate-marquee group-hover:[animation-play-state:paused] calm:animate-none">
        {children}
        <div aria-hidden className="flex gap-3">
          {children}
        </div>
      </div>
    </div>
  );
}
