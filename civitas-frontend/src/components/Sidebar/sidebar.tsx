"use client";

import React, { useMemo, useState } from "react";
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

export default function Sidebar() {
  const { push } = useAppNavigation();
  const pathname = usePathname() || "/dashboard";
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

<<<<<<< Updated upstream
  const navigateToPath = (path: string) => {
    push(path);
  };
=======
    if (item.onClick) {
      item.onClick();
      return;
    }

    if (item.href) {
      router.push(item.href);
      return;
    }

    router.push(`/${item.key}`);
  }

  useEffect(() => {
    const activeItem = defaultItems.find((item) => item.href === pathname);

    defaultItems.forEach((element) => {
      if (activeItem && activeItem.key === element.key) {
        element.active = true;
        return;
      } else {
        element.active = false;
      }
    });
  }, [pathname]);

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();

      const isTyping =
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        target?.isContentEditable;

      if (isTyping) return;

      switch (e.key) {
        case "1":
          e.preventDefault();
          router.push("/dashboard");
          break;
        case "2":
          e.preventDefault();
          router.push("/dashboard/secretaria");
          break;
        case "3":
          e.preventDefault();
          router.push("/dashboard/instituicoes");
          break;
        case "4":
          e.preventDefault();
          router.push("/dashboard/fornecedor");
          break;
        case "5":
          e.preventDefault();
          router.push("/dashboard/orcamentos");
          break;
        case "6":
          e.preventDefault();
          router.push("/dashboard/despesas");
          break;
        case "7":
          e.preventDefault();
          router.push("/dashboard/financeiro");
          break;
        case "8":
          e.preventDefault();
          router.push("/dashboard/configuracoes");
          break;
        case "9":
          e.preventDefault();
          router.push("/dashboard/usuarios");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [router]);
>>>>>>> Stashed changes

  return (
    <>
      <nav
        aria-label="Navegacao principal mobile"
        className="fixed bottom-0 left-0 right-0 z-[9997] border-t border-[var(--border)] bg-[var(--surface)] px-2 py-2 shadow-[0_-10px_24px_rgba(0,0,0,0.12)] sm:hidden"
      >
        <div className="flex gap-1 overflow-x-auto pb-1">
          {items.map((it) => {
            const isActive = it.href === pathname;

            return (
              <button
                key={it.key}
                type="button"
                onClick={() => handleNavigate(it)}
                className={`flex min-w-[70px] flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-[11px] font-semibold transition-colors ${
                  isActive
                    ? "bg-[var(--surface-soft)] text-[var(--secundary-1)]"
                    : "text-[var(--text-muted)]"
                }`}
                aria-current={isActive ? "page" : undefined}
                title={it.label}
              >
                <span className={`material-symbols-outlined ${isActive ? "filled" : ""} !text-[21px]`}>
                  {it.icon}
                </span>
                <span className="max-w-full truncate">{it.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

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
