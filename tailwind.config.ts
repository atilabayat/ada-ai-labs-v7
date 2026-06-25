import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          0: "var(--bg-0)",
          1: "var(--bg-1)",
          2: "var(--bg-2)",
          3: "var(--bg-3)",
          4: "var(--bg-4)",
        },
        ink: {
          0: "var(--ink-0)",
          1: "var(--ink-1)",
          2: "var(--ink-2)",
          3: "var(--ink-3)",
        },
        line: {
          DEFAULT: "var(--line)",
          strong: "var(--line-strong)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hot: "var(--accent-hot)",
          teal: "var(--accent-teal)",
          amber: "var(--accent-amber)",
          rose: "var(--accent-rose)",
          violet: "var(--accent-violet)",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-plex-sans)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        chipIn: {
          from: { transform: "scale(0.85)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        pageIn: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        logIn: {
          to: { opacity: "1" },
        },
      },
      animation: {
        pulse: "pulse 2s infinite",
        chipIn: "chipIn 0.25s ease-out",
        pageIn: "pageIn 0.25s ease-out",
        spin: "spin 0.8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
