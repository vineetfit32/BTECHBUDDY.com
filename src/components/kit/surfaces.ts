/**
 * Surface rules. Each visual style has one job so screens stay coherent:
 *
 * - surface  Plain theme card. Default for content (lists, tables, forms).
 * - glass    Only for layers that float above content: navbar, command palette, dialogs,
 *            PDF/video toolbars and the mascot speech bubble. Never for scrolling content.
 * - brutal   Attention: landing sections, primary CTAs, XP/badge/leaderboard cards, stickers.
 * - clay     Tactile collectibles: mascot, achievement medals, branch icons.
 * - bento    Dashboard tiles on the Study Board and home page grid.
 *
 * Glass blur and aurora backgrounds are disabled automatically in data-saver and low-motion modes.
 */
export const surface = {
  surface: "rounded-2xl border border-line bg-surface",
  glass: "glass rounded-2xl",
  brutal: "brutal",
  clay: "clay",
  bento: "bento",
} as const;

export type SurfaceVariant = keyof typeof surface;

export const tone = {
  brand: { soft: "bg-brand-soft text-brand border-brand/30", solid: "bg-brand text-on-brand border-edge" },
  accent: { soft: "bg-accent-soft text-accent border-accent/30", solid: "bg-accent text-canvas border-edge" },
  warn: { soft: "bg-warn-soft text-warn border-warn/30", solid: "bg-warn text-canvas border-edge" },
  ok: { soft: "bg-ok-soft text-ok border-ok/30", solid: "bg-ok text-canvas border-edge" },
  danger: { soft: "bg-danger-soft text-danger border-danger/30", solid: "bg-danger text-canvas border-edge" },
  neutral: { soft: "bg-surface-2 text-ink-2 border-line", solid: "bg-ink text-canvas border-edge" },
} as const;

export type Tone = keyof typeof tone;
