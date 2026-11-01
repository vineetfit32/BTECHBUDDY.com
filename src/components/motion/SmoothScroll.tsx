"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { registerGsap, ScrollTrigger, gsap } from "@/lib/gsap";
import { usePreferences } from "@/lib/use-preferences";

const SMOOTH_ROUTES = new Set(["/", "/about", "/branches", "/universities"]);

/** Lenis smooth scrolling on marketing pages only, driven by the GSAP ticker so ScrollTrigger stays in sync. */
export default function SmoothScroll() {
  const pathname = usePathname();
  const { motion, saver } = usePreferences();
  const enabled = SMOOTH_ROUTES.has(pathname) && motion === "full" && !saver;

  useEffect(() => {
    if (!enabled) return;
    registerGsap();
    const lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add("lenis");
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      document.documentElement.classList.remove("lenis");
    };
  }, [enabled]);

  return null;
}
