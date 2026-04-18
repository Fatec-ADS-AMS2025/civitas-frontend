"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar/sidebar";
import { useRouter } from "next/navigation";
import { resolveNavigationMeta } from "@/navigation/navigation.data";
import SearchDrawer from "@/components/SearchDrawer";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname() || "/dashboard";
  const currentMeta = resolveNavigationMeta(pathname);
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchDrawerOpen(true);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const alterarPagina = (targetPath: string) => {
    router.push(targetPath);
  };

  return (
    <div className="dashboard-shell flex min-h-screen w-full bg-[#F8FAFA]">
      <Sidebar />
      <SearchDrawer
        isOpen={isSearchDrawerOpen}
        onClose={() => setIsSearchDrawerOpen(false)}
      />

      <div
        data-contrast-target="content"
        className="relative z-0 w-full flex-1 sm:ml-[92px] lg:pr-[78px] 2xl:pr-[86px]"
      >
        <div className="mx-auto w-full max-w-[1680px] px-4 pb-8 pt-5 sm:px-5 lg:px-8 lg:pt-6 2xl:px-10">
          <div className="mb-6 flex items-start justify-between gap-4 sm:mb-7">
            <div>
              <h1 className="font-title text-[30px] font-bold capitalize text-[#004D4D] sm:text-[34px] lg:text-[38px]">
                {currentMeta.title}
              </h1>

              <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1">
                {currentMeta.breadcrumbs.map((item, index) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => alterarPagina(item.path)}
                    className="font-detail cursor-pointer text-sm capitalize text-[#718089] opacity-90 transition-colors duration-200 hover:text-[#004D4D] hover:opacity-100"
                  >
                    {item.label}
                    {index < currentMeta.breadcrumbs.length - 1 && (
                      <span className="px-1 text-[#9AA8B0]">/</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSearchDrawerOpen(true)}
              className="font-detail inline-flex items-center gap-2 rounded-xl border border-[#D7E5E8] bg-white px-3 py-2 text-sm font-semibold text-[#23404A] shadow-sm transition-colors hover:bg-[#F5FAFB]"
              aria-label="Abrir painel de busca"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
              <span>Buscar</span>
              <span className="rounded-md bg-[#EEF5F6] px-1.5 py-0.5 text-[11px] text-[#547480]">
                Ctrl+K
              </span>
            </button>
          </div>

          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
