// One-off migration: rewrite neutral Tailwind colours (slate/white/hex + dark: pairs) to theme tokens.
// Usage: node scripts/codemods/tokenize-colors.mjs [--dry]
import fs from "node:fs";
import path from "node:path";

const DRY = process.argv.includes("--dry");
const ROOT = path.resolve("src");

const TOKEN_RE =
  /^((?:[^\s:]+:)*)(text|bg|border(?:-[trblxy])?|divide|ring|outline|fill|stroke)-((?:slate|gray|zinc|neutral|stone)-(?:50|100|200|300|400|500|600|700|800|900|950)|white|black|\[#[0-9a-fA-F]{3,8}\])(\/(?:\d{1,3}|\[[^\]]+\]))?(!?)$/;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "generated" ? [] : walk(full);
    return /\.(tsx|ts)$/.test(entry.name) ? [full] : [];
  });
}

function hexLuminance(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Lightness on the slate scale: 0 = white … 1000 = black. */
function shadeOf(value) {
  if (value === "white") return 0;
  if (value === "black") return 1000;
  if (value.startsWith("[#")) return hexLuminance(value.slice(1, -1)) > 0.5 ? 50 : 900;
  return Number(value.split("-")[1]);
}

const family = (prop) => (prop.startsWith("border") || prop === "divide" || prop === "ring" || prop === "outline" ? "line" : prop === "fill" || prop === "stroke" ? "text" : prop);

function mapPaired(prop, value) {
  const s = shadeOf(value);
  switch (family(prop)) {
    case "text":
      if (s <= 200) return null;
      if (s <= 500) return "ink-3";
      if (s <= 700) return "ink-2";
      return "ink";
    case "bg":
      if (value.startsWith("[#")) return s < 500 ? "surface" : null;
      if (s === 0) return "surface";
      if (s <= 100) return "surface-2";
      if (s <= 300) return "surface-3";
      return null;
    case "line":
      if (s <= 200) return "line";
      if (s <= 400) return "line-strong";
      return null;
  }
  return null;
}

function mapLone(prop, value, opacity) {
  if (value.startsWith("[#")) return null;
  const s = shadeOf(value);
  switch (family(prop)) {
    case "text":
      if (value === "white" || value === "black") return null;
      if (s <= 200) return "ink";
      if (s === 300) return "ink-2";
      if (s <= 500) return "ink-3";
      if (s <= 700) return "ink-2";
      return "ink";
    case "bg":
      if (value === "white") return opacity ? null : "surface";
      if (value === "black") return null;
      if (s <= 100) return "surface-2";
      if (s <= 300) return "surface-3";
      return null;
    case "line":
      if (value === "white" || value === "black") return null;
      if (s <= 200) return "line";
      if (s <= 600) return "line-strong";
      return "line";
  }
  return null;
}

function parse(token) {
  const m = TOKEN_RE.exec(token);
  if (!m) return null;
  const variants = m[1] ? m[1].slice(0, -1).split(":") : [];
  const isDark = variants.includes("dark");
  const rest = variants.filter((v) => v !== "dark");
  return { token, isDark, rest, prop: m[2], value: m[3], opacity: m[4] ?? "", important: m[5] };
}

function build(p, semantic) {
  const prefix = p.rest.length ? `${p.rest.join(":")}:` : "";
  return `${prefix}${p.prop}-${semantic}${p.opacity}${p.important}`;
}

const stats = { files: 0, paired: 0, lone: 0, droppedDark: 0 };

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
      const darkTwin = dark.find((d) => !drop.has(d.i));
      const semantic = darkTwin ? mapPaired(b.parsed.prop, b.parsed.value) : mapLone(b.parsed.prop, b.parsed.value, b.parsed.opacity);
      if (!semantic) continue;
      b.text = build(b.parsed, semantic);
      if (darkTwin) {
        drop.add(darkTwin.i);
        stats.paired++;
        stats.droppedDark++;
      } else {
        stats.lone++;
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

for (const file of walk(ROOT)) {
  const source = fs.readFileSync(file, "utf8");
  if (!/(slate|gray|zinc|neutral|stone)-\d|-(white|black)\b|-\[#/.test(source)) continue;
  const next = source.replace(RUN_RE, (run) => processRun(run));
  if (next !== source) {
    stats.files++;
    if (!DRY) fs.writeFileSync(file, next);
  }
}

console.log(`[tokenize-colors] ${DRY ? "would update" : "updated"} ${stats.files} files: ${stats.paired} paired, ${stats.lone} lone, ${stats.droppedDark} dark: twins removed`);
