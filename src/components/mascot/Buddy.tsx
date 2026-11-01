"use client";

import { useId } from "react";
import { AnimatePresence, motion, type Transition, type Variants } from "motion/react";
import type { Mood } from "@/lib/mascot/machine";
import { cn } from "@/lib/utils";

const loop = (duration: number, extra: Transition = {}): Transition => ({ duration, repeat: Infinity, ease: "easeInOut", ...extra });

const bodyV: Variants = {
  idle: { y: [0, -3, 0], rotate: 0, scaleY: 1, transition: loop(3.2) },
  wave: { y: [0, -5, 0], rotate: 0, scaleY: 1, transition: loop(1.1) },
  thinking: { y: [0, -2, 0], rotate: -3, scaleY: 1, transition: loop(2.4) },
  celebrate: { y: [0, -26, 0, 0], scaleY: [1, 1.04, 0.9, 1], rotate: 0, transition: loop(0.75, { ease: "easeOut", repeatDelay: 0.1 }) },
  cheer: { y: [0, -12, 0], rotate: [0, -3, 3, 0], scaleY: 1, transition: loop(0.9) },
  sleepy: { y: [0, 2, 0], rotate: 2, scaleY: 1, transition: loop(4.2) },
  focus: { y: [0, -1.5, 0], rotate: 0, scaleY: 1, transition: loop(4) },
  sad: { y: 5, rotate: 0, scaleY: 0.96, transition: { duration: 0.6 } },
};

const headV: Variants = {
  idle: { rotate: [0, 2, 0, -2, 0], y: 0, transition: loop(6) },
  wave: { rotate: [0, -7, 5, 0], y: 0, transition: loop(1.4) },
  thinking: { rotate: -9, y: -1, transition: { type: "spring", stiffness: 120, damping: 12 } },
  celebrate: { rotate: [0, -7, 7, 0], y: 0, transition: loop(0.75) },
  cheer: { rotate: [0, 6, -6, 0], y: 0, transition: loop(0.9) },
  sleepy: { rotate: [6, 13, 6], y: 4, transition: loop(3) },
  focus: { rotate: 0, y: 1, transition: { duration: 0.5 } },
  sad: { rotate: 7, y: 7, transition: { duration: 0.6 } },
};

const leftWingV: Variants = {
  idle: { rotate: [0, 5, 0], transition: loop(3.2) },
  wave: { rotate: 6, transition: { duration: 0.3 } },
  thinking: { rotate: 4, transition: { duration: 0.4 } },
  celebrate: { rotate: [10, 62, 38, 62], transition: loop(0.75) },
  cheer: { rotate: [0, 42, 0], transition: loop(0.9) },
  sleepy: { rotate: -2, transition: { duration: 0.8 } },
  focus: { rotate: 2, transition: { duration: 0.5 } },
  sad: { rotate: -8, transition: { duration: 0.6 } },
};

const rightWingV: Variants = {
  idle: { rotate: [0, -5, 0], transition: loop(3.2) },
  wave: { rotate: [-20, -78, -45, -78, -45], transition: loop(1.1) },
  thinking: { rotate: -72, transition: { type: "spring", stiffness: 140, damping: 14 } },
  celebrate: { rotate: [-10, -62, -38, -62], transition: loop(0.75) },
  cheer: { rotate: [0, -42, 0], transition: loop(0.9) },
  sleepy: { rotate: 2, transition: { duration: 0.8 } },
  focus: { rotate: -2, transition: { duration: 0.5 } },
  sad: { rotate: 8, transition: { duration: 0.6 } },
};

const blink: Transition = { duration: 4.6, repeat: Infinity, times: [0, 0.9, 0.95, 1], ease: "easeInOut" };

const MOOD_LABEL: Record<Mood, string> = {
  idle: "Buddy is standing by",
  wave: "Buddy is waving",
  thinking: "Buddy is thinking",
  celebrate: "Buddy is celebrating",
  cheer: "Buddy is cheering you on",
  sleepy: "Buddy is sleepy",
  focus: "Buddy is in focus mode",
  sad: "Buddy is a little sad",
};

