import type { CSSProperties } from "react";

export function pillButtonStyle(active: boolean): CSSProperties {
  return active
    ? { backgroundColor: "var(--color-primary)", color: "#ffffff" }
    : { backgroundColor: "var(--color-primary-soft)", color: "var(--color-text)" };
}