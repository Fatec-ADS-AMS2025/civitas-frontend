"use client";

import React, { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NAVIGATION_CATALOG } from "@/navigation/navigation.data";

const normalizePath = (path: string): string => {
  const trimmed = path.trim();
  const withoutTrailingSlash = trimmed.replace(/\/+$/, "");
  return withoutTrailingSlash || "/";
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname() || "/dashboard";

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
    router.push(path);
  };

  return (
    <aside
      aria-label="Sidebar"
      className="group hidden h-[calc(100vh-2rem)] w-[76px] shrink-0 select-none flex-col justify-between overflow-hidden rounded-2xl bg-secundary-1 text-tertialy-1 transition-all duration-200 ease-out sm:fixed sm:left-4 sm:top-4 sm:z-[110] sm:flex sm:hover:w-[280px] sm:focus-within:w-[280px]"
      style={{ boxShadow: "0 6px 18px rgba(2, 22, 22, 0.45)" }}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4 px-3 pb-3 pt-6">
        <div className="flex items-center justify-center gap-0 px-1 transition-all duration-200 sm:group-hover:justify-start sm:group-hover:gap-3 sm:group-focus-within:justify-start sm:group-focus-within:gap-3">
          <div className="flex h-10 w-12 items-center justify-center overflow-hidden rounded-md bg-transparent">
            <img src="/logo.png" alt="Logo Civitas" className="size-full object-contain" />
          </div>
          <div className="font-title w-0 overflow-hidden whitespace-nowrap text-2xl font-semibold text-tertialy-1 opacity-0 transition-all duration-200 sm:group-hover:w-auto sm:group-hover:opacity-100 sm:group-focus-within:w-auto sm:group-focus-within:opacity-100">
            Civitas
          </div>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
          {navigationItems.map((item) => {
            const isActive = normalizePath(item.path) === normalizedPath;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigateToPath(item.path)}
                className={`flex w-full items-center justify-center gap-0 rounded-xl px-3 py-2 text-left text-sm font-semibold transition-all duration-150 sm:group-hover:justify-start sm:group-hover:gap-3 sm:group-focus-within:justify-start sm:group-focus-within:gap-3 ${
                  isActive
                    ? "bg-[#DDF0F2] text-[#003A42]"
                    : "text-[#D8EBEE] hover:bg-[#0B5A64]"
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

      {profileItem ? (
        <div className="px-3 py-6">
          <button
            className="flex w-full items-center justify-center gap-0 rounded-xl bg-tertialy-1 px-3 py-2 text-secundary-1 shadow-inner transition-all duration-150 hover:shadow-md sm:group-hover:justify-start sm:group-hover:gap-3 sm:group-focus-within:justify-start sm:group-focus-within:gap-3"
            onClick={() => router.push(profileItem.path)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                router.push(profileItem.path);
              }
            }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-secundary-1">
              <span className="material-symbols-outlined">{profileItem.icon ?? "person"}</span>
            </div>
            <div className="font-detail w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-200 sm:group-hover:w-auto sm:group-hover:opacity-100 sm:group-focus-within:w-auto sm:group-focus-within:opacity-100">
              {profileItem.label}
            </div>
          </button>
        </div>
      ) : null}
    </aside>
  );
}