export default function Buddy({ mood = "idle", className, title }: { mood?: Mood; className?: string; title?: string }) {
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `${name}-${uid}`;
  const roundEyes = mood === "idle" || mood === "wave" || mood === "thinking" || mood === "focus" || mood === "sad";
  const talking = mood === "wave" || mood === "celebrate" || mood === "cheer";

  return (
    <svg viewBox="0 0 200 224" className={cn("overflow-visible", className)} role="img" aria-label={title ?? MOOD_LABEL[mood]}>
      <defs>
        <linearGradient id={id("body")} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" style={{ stopColor: "color-mix(in oklab, var(--brand) 62%, white 38%)" }} />
          <stop offset="0.55" style={{ stopColor: "var(--brand)" }} />
          <stop offset="1" style={{ stopColor: "color-mix(in oklab, var(--brand) 70%, black 30%)" }} />
        </linearGradient>
        <linearGradient id={id("belly")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "color-mix(in oklab, var(--brand) 25%, white 75%)" }} />
          <stop offset="1" style={{ stopColor: "color-mix(in oklab, var(--brand) 45%, white 55%)" }} />
        </linearGradient>
        <radialGradient id={id("eye")} cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" style={{ stopColor: "white" }} />
          <stop offset="0.3" style={{ stopColor: "var(--accent)" }} />
          <stop offset="1" style={{ stopColor: "color-mix(in oklab, var(--accent) 50%, black 50%)" }} />
        </radialGradient>
        <linearGradient id={id("visor")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "color-mix(in oklab, var(--canvas) 70%, var(--brand) 30%)" }} />
          <stop offset="1" style={{ stopColor: "var(--canvas)" }} />
        </linearGradient>
        <filter id={id("glow")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <motion.ellipse
        cx="100"
        cy="214"
        rx="54"
        ry="8"
        fill="black"
        opacity="0.3"
        animate={mood === "celebrate" ? { scaleX: [1, 0.7, 1, 1], opacity: [0.3, 0.15, 0.3, 0.3] } : { scaleX: 1, opacity: 0.3 }}
        transition={mood === "celebrate" ? loop(0.75, { ease: "easeOut", repeatDelay: 0.1 }) : { duration: 0.3 }}
      />

      <motion.g variants={bodyV} animate={mood} initial={false} style={{ originX: 0.5, originY: 1 }}>
        <ellipse cx="80" cy="203" rx="15" ry="7" fill="var(--warn)" stroke="var(--canvas)" strokeWidth="3" />
        <ellipse cx="120" cy="203" rx="15" ry="7" fill="var(--warn)" stroke="var(--canvas)" strokeWidth="3" />

        <motion.path
          d="M54 118c-16 6-24 30-20 52 2 10 10 13 16 7 6-8 10-26 12-42"
          fill={`url(#${id("body")})`}
          stroke="var(--canvas)"
          strokeWidth="4"
          strokeLinejoin="round"
          variants={leftWingV}
          animate={mood}
          initial={false}
          style={{ originX: 0.9, originY: 0.1 }}
        />
        <motion.path
          d="M146 118c16 6 24 30 20 52-2 10-10 13-16 7-6-8-10-26-12-42"
          fill={`url(#${id("body")})`}
          stroke="var(--canvas)"
          strokeWidth="4"
          strokeLinejoin="round"
          variants={rightWingV}
          animate={mood}
          initial={false}
          style={{ originX: 0.1, originY: 0.1 }}
        />

        <path
          d="M100 92c46 0 62 36 58 70-3 30-26 44-58 44s-55-14-58-44c-4-34 12-70 58-70Z"
          fill={`url(#${id("body")})`}
          stroke="var(--canvas)"
          strokeWidth="4"
        />
        <ellipse cx="100" cy="160" rx="36" ry="32" fill={`url(#${id("belly")})`} opacity="0.95" />
        <g stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.55">
          <path d="M80 152h10l5-6h12" />
          <path d="M120 166h-10l-5 6H93" />
          <path d="M84 178h32" />
        </g>
        <motion.circle
          cx="100"
          cy="159"
          r="5.5"
          fill="var(--accent)"
          filter={`url(#${id("glow")})`}
          animate={{ scale: mood === "focus" ? [1, 1.5, 1] : [1, 1.2, 1], opacity: mood === "sleepy" ? 0.5 : 1 }}
          transition={loop(mood === "focus" ? 1.4 : 2.6)}
          style={{ originX: 0.5, originY: 0.5 }}
        />
        <ellipse cx="78" cy="118" rx="16" ry="7" fill="white" opacity="0.16" transform="rotate(-20 78 118)" />

        <motion.g variants={headV} animate={mood} initial={false} style={{ originX: 0.5, originY: 0.9 }}>
          <motion.g animate={mood === "celebrate" || mood === "cheer" ? { rotate: [0, -10, 10, 0] } : { rotate: 0 }} transition={loop(0.6)} style={{ originX: 1, originY: 1 }}>
            <path d="M58 46 46 14l30 18Z" fill={`url(#${id("body")})`} stroke="var(--canvas)" strokeWidth="4" strokeLinejoin="round" />
          </motion.g>
          <motion.g animate={mood === "celebrate" || mood === "cheer" ? { rotate: [0, 10, -10, 0] } : { rotate: 0 }} transition={loop(0.6)} style={{ originX: 0, originY: 1 }}>
            <path d="m142 46 12-32-30 18Z" fill={`url(#${id("body")})`} stroke="var(--canvas)" strokeWidth="4" strokeLinejoin="round" />
          </motion.g>
          <motion.circle cx="46" cy="14" r="5" fill="var(--accent)" filter={`url(#${id("glow")})`} animate={{ opacity: mood === "sleepy" ? 0.35 : [0.7, 1, 0.7] }} transition={loop(1.8)} />
          <motion.circle cx="154" cy="14" r="5" fill="var(--accent)" filter={`url(#${id("glow")})`} animate={{ opacity: mood === "sleepy" ? 0.35 : [1, 0.7, 1] }} transition={loop(1.8)} />

          <rect x="34" y="26" width="132" height="96" rx="46" fill={`url(#${id("body")})`} stroke="var(--canvas)" strokeWidth="4" />
          <ellipse cx="72" cy="38" rx="20" ry="7" fill="white" opacity="0.2" />

          <path d="M42 70c0-58 116-58 116 0" fill="none" stroke="var(--canvas)" strokeWidth="11" strokeLinecap="round" />
          <path d="M42 70c0-58 116-58 116 0" fill="none" stroke="var(--line-strong)" strokeWidth="6" strokeLinecap="round" />
          <rect x="24" y="56" width="22" height="38" rx="10" fill="var(--surface-3)" stroke="var(--canvas)" strokeWidth="4" />
          <rect x="154" y="56" width="22" height="38" rx="10" fill="var(--surface-3)" stroke="var(--canvas)" strokeWidth="4" />
          <motion.circle cx="35" cy="75" r="3.5" fill={mood === "focus" ? "var(--ok)" : "var(--accent)"} animate={{ opacity: mood === "focus" ? [0.6, 1, 0.6] : 0.6 }} transition={loop(1.2)} />
          <motion.circle cx="165" cy="75" r="3.5" fill={mood === "focus" ? "var(--ok)" : "var(--accent)"} animate={{ opacity: mood === "focus" ? [1, 0.6, 1] : 0.6 }} transition={loop(1.2)} />

          <rect x="54" y="52" width="92" height="48" rx="24" fill={`url(#${id("visor")})`} stroke="var(--canvas)" strokeWidth="3" />
          <path d="M66 60h22" stroke="white" strokeOpacity="0.18" strokeWidth="4" strokeLinecap="round" />

          {roundEyes ? (
            <motion.g
              animate={mood === "thinking" ? { x: 4, y: -4 } : mood === "sad" ? { x: 0, y: 3 } : { x: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
            >
              <motion.g
                animate={{ scaleY: mood === "focus" ? 0.62 : [1, 1, 0.08, 1] }}
                transition={mood === "focus" ? { duration: 0.3 } : blink}
                style={{ originX: 0.5, originY: 0.5 }}
              >
                <circle cx="80" cy="76" r={mood === "sad" ? 11 : 13.5} fill={`url(#${id("eye")})`} filter={`url(#${id("glow")})`} />
                <circle cx="120" cy="76" r={mood === "sad" ? 11 : 13.5} fill={`url(#${id("eye")})`} filter={`url(#${id("glow")})`} />
                <circle cx="84" cy="71" r="3.6" fill="white" />
                <circle cx="124" cy="71" r="3.6" fill="white" />
              </motion.g>
              {mood === "sad" && (
                <g stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round">
                  <path d="M68 62l20 4" />
                  <path d="M132 62l-20 4" />
                </g>
              )}
            </motion.g>
          ) : mood === "sleepy" ? (
            <g stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" fill="none" filter={`url(#${id("glow")})`}>
              <path d="M68 76q12 7 24 0" />
              <path d="M108 76q12 7 24 0" />
            </g>
          ) : (
            <g stroke="var(--accent)" strokeWidth="5.5" strokeLinecap="round" fill="none" filter={`url(#${id("glow")})`}>
              <path d="M67 81q13-17 26 0" />
              <path d="M107 81q13-17 26 0" />
            </g>
          )}

          <motion.path
            d="M91 104h18l-9 12Z"
            fill="var(--warn)"
            stroke="var(--canvas)"
            strokeWidth="3"
            strokeLinejoin="round"
            animate={talking ? { scaleY: [1, 1.35, 1] } : { scaleY: 1 }}
            transition={talking ? loop(0.4) : { duration: 0.2 }}
            style={{ originX: 0.5, originY: 0 }}
          />

          <AnimatePresence>
            {(mood === "celebrate" || mood === "cheer" || mood === "wave") && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} exit={{ opacity: 0 }}>
                <ellipse cx="56" cy="104" rx="9" ry="5" fill="var(--danger)" />
                <ellipse cx="144" cy="104" rx="9" ry="5" fill="var(--danger)" />
              </motion.g>
            )}
          </AnimatePresence>
        </motion.g>
      </motion.g>

      <AnimatePresence>
        {mood === "celebrate" && (
          <motion.g key="sparkles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {[
              [20, 40, 0],
              [180, 32, 0.15],
              [10, 120, 0.3],
              [192, 110, 0.45],
            ].map(([x, y, delay]) => (
              <motion.path
                key={`${x}-${y}`}
                d={`M${x} ${y - 9}l2.6 6.4 6.4 2.6-6.4 2.6L${x} ${y + 9}l-2.6-6.4-6.4-2.6 6.4-2.6Z`}
                fill="var(--warn)"
                animate={{ scale: [0, 1.2, 0], rotate: [0, 90] }}
                transition={loop(1.1, { delay })}
                style={{ originX: 0.5, originY: 0.5 }}
              />
            ))}
          </motion.g>
        )}
        {mood === "sleepy" && (
          <motion.g key="zzz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} fill="var(--ink-2)" fontFamily="var(--font-display)" fontWeight="800">
            {[0, 0.9, 1.8].map((delay, i) => (
              <motion.text
                key={delay}
                x={160 + i * 8}
                y={30}
                fontSize={12 + i * 4}
                animate={{ y: [30, 0], opacity: [0, 1, 0] }}
                transition={loop(2.7, { delay, ease: "easeOut" })}
              >
                z
              </motion.text>
            ))}
          </motion.g>
        )}
        {mood === "thinking" && (
          <motion.g key="dots" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {[0, 1, 2].map((i) => (
              <motion.circle
                key={i}
                cx={164 + i * 12}
                cy={20 - i * 6}
                r={4 + i}
                fill="var(--ink-2)"
                animate={{ opacity: [0.2, 1, 0.2], y: [0, -4, 0] }}
                transition={loop(1.2, { delay: i * 0.2 })}
              />
            ))}
          </motion.g>
        )}
        {mood === "sad" && (
          <motion.path
            key="tear"
            d="M126 92c4 6 6 9 6 12a6 6 0 0 1-12 0c0-3 2-6 6-12Z"
            fill="var(--accent)"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: [0, 26] }}
            transition={loop(2.2, { ease: "easeIn" })}
          />
        )}
        {mood === "focus" && (
          <motion.circle
            key="aura"
            cx="100"
            cy="74"
            r="84"
            fill="none"
            stroke="var(--ok)"
            strokeWidth="2"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0], scale: [0.9, 1.08] }}
            exit={{ opacity: 0 }}
            transition={loop(2.4, { ease: "easeOut" })}
            style={{ originX: 0.5, originY: 0.5 }}
          />
        )}
      </AnimatePresence>
    </svg>
  );
}
