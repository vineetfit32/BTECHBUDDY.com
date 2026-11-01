// One-off migration: map hard-coded accent palettes to semantic theme tokens
// (indigo/violet/purple → brand, cyan/sky → accent, emerald/green → ok, amber/yellow → warn, rose/red → danger).
// Usage: node scripts/codemods/tokenize-accents.mjs [--dry]
import fs from "node:fs";
import path from "node:path";

const DRY = process.argv.includes("--dry");
const ROOT = path.resolve("src");

const FAMILY = {
  indigo: "brand",
  violet: "brand",
  purple: "brand",
  cyan: "accent",
  sky: "accent",
  emerald: "ok",
  green: "ok",
  amber: "warn",
  yellow: "warn",
  rose: "danger",
  red: "danger",
};
const FAMILIES = Object.keys(FAMILY).join("|");
const NEUTRAL = "slate|gray|zinc|neutral|stone";

const TOKEN_RE = new RegExp(
  `^((?:[^\\s:]+:)*)(text|bg|border(?:-[trblxy])?|divide|ring|outline|fill|stroke|from|via|to|shadow)-(?:(${FAMILIES})-(50|100|200|300|400|500|600|700|800|900|950)|(${NEUTRAL})-\\d{2,3}|white|black|\\[#[0-9a-fA-F]{3,8}\\])(\\/(?:\\d{1,3}|\\[[^\\]]+\\]))?(!?)$`
);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "generated" ? [] : walk(full);
    return /\.(tsx|ts)$/.test(entry.name) ? [full] : [];
  });
}

function parse(token) {
  const m = TOKEN_RE.exec(token);
  if (!m) return null;
  const variants = m[1] ? m[1].slice(0, -1).split(":") : [];
  return {
    isDark: variants.includes("dark"),
    rest: variants.filter((v) => v !== "dark"),
    prop: m[2],
    family: m[3] ?? null,
    shade: m[4] ? Number(m[4]) : null,
    opacity: m[6] ?? "",
    important: m[7],
  };
}

function semanticFor(p) {
  const sem = FAMILY[p.family];
  const isHover = p.rest.some((v) => v.includes("hover"));
  switch (p.prop) {
    case "text":
    case "fill":
    case "stroke":
      return sem + p.opacity;
    case "bg":
      if (p.opacity) return sem + p.opacity;
      if (p.shade <= 200) return `${sem}-soft`;
      if (isHover && p.shade >= 700) return sem === "brand" ? "brand-strong" : `${sem}/90`;
      return sem;
    case "from":
    case "via":
    case "to":
      if (p.opacity) return sem + p.opacity;
      return p.shade <= 200 ? `${sem}-soft` : sem;
    case "shadow":
      return sem + (p.opacity || "/30");
    default:
      if (p.opacity) return sem + p.opacity;
      return p.shade <= 300 ? `${sem}/35` : sem;
  }
}

const stats = { files: 0, mapped: 0, droppedDark: 0 };

function processRun(run) {
  const parts = run.split(/(\s+)/);
  const tokens = parts.map((text, i) => ({ text, i, ws: i % 2 === 1, parsed: i % 2 === 1 ? null : parse(text) }));
  const groups = new Map();
  for (const t of tokens) {
    if (!t.parsed) continue;
    const key = `${t.parsed.rest.join(":")}|${t.parsed.prop}`;
    if (!groups.has(key)) groups.set(key, { base: [], dark: [] });
    groups.get(key)[t.parsed.isDark ? "dark" : "base"].push(t);
  }
  if (!groups.size) return run;

  const drop = new Set();
  for (const { base, dark } of groups.values()) {
    for (const b of base) {
      if (!b.parsed.family) continue;
      const semantic = semanticFor(b.parsed);
      const prefix = b.parsed.rest.length ? `${b.parsed.rest.join(":")}:` : "";
      b.text = `${prefix}${b.parsed.prop}-${semantic}${b.parsed.important}`;
      stats.mapped++;
      const twin = dark.find((d) => !drop.has(d.i));
      if (twin) {
        drop.add(twin.i);
        stats.droppedDark++;
      }
    }
  }

  const out = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (drop.has(t.i)) {
      if (out.length && /^\s+$/.test(out[out.length - 1])) out.pop();
      else if (tokens[i + 1]?.ws) i++;
      continue;
    }
    out.push(t.text);
  }
  return out.join("");
}

const RUN_RE = /[^\s"'`{}=,;<>?]+(?:\s+[^\s"'`{}=,;<>?]+)*/g;
const HAS_ACCENT = new RegExp(`-(${FAMILIES})-\\d`);

for (const file of walk(ROOT)) {
  const source = fs.readFileSync(file, "utf8");
  if (!HAS_ACCENT.test(source)) continue;
  const next = source.replace(RUN_RE, (run) => processRun(run));
  if (next !== source) {
    stats.files++;
    if (!DRY) fs.writeFileSync(file, next);
  }
}

console.log(`[tokenize-accents] ${DRY ? "would update" : "updated"} ${stats.files} files: ${stats.mapped} mapped, ${stats.droppedDark} dark: twins removed`);
