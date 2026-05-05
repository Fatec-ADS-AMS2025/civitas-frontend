"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import SearchDrawer from "@/components/SearchDrawer";
import ThemeSwitcher from "@/components/theme/theme-switcher";
import { useAppNavigation } from "@/hooks/useNavigationProgress";
import { NAVIGATION_CATALOG } from "@/navigation/navigation.data";

const normalizePath = (path: string): string => {
  const trimmed = path.trim();
  const withoutTrailingSlash = trimmed.replace(/\/+$/, "");
  return withoutTrailingSlash || "/";
};

type SidebarProps = {
  onLogout?: () => void;
};

export default function Sidebar({ onLogout }: SidebarProps) {
  const { push } = useAppNavigation();
  const pathname = usePathname() || "/dashboard";
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = useMemo(
    () =>
      NAVIGATION_CATALOG.filter(
        (item) => item.path.startsWith("/dashboard") && item.key !== "perfil",
      ),
    [],
  );

  const profileItem = useMemo(
    () => NAVIGATION_CATALOG.find((item) => item.key === "perfil"),
    [],
  );

  const normalizedPath = normalizePath(pathname);

  const navigateToPath = (path: string) => {
    push(path);
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <div className="fixed inset-x-3 top-3 z-[115] sm:hidden">
        <div
          className="flex min-h-[56px] items-center justify-between gap-3 rounded-sm border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] px-3 py-2 text-[var(--sidebar-text)]"
          style={{ boxShadow: "var(--sidebar-shadow)" }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-sm bg-[var(--sidebar-option-bg)]">
              <img src="/logo.png" alt="Logo Civitas" className="size-full object-contain" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Civitas</p>
              <p className="truncate text-xs text-[var(--sidebar-muted)]">Painel administrativo</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-[var(--sidebar-option-border)] bg-[var(--sidebar-option-bg)] text-[var(--sidebar-text)] transition-colors duration-150 hover:bg-[var(--sidebar-option-hover-bg)]"
              aria-label="Buscar funcionalidades"
            >
              <span className="material-symbols-outlined !text-[20px]">search</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-[var(--sidebar-option-border)] bg-[var(--sidebar-option-bg)] text-[var(--sidebar-text)] transition-colors duration-150 hover:bg-[var(--sidebar-option-hover-bg)]"
              aria-label="Abrir menu"
            >
              <span className="material-symbols-outlined !text-[20px]">menu</span>
            </button>
          </div>
        </div>
      </div>

      <aside
        aria-label="Sidebar"
        className="group hidden h-[calc(100vh-1.5rem)] w-[78px] shrink-0 select-none flex-col justify-between overflow-hidden rounded-sm border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] transition-all duration-200 ease-out sm:fixed sm:left-3 sm:top-3 sm:z-[110] sm:flex sm:hover:w-[256px] sm:focus-within:w-[256px]"
        style={{ boxShadow: "var(--sidebar-shadow)" }}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-3 pb-3 pt-5">
          <div className="flex items-center justify-center gap-0 px-1 transition-all duration-200 sm:group-hover:justify-start sm:group-hover:gap-3 sm:group-focus-within:justify-start sm:group-focus-within:gap-3">
            <div className="flex h-10 w-11 items-center justify-center overflow-hidden rounded-sm bg-transparent">
              <img src="/logo.png" alt="Logo Civitas" className="size-full object-contain" />
            </div>
            <div className="font-title w-0 overflow-hidden whitespace-nowrap text-xl font-semibold text-[var(--sidebar-text)] opacity-0 transition-all duration-200 sm:group-hover:w-auto sm:group-hover:opacity-100 sm:group-focus-within:w-auto sm:group-focus-within:opacity-100">
              Civitas
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex w-full items-center justify-center gap-0 rounded-sm border border-[var(--sidebar-search-border)] bg-[var(--sidebar-search-bg)] px-3 py-2.5 text-left text-sm font-medium text-[var(--sidebar-search-text)] transition-all duration-150 hover:bg-[var(--sidebar-search-hover-bg)] sm:group-hover:justify-start sm:group-hover:gap-3 sm:group-focus-within:justify-start sm:group-focus-within:gap-3"
            aria-label="Buscar funcionalidades"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
            <span className="w-0 truncate whitespace-nowrap opacity-0 transition-all duration-200 sm:group-hover:w-auto sm:group-hover:opacity-100 sm:group-focus-within:w-auto sm:group-focus-within:opacity-100">
              Buscar funcionalidades
            </span>
          </button>

          <div className="sidebar-scroll-shell min-h-0 flex-1 overflow-hidden">
            <nav className="sidebar-scroll civitas-scrollbar flex h-full min-h-0 flex-col gap-1 overflow-y-auto pr-1.5">
              {navigationItems.map((item) => {
                const isActive = normalizePath(item.path) === normalizedPath;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navigateToPath(item.path)}
                    className={`flex w-full cursor-pointer items-center justify-center gap-0 rounded-sm px-3 py-2.5 text-left text-sm font-medium transition-all duration-150 sm:group-hover:justify-start sm:group-hover:gap-3 sm:group-focus-within:justify-start sm:group-focus-within:gap-3 ${
                      isActive
                        ? "bg-[var(--sidebar-nav-active-bg)] text-[var(--sidebar-nav-active-text)]"
                        : "text-[var(--sidebar-text)] hover:bg-[var(--sidebar-nav-hover-bg)]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {item.icon ?? "apps"}
                    </span>
                    <span className="w-0 truncate whitespace-nowrap opacity-0 transition-all duration-200 sm:group-hover:w-auto sm:group-hover:opacity-100 sm:group-focus-within:w-auto sm:group-focus-within:opacity-100">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <ThemeSwitcher />

        {profileItem ? (
          <div className="border-t border-[var(--sidebar-divider)] px-3 py-4">
            <div className="space-y-2">
              <button
                className="flex w-full items-center justify-center gap-0 rounded-sm bg-[var(--sidebar-profile-bg)] px-3 py-2.5 text-[var(--sidebar-profile-text)] transition-all duration-150 hover:bg-[var(--sidebar-profile-hover-bg)] sm:group-hover:justify-start sm:group-hover:gap-3 sm:group-focus-within:justify-start sm:group-focus-within:gap-3"
                onClick={() => push(profileItem.path)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    push(profileItem.path);
                  }
                }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[var(--sidebar-profile-icon-bg)] text-[var(--sidebar-profile-text)]">
                  <span className="material-symbols-outlined">{profileItem.icon ?? "person"}</span>
                </div>
                <div className="font-detail w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-200 sm:group-hover:w-auto sm:group-hover:opacity-100 sm:group-focus-within:w-auto sm:group-focus-within:opacity-100">
                  {profileItem.label}
                </div>
              </button>

              {onLogout ? (
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center justify-center gap-0 rounded-sm border border-[var(--sidebar-option-border)] bg-[var(--sidebar-option-bg)] px-3 py-2.5 text-[var(--sidebar-text)] transition-all duration-150 hover:bg-[var(--sidebar-option-hover-bg)] sm:group-hover:justify-start sm:group-hover:gap-3 sm:group-focus-within:justify-start sm:group-focus-within:gap-3"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  <span className="w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-200 sm:group-hover:w-auto sm:group-hover:opacity-100 sm:group-focus-within:w-auto sm:group-focus-within:opacity-100">
                    Sair
                  </span>
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </aside>

      <button
        type="button"
        aria-hidden={!isMobileMenuOpen}
        tabIndex={isMobileMenuOpen ? 0 : -1}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`fixed inset-0 z-[116] bg-[var(--search-drawer-overlay)] backdrop-blur-[1px] transition-opacity duration-200 sm:hidden ${
          isMobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="Menu de navegacao mobile"
        aria-hidden={!isMobileMenuOpen}
        className={`fixed inset-y-0 left-0 z-[117] flex w-full max-w-[340px] flex-col border-r border-[var(--search-drawer-border)] bg-[var(--search-drawer-bg)] shadow-2xl transition-transform duration-300 ease-out sm:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--search-drawer-divider)] px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
              Navegacao
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[var(--foreground)]">Civitas</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)]"
            aria-label="Fechar menu"
          >
            <span className="material-symbols-outlined !text-[20px]">close</span>
          </button>
        </div>

        <div className="civitas-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          <div className="grid gap-2">
            {navigationItems.map((item) => {
              const isActive = normalizePath(item.path) === normalizedPath;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    navigateToPath(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex min-h-[48px] items-center gap-3 rounded-sm border px-4 py-3 text-left text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? "border-[var(--border-accent-teal)] bg-[var(--surface-accent-teal)] text-[var(--text-accent-teal)]"
                      : "border-[var(--border-soft)] bg-[var(--surface-elevated)] text-[var(--foreground)] hover:bg-[var(--surface-subtle)]"
                  }`}
                >
                  <span className="material-symbols-outlined !text-[20px]">{item.icon ?? "apps"}</span>
                  <span className="flex-1">{item.label}</span>
                </button>
              );
            })}
          </div>

          <ThemeSwitcher variant="panel" />

          <div className="grid gap-2">
            {profileItem ? (
              <button
                type="button"
                onClick={() => {
                  push(profileItem.path);
                  setIsMobileMenuOpen(false);
                }}
                className="flex min-h-[48px] items-center gap-3 rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] px-4 py-3 text-left text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)]"
              >
                <span className="material-symbols-outlined !text-[20px]">{profileItem.icon ?? "person"}</span>
                <span className="flex-1">{profileItem.label}</span>
              </button>
            ) : null}

            {onLogout ? (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="civitas-action civitas-action--danger min-h-[48px] rounded-sm px-4"
              >
                <span className="material-symbols-outlined !text-[18px]">logout</span>
                Sair
              </button>
            ) : null}
          </div>
        </div>
      </aside>

      <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
