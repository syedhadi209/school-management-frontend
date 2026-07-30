"use client";

import { useEffect, useState } from "react";

type ThemePreset = "enterprise-teal" | "executive-navy" | "monochrome";

const STORAGE_KEY = "theme_preset";

function applyThemePreset(theme: ThemePreset) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
}

export function ThemePresetSwitcher() {
  const [preset, setPreset] = useState<ThemePreset>(() => {
    if (typeof window === "undefined") return "enterprise-teal";
    const saved = localStorage.getItem(STORAGE_KEY) as ThemePreset | null;
    if (saved && ["enterprise-teal", "executive-navy", "monochrome"].includes(saved)) {
      return saved;
    }
    return "enterprise-teal";
  });

  useEffect(() => {
    applyThemePreset(preset);
  }, [preset]);

  function onChange(next: ThemePreset) {
    setPreset(next);
    applyThemePreset(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="theme-preset" className="text-xs text-muted-foreground">
        Theme
      </label>
      <select
        id="theme-preset"
        value={preset}
        onChange={(event) => onChange(event.target.value as ThemePreset)}
        className="rounded-md border bg-background px-2 py-1 text-xs"
      >
        <option value="enterprise-teal">Enterprise Teal</option>
        <option value="executive-navy">Executive Navy</option>
        <option value="monochrome">Monochrome</option>
      </select>
    </div>
  );
}

