"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export type SidebarItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
};

interface SidebarProps {
  items?: SidebarItem[];
  activeKey?: string;
}

const IconHome = () => <span className="material-symbols-outlined">home</span>;
const IconPerson = () => (
  <span className="material-symbols-outlined">person</span>
);
const IconStylus = () => (
  <span className="material-symbols-outlined">stylus</span>
);
const IconApartment = () => (
  <span className="material-symbols-outlined">apartment</span>
);
const IconCorporate = () => (
  <span className="material-symbols-outlined">corporate_fare</span>
);
const IconMoney = () => (
  <span className="material-symbols-outlined">attach_money</span>
);
const IconRequestQuote = () => (
  <span className="material-symbols-outlined">request_quote</span>
);
const IconDashboard = () => (
  <span className="material-symbols-outlined">dashboard</span>
);
const IconPersonApron = () => (
  <span className="material-symbols-outlined">person_apron</span>
);
const IconHomeWork = () => (
  <span className="material-symbols-outlined">home_work</span>
);
const IconAssignment = () => (
  <span className="material-symbols-outlined">assignment</span>
);
const IconProfile = () => (
  <span className="material-symbols-outlined">person</span>
);
const IconGroup = () => (
  <span className="material-symbols-outlined">group</span>
);
const IconBalance = () => (
  <span className="material-symbols-outlined">account_balance</span>
);
const IconFlowChart = () => (
  <span className="material-symbols-outlined">flowchart</span>
);
const IconBox = () => <span className="material-symbols-outlined">box</span>;
const IconSell = () => <span className="material-symbols-outlined">sell</span>;
const IconMenu = () => <span className="material-symbols-outlined">menu</span>;
const IconClose = () => <span className="material-symbols-outlined">close</span>;

const defaultItems: SidebarItem[] = [
  { key: "home", label: "Home", icon: <IconHome />, href: "/dashboard" },
  {
    key: "secretaria",
    label: "Secretaria",
    icon: <IconBalance />,
    href: "/dashboard/secretaria",
  },
  {
    key: "instituicao",
    label: "Instituição",
    icon: <IconFlowChart />,
    href: "/dashboard/instituicoes",
  },
  {
    key: "fornecedor",
    label: "Fornecedor",
    icon: <IconBox />,
    href: "/dashboard/fornecedor",
  },
  {
    key: "orcamento",
    label: "Orçamento",
    icon: <IconRequestQuote />,
    href: "/dashboard/orcamento",
  },
  { key: "despesas", label: "Despesas", icon: <IconSell />, href: "/despesas" },
  {
    key: "usuarios",
    label: "Usuários",
    icon: <IconGroup />,
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

  return (
    <>
      {/* Desktop Sidebar - Vertical Left */}
      <aside
        aria-label="Sidebar"
        tabIndex={0}
        onFocus={() => setKeyboardExpanded(true)}
        onBlur={() => setKeyboardExpanded(false)}
        className="group hidden sm:flex flex-col justify-between items-stretch bg-secundary-1 text-tertialy-1 rounded-2xl overflow-hidden select-none transition-all 
                duration-200 ease-out w-18 hover:w-64 focus-within:w-64 h-[calc(100vh-2rem)] z-50 fixed left-4 top-4 shadow-2xl"
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
            <div className="ml-1 text-2xl font-semibold text-tertialy-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Civitas
            </div>
          </div>

          <nav className="flex flex-col gap-3">
            {items.map((it) => {
              const isActive = activeKey === it.key;
              return (
                <button
                  key={it.key}
                  onClick={() => handleNavigate(it)}
                  className={`group/item flex items-center gap-4 w-full px-3 py-2 rounded-md text-left transition-colors duration-150 outline-none cursor-pointer 
                    ${isActive
                      ? "text-white font-semibold underline decoration-2 underline-offset-4 decoration-white"
                      : " text-tertialy-1"
                    }`}>
                  <div
                    className={`${isActive
                      ? "text-white border-b-2 border-white pb-[2px]"
                      : "text-tertialy-1"
                      } flex-none`}
                  >
                    {it.icon}
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
              <IconProfile />
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Perfil
            </div>
          </button>
        </div>
      </aside>

      {/* Mobile Top Navigation */}
      <nav className="sm:hidden fixed top-0 left-0 right-0 bg-secundary-1 text-tertialy-1 z-50 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-8 rounded-md bg-transparent overflow-hidden flex-shrink-0">
              <img
                src="/logo.png"
                alt="Logo Civitas"
                className="object-contain size-full"
              />
            </div>
            <div className="text-lg font-semibold text-tertialy-1">
              Civitas
            </div>
          </div>

          {/* Menu Button */}
          <button
            onClick={() => setKeyboardExpanded(!keyboardExpanded)}
            className="p-2 rounded-md hover:bg-secundary-1/80 transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">
              {keyboardExpanded ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {keyboardExpanded && (
          <div className="border-t border-tertialy-1/20">
            <div className="px-4 py-2 space-y-1">
              {items.map((it) => {
                const isActive = activeKey === it.key;
                return (
                  <button
                    key={it.key}
                    onClick={() => {
                      handleNavigate(it);
                      setKeyboardExpanded(false);
                    }}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-left transition-colors duration-150 
                      ${isActive
                        ? "bg-tertialy-1/20 text-white font-semibold"
                        : "text-tertialy-1 hover:bg-tertialy-1/10"
                      }`}
                  >
                    <div className="flex-none">
                      {it.icon}
                    </div>
                    <div className="flex-1 text-sm">
                      {it.label}
                    </div>
                  </button>
                );
              })}
              
              {/* Profile Button */}
              <button
                onClick={() => {
                  router.push("/perfil");
                  setKeyboardExpanded(false);
                }}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-left transition-colors duration-150 text-tertialy-1 hover:bg-tertialy-1/10"
              >
                <div className="flex-none">
                  <IconProfile />
                </div>
                <div className="flex-1 text-sm">
                  Perfil
                </div>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
