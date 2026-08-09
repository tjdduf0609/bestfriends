"use client";

import { useTheme, THEMES, ThemeName } from "@/lib/theme-context";
import { pillButtonStyle } from "@/lib/pillButtonStyle";
import { Sun, Moon } from "lucide-react";

const THEME_LABELS: Record<ThemeName, { label: string; swatch: string }> = {
  rosy: { label: "로지", swatch: "#FF6F91" },
  lavender: { label: "라벤더", swatch: "#8E7FE0" },
  mint: { label: "민트", swatch: "#2EC4B6" },
  peach: { label: "피치", swatch: "#FF9466" },
  sky: { label: "스카이", swatch: "#4FA9E8" },
};

export function ThemeSwitcher() {
  const { theme, setTheme, dark, setDark } = useTheme();

  return (
    <div>
      <p className="mb-3 text-sm font-bold text-card-muted">테마 색상</p>
      <div className="flex flex-wrap gap-2">
        {THEMES.map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            style={pillButtonStyle(theme === t)}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition"
          >
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: THEME_LABELS[t].swatch }} />
            {THEME_LABELS[t].label}
          </button>
        ))}
      </div>

      <p className="mb-3 mt-6 text-sm font-bold text-card-muted">화면 모드</p>
      <div className="flex gap-3">
        <button
          onClick={() => setDark(false)}
          style={pillButtonStyle(!dark)}
          className="flex flex-1 items-center justify-center gap-1 rounded-full py-2 text-sm font-bold"
        >
          <Sun className="h-4 w-4" /> 라이트
        </button>
        <button
          onClick={() => setDark(true)}
          style={pillButtonStyle(dark)}
          className="flex flex-1 items-center justify-center gap-1 rounded-full py-2 text-sm font-bold"
        >
          <Moon className="h-4 w-4" /> 다크
        </button>
      </div>
    </div>
  );
}