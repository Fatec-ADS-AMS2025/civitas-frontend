"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from 'next/navigation'


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
    href: "/dashboard"
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
    href: "/dashboard/despesas"
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

  function handleNavigate(item: SidebarItem) {
    defaultItems.forEach(element => {
      if (item.key === element.key) {
        element.active = true;
        return;
      } else {
        element.active = false;
      }
    });
    //se item.onClick existir, execute
    if (item.onClick) {
      item.onClick();
      return;
    }
    //se houver href, use router para navegar
    if (item.href) {
      router.push(item.href);
      return;
    }
    //caso contrário, mapeia pela key
    router.push(`/${item.key}`);
  }

  const pathname = usePathname();

  useEffect(() => {
    console.log("Current pathname:", pathname);
    const activeItem = defaultItems.find(item => item.href === pathname);
    defaultItems.forEach(element => {
      if (activeItem && activeItem.key === element.key) {
        element.active = true;
        return;
      } else {
        element.active = false;
      }
    });
  }, []);

  return (
    <>
      <aside
        aria-label="Sidebar"
        className="group hidden sm:flex flex-col justify-between items-stretch bg-secundary-1 text-tertialy-1 rounded-2xl overflow-hidden select-none transition-all 
          duration-200 ease-out w-18 hover:w-64 h-[calc(100vh-2rem)] z-99 fixed left-4 top-4"
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
            <div className="ml-1 text-2xl font-semibold text-tertialy-1  opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Civitas
            </div>
          </div>

          <nav className="flex flex-col gap-3 transition-all duration-200">
            {items.map((it) => {
              const isActive = it.href === pathname;
              return (
                <button
                  key={it.key}
                  onClick={() => handleNavigate(it)}
                  className={`group/item flex items-center gap-4 w-full px-3 py-2 rounded-md text-left transition-colors duration-150 outline-none cursor-pointer group 
                    ${isActive
                      ? "text-white font-semibold underline decoration-2 underline-offset-4 decoration-white" //ativo
                      : " text-tertialy-1" // não ativo
                    }`}>

                  <div
                    className={`${isActive
                      ? "text-white border-b-2 border-white pb-[2px]"
                      : "text-tertialy-1"
                      } flex-none`}
                  >
                    {isActive ? (
                      <span className="material-symbols-outlined filled">{it.icon}</span>
                    ) : (
                      <span className="material-symbols-outlined">{it.icon}</span>
                    )}
                  </div>

                  <div
                    className={`flex-1 text-base truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                        ${isActive
                        ? "text-white opacity-100"
                        : "font-semibold"
                      }`}>
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
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-secundary-1">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Perfil
            </div>
          </button>
        </div>
      </aside>

      {/* mobile bottom bar */}
      {/* <nav className="sm:hidden fixed bottom-4 left-4 right-4 bg-secundary-1 rounded-2xl flex items-center justify-between px-4 py-2 text-teal-100 shadow-lg">
        {items.slice(0, 5).map((it) => (
          <button
            key={it.key}
            aria-label={it.label}
            onClick={() => handleNavigate(it)}
            className="flex flex-col items-center gap-1 text-xs w-full cursor-pointer"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              {it.icon}
            </div>
            <div className="truncate text-[11px]">{it.label}</div>
          </button>
        ))}
        <button
          className="flex flex-col items-center gap-1 text-xs w-full cursor-pointer"
          onClick={() => router.push("/perfil")}
          aria-label="Perfil"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <IconProfile />
          </div>
          <div className="truncate text-[11px]">Perfil</div>
        </button>
      </nav> */}
    </>
  );
}
