import { cn } from "@/lib/utils";

/** Buddy's head as the logo mark. Colours follow the active theme. */
export function BrandMark({ className, blink = true }: { className?: string; blink?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-10", className)} aria-hidden>
      <defs>
        <linearGradient id="bm-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "color-mix(in oklab, var(--brand) 70%, white 30%)" }} />
          <stop offset="1" style={{ stopColor: "var(--brand)" }} />
        </linearGradient>
        <radialGradient id="bm-eye" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" style={{ stopColor: "white" }} />
          <stop offset="0.35" style={{ stopColor: "var(--accent)" }} />
          <stop offset="1" style={{ stopColor: "color-mix(in oklab, var(--accent) 55%, black 45%)" }} />
        </radialGradient>
      </defs>
      <path d="M15 20 9 3l15 10Z" fill="url(#bm-body)" stroke="var(--canvas)" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M49 20 55 3 40 13Z" fill="url(#bm-body)" stroke="var(--canvas)" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="9" cy="3.5" r="2.6" fill="var(--accent)" />
      <circle cx="55" cy="3.5" r="2.6" fill="var(--accent)" />
      <rect x="7" y="10" width="50" height="48" rx="21" fill="url(#bm-body)" stroke="var(--canvas)" strokeWidth="3" />
      <ellipse cx="22" cy="17" rx="9" ry="4" fill="white" opacity="0.22" />
      <rect x="13" y="22" width="38" height="21" rx="10.5" fill="var(--canvas)" />
      <g className={blink ? "origin-center [transform-box:fill-box] motion-safe:animate-[blink_5s_infinite]" : undefined}>
        <circle cx="23.5" cy="32.5" r="6.2" fill="url(#bm-eye)" />
        <circle cx="40.5" cy="32.5" r="6.2" fill="url(#bm-eye)" />
        <circle cx="25.5" cy="30.3" r="1.8" fill="white" />
        <circle cx="42.5" cy="30.3" r="1.8" fill="white" />
      </g>
      <path d="M28.5 45.5h7L32 51Z" fill="var(--warn)" stroke="var(--canvas)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display text-lg font-bold tracking-tight text-ink", className)}>
      BTECH<span className="text-brand">BUDDY</span>
    </span>
  );
}
