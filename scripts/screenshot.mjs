// Visual QA helper: node scripts/screenshot.mjs <baseUrl> <path> [theme] [width] [motion]
import { chromium } from "@playwright/test";
import fs from "node:fs";

const [base = "http://localhost:3000", route = "/", theme = "study", width = "1440", motion = "full"] = process.argv.slice(2);
const out = "test-results/screens";
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ args: ["--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(width) > 800 ? 900 : 844 }, deviceScaleFactor: 1 });
await page.addInitScript(
  ({ theme, motion }) => {
    localStorage.setItem("btb-theme", theme);
    localStorage.setItem("btb-motion", motion);
    sessionStorage.setItem("btb-greeted", "1");
  },
  { theme, motion }
);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(base + route, { waitUntil: "networkidle", timeout: 120_000 });
await page.waitForTimeout(2500);
const name = `${route.replace(/\W+/g, "_") || "home"}-${theme}-${width}-${motion}`;
await page.screenshot({ path: `${out}/${name}.png` });
const height = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < height; y += 500) {
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(120);
}
await page.waitForTimeout(800);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/${name}-full.png`, fullPage: true });
console.log(JSON.stringify({ shot: `${out}/${name}.png`, errors: errors.slice(0, 8) }, null, 2));
await browser.close();
