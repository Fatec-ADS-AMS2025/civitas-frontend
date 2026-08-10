"use client";

import { useEffect, useRef, useState } from "react";
import { type ThemeMode, useTheme } from "@/components/theme/theme-provider";

const THEME_OPTIONS: Array<{ value: ThemeMode; label: string; icon: string }> = [
  { value: "system", label: "Sistema", icon: "desktop_windows" },
  { value: "light", label: "Claro", icon: "light_mode" },
  { value: "dark", label: "Escuro", icon: "dark_mode" },
];

export default function ThemeSwitcher() {
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = THEME_OPTIONS.find((o) => o.value === themeMode) ?? THEME_OPTIONS[0];

  const currentLabel =
    themeMode === "system" ? `Sistema (${resolvedTheme === "light" ? "Claro" : "Escuro"})` : current.label;

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (value: ThemeMode) => {
    setThemeMode(value);
    setOpen(false);
  };

  return (
    <section className="border-t border-[var(--sidebar-divider)] px-3 py-4">
      {/* Label — só visível quando sidebar expandida */}
      <p className="mb-2 hidden w-0 overflow-hidden truncate text-xs font-semibold uppercase tracking-wider text-[var(--sidebar-muted)] opacity-0 transition-all duration-200 sm:block sm:group-hover:w-auto sm:group-hover:opacity-100 sm:group-focus-within:w-auto sm:group-focus-within:opacity-100">
        Tema
      </p>

      <div ref={ref} className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center justify-center gap-0 rounded-sm border border-[var(--sidebar-option-border)] bg-[var(--sidebar-option-bg)] px-3 py-2.5 text-sm font-medium text-[var(--sidebar-text)] transition-all duration-150 hover:bg-[var(--sidebar-option-hover-bg)] sm:group-hover:justify-start sm:group-hover:gap-3 sm:group-focus-within:justify-start sm:group-focus-within:gap-3"
        >
          <span className="material-symbols-outlined shrink-0 text-[20px]">{current.icon}</span>

          {/* Conteúdo expandido */}
          <span className="flex w-0 min-w-0 items-center gap-2 overflow-hidden opacity-0 transition-all duration-200 sm:group-hover:w-full sm:group-hover:opacity-100 sm:group-focus-within:w-full sm:group-focus-within:opacity-100">
            <span className="flex-1 truncate text-left">{currentLabel}</span>
            <span
              className={`material-symbols-outlined shrink-0 text-[16px] text-[var(--sidebar-muted)] transition-transform duration-150 ${open ? "rotate-180" : ""}`}
            >
              expand_more
            </span>
          </span>
        </button>

        {/* Dropdown */}
        {open && (
          <ul
            aria-label="Selecionar tema"
            className="absolute bottom-full left-0 z-50 mb-1 w-full overflow-hidden rounded-sm border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] py-1 shadow-lg"
          >
            {THEME_OPTIONS.map((option) => {
              const isActive = option.value === themeMode;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleSelect(option.value)}
                    className={`flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors duration-100 ${
                      isActive
                        ? "bg-[var(--sidebar-nav-active-bg)] text-[var(--sidebar-nav-active-text)]"
                        : "text-[var(--sidebar-text)] hover:bg-[var(--sidebar-nav-hover-bg)]"
                    }`}
                  >
                    <span className="material-symbols-outlined shrink-0 text-[18px]">{option.icon}</span>
                    <span className="flex-1 text-left">{option.label}</span>
                    {isActive && <span className="material-symbols-outlined text-[16px]">check</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
