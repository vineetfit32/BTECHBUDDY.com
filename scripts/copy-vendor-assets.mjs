// Copies runtime assets that libraries would otherwise fetch from public CDNs into public/vendor.
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "public", "vendor");

const copies = [
  ["node_modules/pdfjs-dist/build/pdf.worker.min.mjs", "pdfjs/pdf.worker.min.mjs"],
  ["node_modules/pdfjs-dist/cmaps", "pdfjs/cmaps"],
  ["node_modules/pdfjs-dist/standard_fonts", "pdfjs/standard_fonts"],
  ["node_modules/pdfjs-dist/wasm", "pdfjs/wasm"],
  ["node_modules/@excalidraw/excalidraw/dist/prod/fonts", "excalidraw/fonts"],
];

let copied = 0;
for (const [from, to] of copies) {
  const src = path.join(root, from);
  if (!fs.existsSync(src)) {
    console.warn(`[vendor] skipped ${from} (not installed)`);
    continue;
  }
  const dest = path.join(out, to);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true, force: true });
  copied++;
}
console.log(`[vendor] copied ${copied}/${copies.length} asset bundles into public/vendor`);
