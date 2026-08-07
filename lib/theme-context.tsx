"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const THEMES = ["rosy", "lavender", "mint", "peach", "sky"] as const;
export type ThemeName = (typeof THEMES)[number];

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  dark: boolean;
  setDark: (d: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("rosy");
  const [dark, setDarkState] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("colorTheme") as ThemeName | null;
    const savedDark = localStorage.getItem("darkMode");
    if (savedTheme && THEMES.includes(savedTheme)) setThemeState(savedTheme);
    if (savedDark) setDarkState(savedDark === "true");
    else setDarkState(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", dark);
  }, [theme, dark]);

  const setTheme = (t: ThemeName) => {
    localStorage.setItem("colorTheme", t);
    setThemeState(t);
  };

  const setDark = (d: boolean) => {
    localStorage.setItem("darkMode", String(d));
    setDarkState(d);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, dark, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}