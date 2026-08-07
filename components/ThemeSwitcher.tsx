"use client";

import { useTheme, THEMES, ThemeName } from "@/lib/theme-context";

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
    <div className="rounded-card border border-border bg-surface p-5">
      <p className="mb-3 text-sm font-bold">테마 색상</p>
      <div className="flex flex-wrap gap-3">
        {THEMES.map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${
              theme === t ? "border-primary bg-primary-soft" : "border-border bg-surface"
            }`}
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: THEME_LABELS[t].swatch }}
            />
            {THEME_LABELS[t].label}
          </button>
        ))}
      </div>

      <p className="mb-3 mt-6 text-sm font-bold">화면 모드</p>
      <div className="flex gap-3">
        <button
          onClick={() => setDark(false)}
          className={`flex-1 rounded-full border py-2 text-sm font-bold ${
            !dark ? "border-primary bg-primary-soft" : "border-border bg-surface"
          }`}
        >
          ☀️ 라이트
        </button>
        <button
          onClick={() => setDark(true)}
          className={`flex-1 rounded-full border py-2 text-sm font-bold ${
            dark ? "border-primary bg-primary-soft" : "border-border bg-surface"
          }`}
        >
          🌙 다크
        </button>
      </div>
    </div>
  );
}