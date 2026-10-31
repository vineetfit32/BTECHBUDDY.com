import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        desk: {
          canvas: "var(--canvas-bg)",
          elevated: "var(--canvas-elevated)",
          card: "var(--card-bg)",
          border: "var(--card-border)",
          "border-hover": "var(--card-hover-border)",
        },
        primary: {
          violet: "var(--primary-violet)",
          "violet-hover": "var(--primary-violet-hover)",
          "violet-subtle": "var(--primary-violet-subtle)",
        },
        accent: {
          cyan: "var(--accent-cyan)",
          "cyan-subtle": "var(--accent-cyan-subtle)",
          amber: "var(--accent-amber)",
          "amber-subtle": "var(--accent-amber-subtle)",
          emerald: "var(--accent-emerald)",
          "emerald-subtle": "var(--accent-emerald-subtle)",
        },
        // Deep Navy shades for backgrounds
        navy: {
          850: "#121C38",
          900: "#0E162E",
          950: "#0B1020",
        },
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        glow: "0 0 20px -3px var(--glow-color)",
        "glow-sm": "0 0 10px -2px var(--glow-color)",
        "glow-lg": "0 0 35px -5px var(--glow-color)",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};

export default config;
