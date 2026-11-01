import Buddy from "@/components/mascot/Buddy";

const CARDS = [
  { x: "4%", y: "14%", r: -8, title: "DSA · CS201", sub: "AVL rotations", accent: "var(--brand)" },
  { x: "68%", y: "8%", r: 6, title: "EE · Networks", sub: "Thevenin", accent: "var(--accent)" },
  { x: "70%", y: "58%", r: -5, title: "MA101", sub: "∫ sin x dx", accent: "var(--warn)" },
  { x: "2%", y: "60%", r: 7, title: "ME · Design", sub: "Gear trains", accent: "var(--ok)" },
];

/** Static 2D stand-in for the 3D hero: data-saver, reduced motion, low-end devices and no-WebGL browsers. */
export default function HeroPoster({ animated = false }: { animated?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <defs>
          <pattern id="poster-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0V32" fill="none" stroke="var(--grid-line)" strokeWidth="1.2" />
          </pattern>
          <radialGradient id="poster-fade" cx="50%" cy="60%" r="60%">
            <stop offset="0" stopColor="white" />
            <stop offset="1" stopColor="black" />
          </radialGradient>
          <mask id="poster-mask">
            <rect width="100%" height="100%" fill="url(#poster-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#poster-grid)" mask="url(#poster-mask)" />
      </svg>

      <div className="absolute inset-x-[12%] bottom-[10%] h-6 rounded-[50%] bg-black/30 blur-md" />
      <div className="absolute inset-x-[14%] bottom-[12%] h-5 rounded-xl border-2 border-edge bg-surface-3" />

      {CARDS.map((c) => (
        <div
          key={c.title}
          className="brutal absolute w-[34%] max-w-[180px] p-3"
          style={{ left: c.x, top: c.y, transform: `rotate(${c.r}deg)`, boxShadow: `4px 4px 0 0 ${c.accent}` }}
        >
          <p className="font-mono text-[9px] font-bold uppercase tracking-widest" style={{ color: c.accent }}>
            {c.title}
          </p>
          <p className="mt-1 font-display text-sm font-bold text-ink">{c.sub}</p>
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-[13%] flex justify-center">
        <Buddy mood={animated ? "wave" : "idle"} className="h-[clamp(200px,44vh,340px)] w-auto" title="Buddy, the BTECHBUDDY mascot" />
      </div>
    </div>
  );
}
