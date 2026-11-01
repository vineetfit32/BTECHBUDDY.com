"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import HeroPoster from "./HeroPoster";
import { readPalette, type Palette } from "./cardTextures";
import { registerGsap, ScrollTrigger, SplitText, gsap, useGSAP } from "@/lib/gsap";
import { usePreferences } from "@/lib/use-preferences";
import { cn } from "@/lib/utils";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

type Mode = "pending" | "3d" | "poster";

function canRender3D() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return false;
  } catch {
    return false;
  }
  const nav = navigator as Navigator & { deviceMemory?: number };
  return (nav.hardwareConcurrency ?? 8) > 2 && (nav.deviceMemory ?? 8) > 2;
}

/** Scroll-driven 3D hero with a static SVG poster for data-saver, reduced motion and low-end devices. */
export default function Hero({ children }: { children: ReactNode }) {
  const { motion, saver, theme } = usePreferences();
  const section = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [mode, setMode] = useState<Mode>("pending");
  const [palette, setPalette] = useState<Palette | null>(null);

  useEffect(() => {
    const next: Mode = motion === "full" && !saver && canRender3D() ? "3d" : "poster";
    queueMicrotask(() => setMode(next));
  }, [motion, saver]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setPalette(readPalette()));
    return () => cancelAnimationFrame(raf);
  }, [theme]);

  useGSAP(
    () => {
      if (motion !== "full" || !content.current) return;
      registerGsap();
      const heading = content.current.querySelector("[data-split]");
      const split = heading ? SplitText.create(heading, { type: "words,chars", mask: "words" }) : null;
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      if (split) tl.from(split.chars, { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.018 });
      tl.from("[data-split-word]", { y: 40, opacity: 0, rotate: -4, scale: 0.9, duration: 0.9, ease: "back.out(1.6)" }, "-=0.45");
      tl.from("[data-hero-fade]", { y: 24, opacity: 0, filter: "blur(8px)", duration: 0.8, stagger: 0.08 }, "-=0.55");

      const st =
        mode === "3d" && section.current
          ? ScrollTrigger.create({
              trigger: section.current,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
              onUpdate: (self) => {
                progress.current = self.progress;
              },
            })
          : null;

      return () => {
        st?.kill();
        split?.revert();
      };
    },
    { scope: content, dependencies: [motion, mode] }
  );

  const is3D = mode === "3d";

  return (
    <section ref={section} className={cn("relative", is3D ? "h-[175vh]" : "")} aria-label="Introduction">
      <div className={cn("relative overflow-hidden", is3D ? "sticky top-0 h-[100svh]" : "min-h-[88vh]")}>
        <div className="aurora" />
        <div className="pointer-events-none absolute inset-0 bg-blueprint bg-blueprint-fade opacity-70" />

        <div className="relative h-[44svh] min-h-[300px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[60%] lg:[mask-image:linear-gradient(to_right,transparent,black_22%)]">
          {mode === "pending" || !palette ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="skeleton size-40 !rounded-full opacity-40" />
            </div>
          ) : is3D ? (
            <HeroScene progress={progress} palette={palette} />
          ) : (
            <HeroPoster animated={motion !== "off"} />
          )}
        </div>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center px-4 pb-10 sm:px-6 lg:h-full lg:grid-cols-[1fr_1fr] lg:px-8">
          <div ref={content} className="relative z-10 lg:pr-6">
            {children}
          </div>
        </div>

        {is3D && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center" data-hero-fade>
            <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink-3">
              <span className="size-1.5 animate-ping-slow rounded-full bg-accent" /> Scroll to orbit
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
