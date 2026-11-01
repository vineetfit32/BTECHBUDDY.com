import type { Transition, Variants } from "motion/react";

/** Motion tokens shared by Motion (JS), GSAP and CSS (see --ease-* in globals.css). */
export const duration = {
  instant: 0.12,
  fast: 0.2,
  base: 0.32,
  slow: 0.5,
  scenic: 0.9,
} as const;

export const ease = {
  outExpo: [0.16, 1, 0.3, 1],
  inOutQuart: [0.76, 0, 0.24, 1],
  spring: [0.34, 1.56, 0.64, 1],
} as const;

export const spring = {
  snappy: { type: "spring", stiffness: 520, damping: 36 },
  gentle: { type: "spring", stiffness: 180, damping: 24 },
  bouncy: { type: "spring", stiffness: 320, damping: 14, mass: 0.8 },
} satisfies Record<string, Transition>;

export const gsapEase = {
  outExpo: "expo.out",
  inOutQuart: "power4.inOut",
  spring: "back.out(1.7)",
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.slow, ease: ease.outExpo } },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: spring.bouncy },
};

export const staggerContainer = (stagger = 0.07, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});
