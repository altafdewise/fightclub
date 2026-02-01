import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "var(--accent)",
        accentSoft: "var(--accentSoft)",
        bg: "var(--bg)",
        panel: "var(--panel)",
        panelBorder: "var(--panelBorder)",
        text: "var(--text)",
        muted: "var(--muted)",
      },
      boxShadow: {
        glow: "0 10px 40px rgba(171, 36, 46, 0.35)",
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        marqueePause: "marquee 28s linear infinite paused",
        fadeUp: "fadeUp 0.8s ease forwards",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
