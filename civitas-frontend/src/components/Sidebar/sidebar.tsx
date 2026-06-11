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

const CATEGORY_ICONS: Record<string, string> = {
  Principal: "dashboard",
  Financeiro: "account_balance_wallet",
  Cadastros: "inventory_2",
  Administracao: "admin_panel_settings",
};

export default function Sidebar() {
  const { push } = useAppNavigation();
  const pathname = usePathname() || "/dashboard";
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const normalizedPath = normalizePath(pathname);

  const navigationItems = useMemo(
    () =>
      NAVIGATION_CATALOG.filter(
        (item) => item.path.startsWith("/dashboard") && item.key !== "perfil",
      ),
    [],
  );
  const navigationGroups = useMemo(() => {
    const groups = new Map<string, typeof navigationItems>();

    navigationItems.forEach((item) => {
      groups.set(item.category, [...(groups.get(item.category) ?? []), item]);
    });

    return Array.from(groups.entries()).map(([category, items]) => ({
      category,
      items,
    }));
  }, [navigationItems]);
  const activeCategory = useMemo(() => {
    return navigationItems.find((item) => normalizePath(item.path) === normalizedPath)?.category;
  }, [navigationItems, normalizedPath]);

  const profileItem = useMemo(
    () => NAVIGATION_CATALOG.find((item) => item.key === "perfil"),
    [],
  );

  useEffect(() => {
    if (!activeCategory) return;

    setExpandedGroups((current) => ({
      ...current,
      [activeCategory]: true,
    }));
  }, [activeCategory]);

  const navigateToPath = (path: string) => {
    push(path);
  };

  const toggleGroup = (category: string) => {
    setExpandedGroups((current) => {
      const currentValue =
        current[category] ?? (category === activeCategory || category === "Principal");

      return {
        ...current,
        [category]: !currentValue,
      };
    });
  };

  return (
    <>
      <aside
        aria-label="Sidebar"
        className="group hidden h-[calc(100vh-1.5rem)] w-[78px] shrink-0 select-none flex-col justify-between overflow-hidden rounded-sm border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] transition-all duration-200 ease-out sm:fixed sm:left-3 sm:top-3 sm:z-[110] sm:flex sm:hover:w-[256px]"
        style={{ boxShadow: "var(--sidebar-shadow)" }}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-3 pb-3 pt-5">
          <div className="flex items-center justify-center gap-0 px-1 transition-all duration-200 sm:group-hover:justify-start sm:group-hover:gap-3 sm:group-focus-within:justify-start sm:group-focus-within:gap-3">
            <div className="flex h-10 w-11 items-center justify-center overflow-hidden rounded-sm bg-transparent">
              <img src="/logo.png" alt="Logo Civitas" className="size-full object-contain" />
            </div>
            <div className="font-title w-0 overflow-hidden whitespace-nowrap text-xl font-semibold text-[var(--sidebar-text)] hidden transition-all duration-200 sm:group-hover:w-auto sm:group-hover:flex sm:group-focus-within:w-auto sm:group-focus-within:opacity-100">
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
            <nav className="sidebar-scroll group-hover:civitas-scrollbar flex h-full min-h-0 flex-col gap-1.5 group-hover:overflow-y-auto pr-1.5">
              {navigationGroups.map((group) => {
                const isExpanded =
                  expandedGroups[group.category] ??
                  (group.category === activeCategory || group.category === "Principal");
                const groupIcon = CATEGORY_ICONS[group.category] ?? "folder";

                return (
                  <section key={group.category} className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.category)}
                      aria-expanded={isExpanded}
                      className="flex w-full items-center justify-center gap-0 rounded-sm px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--sidebar-muted)] transition-all duration-150 hover:bg-[var(--sidebar-nav-hover-bg)] hover:text-[var(--sidebar-text)] sm:group-hover:justify-start sm:group-hover:gap-2 sm:group-focus-within:justify-start sm:group-focus-within:gap-2"
                    >
                      <span className="material-symbols-outlined text-[17px]" aria-hidden="true">
                        {groupIcon}
                      </span>
                      <span className="w-0 truncate whitespace-nowrap opacity-0 transition-all duration-200 sm:group-hover:w-auto sm:group-hover:flex-1 sm:group-hover:opacity-100 sm:group-focus-within:w-auto sm:group-focus-within:flex-1 sm:group-focus-within:opacity-100">
                        {group.category}
                      </span>
                      <span
                        className={`material-symbols-outlined hidden text-[16px] transition-transform duration-150 sm:group-hover:inline-flex sm:group-focus-within:inline-flex ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      >
                        expand_more
                      </span>
                    </button>

                    {isExpanded ? (
                      <div className="flex flex-col gap-0.5">
                        {group.items.map((item) => {
                          const isActive = normalizePath(item.path) === normalizedPath;

                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => navigateToPath(item.path)}
                              className={`flex w-full cursor-pointer items-center justify-center gap-0 rounded-sm px-3 py-2 text-left text-xs font-medium transition-all duration-150 sm:group-hover:justify-start sm:group-hover:gap-2.5 sm:group-focus-within:justify-start sm:group-focus-within:gap-2.5 ${
                                isActive
                                  ? "bg-[var(--sidebar-nav-active-bg)] text-[var(--sidebar-nav-active-text)]"
                                  : "text-[var(--sidebar-text)] hover:bg-[var(--sidebar-nav-hover-bg)]"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[18px] group-hover:pl-5 transition-all duration-150">
                                {item.icon ?? "apps"}
                              </span>
                              <span className="w-0 truncate whitespace-nowrap opacity-0 transition-all duration-200 sm:group-hover:w-auto sm:group-hover:opacity-100 sm:group-focus-within:w-auto sm:group-focus-within:opacity-100">
                                {item.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </nav>
          </div>
        </div>

        <ThemeSwitcher />

        {profileItem ? (
          <div className="border-t border-[var(--sidebar-divider)] px-3 py-4">
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
          </div>
        ) : null}
      </aside>

      <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
