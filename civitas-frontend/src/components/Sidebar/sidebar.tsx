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
const IconPerson = () => <span className="material-symbols-outlined">person</span>;
const IconStylus = () => <span className="material-symbols-outlined">stylus</span>;
const IconApartment = () => <span className="material-symbols-outlined">apartment</span>;
const IconCorporate = () => <span className="material-symbols-outlined">corporate_fare</span>;
const IconMoney = () => <span className="material-symbols-outlined">attach_money</span>;
const IconRequestQuote = () => <span className="material-symbols-outlined">request_quote</span>;
const IconDashboard = () => <span className="material-symbols-outlined">dashboard</span>;
const IconPersonApron = () => <span className="material-symbols-outlined">person_apron</span>;
const IconHomeWork = () => <span className="material-symbols-outlined">home_work</span>;
const IconAssignment = () => <span className="material-symbols-outlined">assignment</span>;
const IconProfile = () => <span className="material-symbols-outlined">person</span>;

const defaultItems: SidebarItem[] = [
    { key: "home", label: "Home", icon: <IconHome />, href: "/" },
    { key: "secretaria", label: "Secretaria", icon: <IconPerson />, href: "/secretaria" },
    { key: "instituicao", label: "Instituição", icon: <IconStylus />, href: "/instituicao" },
    { key: "fornecedor", label: "Fornecedor", icon: <IconApartment />, href: "/fornecedor" },
    { key: "orcamento", label: "Orçamento", icon: <IconCorporate />, href: "/orcamento" },
    { key: "despesas", label: "Despesas", icon: <IconMoney />, href: "/despesas" },
    { key: "usuarios", label: "Usuários", icon: <IconRequestQuote />, href: "/usuarios" },
];

export default function Sidebar({ items = defaultItems, activeKey }: SidebarProps) {
    const [keyboardExpanded, setKeyboardExpanded] = useState(false);
    const router = useRouter();

    function handleNavigate(item: SidebarItem) {
        // se item.onClick existir, execute (é client-side)
        if (item.onClick) {
            item.onClick();
            return;
        }
        // se houver href, use router para navegar
        if (item.href) {
            router.push(item.href);
            return;
        }
        // caso contrário, você pode mapear pela key
        router.push(`/${item.key}`);
    }

    return (
        <>
            <aside
                aria-label="Sidebar"
                tabIndex={0}
                onFocus={() => setKeyboardExpanded(true)}
                onBlur={() => setKeyboardExpanded(false)}
                className="group hidden sm:flex flex-col justify-between items-stretch bg-[#004C57] text-teal-100 rounded-2xl overflow-hidden select-none transition-all duration-200 ease-out w-14 hover:w-64 focus-within:w-64 h-screen fixed left-4 top-4 bottom-4"
                style={{ boxShadow: "0 6px 18px rgba(2, 22, 22, 0.45)" }}
            >
                <div className="pt-6 pb-4 px-3 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-md bg-transparent overflow-hidden">
                            <img
                                src="/logo.png"
                                alt="Logo Civitas"
                                className="object-contain w-full h-full"
                            />
                        </div>
                        <div className="ml-1 text-2xl font-semibold text-teal-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            Civitas
                        </div>
                    </div>

                    <nav className="flex flex-col gap-3 mt-4">
                        {items.map((it) => {
                            const isActive = activeKey === it.key;
                            return (
                                <button
                                    key={it.key}
                                    onClick={() => handleNavigate(it)}
                                    className={`group/item flex items-center gap-4 w-full px-3 py-2 rounded-md text-left hover:bg-[#0f6b6b] focus:bg-[#0f6b6b] transition-colors duration-150 outline-none ${isActive ? "bg-[#0f6b6b]" : ""
                                        }`}
                                >
                                    <div className="text-teal-100 flex-none">{it.icon}</div>
                                    <div className="flex-1 text-base font-semibold text-teal-100 truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        {it.label}
                                        {isActive && <div className="h-0.5 bg-teal-200 w-10 mt-1 rounded-sm" />}
                                    </div>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="px-3 py-6">
                    <button
                        className="flex items-center gap-3 w-full rounded-2xl px-3 py-2 bg-[#CAE9E9] text-[#174b4b] font-semibold shadow-inner hover:shadow-md transition-shadow duration-150"
                        onClick={() => router.push("/perfil")}
                    >
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#174b4b]">
                            <IconProfile />
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">Perfil</div>
                    </button>
                </div>
            </aside>

            {/* mobile bottom bar */}
            <nav className="sm:hidden fixed bottom-4 left-4 right-4 bg-[#0c4c4c] rounded-2xl flex items-center justify-between px-4 py-2 text-teal-100 shadow-lg">
                {items.slice(0, 5).map((it) => (
                    <button
                        key={it.key}
                        aria-label={it.label}
                        onClick={() => handleNavigate(it)}
                        className="flex flex-col items-center gap-1 text-xs w-full"
                    >
                        <div className="w-6 h-6">{it.icon}</div>
                        <div className="truncate text-[11px]">{it.label}</div>
                    </button>
                ))}
                <button className="flex flex-col items-center gap-1 text-xs w-full" onClick={() => router.push("/perfil")} aria-label="Perfil">
                    <div className="w-6 h-6">
                        <IconProfile />
                    </div>
                    <div className="truncate text-[11px]">Perfil</div>
                </button>
            </nav>
        </>
    );
}
