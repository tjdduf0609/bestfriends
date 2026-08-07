import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-soft": "var(--color-primary-soft)",
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
        "text-muted": "var(--color-text-muted)",
        border: "var(--color-border)",
      },
      borderRadius: {
        card: "var(--radius-card)",
      },
    },
  },
  plugins: [],
};

export default config;