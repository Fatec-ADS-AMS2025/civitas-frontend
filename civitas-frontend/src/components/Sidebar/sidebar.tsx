"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export type SidebarItem = {
  key: string;
  label: string;
  icon?: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
};

interface SidebarProps {
  items?: SidebarItem[];
  activeKey?: string;
}

const defaultItems: SidebarItem[] = [
  {
    key: "home",
    label: "Home",
    icon: "home",
    active: true,
    href: "/dashboard",
  },
  {
    key: "secretaria",
    label: "Secretaria",
    icon: "account_balance",
    active: false,
    href: "/dashboard/secretaria",
  },
  {
    key: "instituicao",
    label: "Instituição",
    icon: "flowchart",
    active: false,
    href: "/dashboard/instituicoes",
  },
  {
    key: "fornecedor",
    label: "Fornecedor",
    icon: "box",
    active: false,
    href: "/dashboard/fornecedor",
  },
  {
    key: "orcamento",
    label: "Orçamento",
    icon: "request_quote",
    active: false,
    href: "/dashboard/orcamentos",
  },
  {
    key: "despesas",
    label: "Despesas",
    icon: "sell",
    active: false,
    href: "/dashboard/despesas",
  },
  {
    key: "financeiro",
    label: "Financeiro",
    icon: "finance_mode",
    active: false,
    href: "/dashboard/financeiro",
  },
  {
    key: "configuracoes",
    label: "Configurações",
    icon: "tune",
    active: false,
    href: "/dashboard/configuracoes",
  },
  {
    key: "usuarios",
    label: "Usuários",
    icon: "group",
    active: false,
    href: "/dashboard/usuarios",
  },
];

export default function Sidebar({
  items = defaultItems,
  activeKey,
}: SidebarProps) {
  const [keyboardExpanded, setKeyboardExpanded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  function handleNavigate(item: SidebarItem) {
    defaultItems.forEach((element) => {
      if (item.key === element.key) {
        element.active = true;
        return;
      } else {
        element.active = false;
      }
    });

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
    console.log("Current pathname:", pathname);
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

  return (
    <>
      <aside
        aria-label="Sidebar"
        className="group hidden sm:flex flex-col justify-between items-stretch bg-secundary-1 text-tertialy-1 rounded-2xl overflow-hidden select-none transition-all 
          duration-200 ease-out w-[76px] xl:hover:w-56 2xl:hover:w-60 h-[calc(100vh-2rem)] z-99 fixed left-4 top-4"
        style={{ boxShadow: "0 6px 18px rgba(2, 22, 22, 0.45)" }}
      >
        <div className="pt-6 pb-4 px-3 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-10 rounded-md bg-transparent overflow-hidden flex-shrink-0">
              <img
                src="/logo.png"
                alt="Logo Civitas"
                className="object-contain size-full"
              />
            </div>
            <div className="ml-1 text-2xl font-semibold text-tertialy-1 opacity-0 xl:group-hover:opacity-100 transition-opacity duration-200">
              Civitas
            </div>
          </div>

          <nav className="flex flex-col gap-3 transition-all duration-200">
            {items.map((it, index) => {
              const isActive = it.href === pathname;
              const shortcutNumber = index + 1;

              return (
                <button
                  key={it.key}
                  onClick={() => handleNavigate(it)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleNavigate(it);
                    }
                  }}
                  title={`Atalho: ${shortcutNumber}`}
                  className={`group/item flex items-center gap-4 w-full px-3 py-2 rounded-md text-left transition-colors duration-150 outline-none cursor-pointer group
                    ${
                      isActive
                        ? "text-white font-semibold underline decoration-2 underline-offset-4 decoration-white"
                        : "text-tertialy-1"
                    }`}
                >
                  <div
                    className={`${
                      isActive
                        ? "text-white border-b-2 border-white pb-[2px]"
                        : "text-tertialy-1"
                    } flex-none`}
                  >
                    {isActive ? (
                      <span className="material-symbols-outlined filled">
                        {it.icon}
                      </span>
                    ) : (
                      <span className="material-symbols-outlined">
                        {it.icon}
                      </span>
                    )}
                  </div>

                  <div
                    className={`flex-1 text-base truncate opacity-0 xl:group-hover:opacity-100 transition-opacity duration-200
                      ${isActive ? "text-white opacity-100" : "font-semibold"}`}
                  >
                    {it.label}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="px-3 py-6">
          <button
            className="flex items-center gap-3 w-full rounded-2xl px-3 py-2 bg-tertialy-1 text-secundary-1 font-semibold shadow-inner hover:shadow-md transition-shadow duration-150 cursor-pointer"
            onClick={() => router.push("/perfil")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push("/perfil");
              }
            }}
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-secundary-1">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div className="opacity-0 xl:group-hover:opacity-100 transition-opacity duration-200">
              Perfil
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
