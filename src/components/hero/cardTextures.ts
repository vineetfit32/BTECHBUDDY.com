import * as THREE from "three";

export interface Palette {
  canvas: string;
  surface: string;
  surface3: string;
  ink: string;
  ink3: string;
  brand: string;
  accent: string;
  warn: string;
  ok: string;
}

export type CardKind = "dsa" | "circuit" | "gears" | "calculus";

const TITLES: Record<CardKind, [string, string]> = {
  dsa: ["DSA · CS201", "AVL rotations"],
  circuit: ["EE · Network theory", "Thevenin equivalent"],
  gears: ["ME · Machine design", "Gear trains"],
  calculus: ["MA101 · Maths I", "Definite integrals"],
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawTree(ctx: CanvasRenderingContext2D, p: Palette) {
  const nodes: Array<[number, number, string]> = [
    [256, 150, "30"],
    [160, 230, "20"],
    [352, 230, "40"],
    [110, 310, "10"],
    [210, 310, "25"],
    [402, 310, "50"],
  ];
  const edges = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
  ];
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 5;
  for (const [a, b] of edges) {
    ctx.beginPath();
    ctx.moveTo(nodes[a][0], nodes[a][1]);
    ctx.lineTo(nodes[b][0], nodes[b][1]);
    ctx.stroke();
  }
  for (const [x, y, label] of nodes) {
    ctx.fillStyle = p.surface3;
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = p.brand;
    ctx.stroke();
    ctx.fillStyle = p.ink;
    ctx.font = "700 22px ui-monospace, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x, y + 1);
  }
}

function drawCircuit(ctx: CanvasRenderingContext2D, p: Palette) {
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 5;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(80, 300);
  ctx.lineTo(80, 160);
  ctx.lineTo(170, 160);
  for (let i = 0; i < 6; i++) ctx.lineTo(185 + i * 15, i % 2 ? 140 : 180);
  ctx.lineTo(290, 160);
  ctx.lineTo(430, 160);
  ctx.lineTo(430, 300);
  ctx.lineTo(80, 300);
  ctx.stroke();
  ctx.strokeStyle = p.warn;
  ctx.beginPath();
  ctx.moveTo(60, 220);
  ctx.lineTo(100, 220);
  ctx.moveTo(68, 240);
  ctx.lineTo(92, 240);
  ctx.stroke();
  ctx.strokeStyle = p.brand;
  ctx.beginPath();
  ctx.arc(430, 230, 26, 0, Math.PI * 2);
  ctx.stroke();
  for (const [x, y] of [
    [80, 160],
    [430, 160],
    [430, 300],
    [80, 300],
  ]) {
    ctx.fillStyle = p.accent;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function gear(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, teeth: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const rr = i % 2 ? r : r + 14;
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

function drawGears(ctx: CanvasRenderingContext2D, p: Palette) {
  gear(ctx, 190, 230, 70, 12, p.brand);
  gear(ctx, 330, 215, 48, 9, p.warn);
}

function drawCalculus(ctx: CanvasRenderingContext2D, p: Palette) {
  ctx.strokeStyle = p.ink3;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(70, 320);
  ctx.lineTo(450, 320);
  ctx.moveTo(90, 340);
  ctx.lineTo(90, 130);
  ctx.stroke();
  ctx.fillStyle = `${p.accent}55`;
  ctx.beginPath();
  ctx.moveTo(170, 320);
  for (let x = 170; x <= 380; x += 5) ctx.lineTo(x, 320 - 150 * Math.sin(((x - 90) / 360) * Math.PI));
  ctx.lineTo(380, 320);
  ctx.fill();
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let x = 90; x <= 450; x += 5) ctx.lineTo(x, 320 - 150 * Math.sin(((x - 90) / 360) * Math.PI));
  ctx.stroke();
  ctx.fillStyle = p.ink;
  ctx.font = "italic 700 34px Georgia, 'Times New Roman', serif";
  ctx.fillText("∫ sin x dx", 250, 170);
}

/** Card faces drawn on a 2D canvas so nothing (fonts, images) is fetched over the network. */
export function makeCardTexture(kind: CardKind, p: Palette): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext("2d")!;

  roundRect(ctx, 6, 6, 500, 372, 36);
  ctx.fillStyle = `${p.surface}e6`;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = p.brand;
  ctx.stroke();

  ctx.fillStyle = p.accent;
  ctx.font = "700 20px ui-monospace, Consolas, monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(TITLES[kind][0].toUpperCase(), 36, 56);
  ctx.fillStyle = p.ink;
  ctx.font = "800 30px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(TITLES[kind][1], 36, 96);

  ctx.textAlign = "center";
  if (kind === "dsa") drawTree(ctx, p);
  if (kind === "circuit") drawCircuit(ctx, p);
  if (kind === "gears") drawGears(ctx, p);
  if (kind === "calculus") drawCalculus(ctx, p);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function readPalette(): Palette {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback;
  return {
    canvas: v("--canvas", "#0b1020"),
    surface: v("--surface", "#111a33"),
    surface3: v("--surface-3", "#1f2c54"),
    ink: v("--ink", "#ece9e2"),
    ink3: v("--ink-3", "#8e97ae"),
    brand: v("--brand", "#7c6dff"),
    accent: v("--accent", "#22d3ee"),
    warn: v("--warn", "#f5b83d"),
    ok: v("--ok", "#34d399"),
  };
}
