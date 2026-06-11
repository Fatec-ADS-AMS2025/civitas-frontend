"use client";

import React, { useEffect } from "react";
import Sidebar from "@/components/Sidebar/sidebar";
import {
  DashboardHeaderProvider,
  DashboardPageHeader,
} from "@/components/dashboard/dashboard-header";
import useAuth from "@/hooks/useAuth";
import { useAppNavigation } from "@/hooks/useNavigationProgress";


export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, isHydrated, logout, user } = useAuth();
  const { push, replace } = useAppNavigation();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      replace("/login");
    }
  }, [isAuthenticated, isHydrated, replace]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-page)]">
        <div className="civitas-surface px-5 py-4 text-sm font-medium text-[var(--foreground-muted)]">
          Carregando sessao...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardHeaderProvider>
      <div className="dashboard-shell flex min-h-screen w-full bg-[var(--surface-page)]">
        <Sidebar />
        <button 
          className="civitas-action civitas-action--primary fixed right-4 top-4 z-[9997] gap-2 px-4 py-2 sm:right-10 sm:top-5"
          onClick={() => {
            logout();
            push("/login");
          }}
        >
          Sair
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
        <div
          data-contrast-target="content"
          className="dashboard-content-region"
        >
          <div className="dashboard-content-shell">
            <div className="mb-4 flex items-center justify-between gap-3 sm:hidden">
              <button
                type="button"
                onClick={() => push("/dashboard/perfil")}
                className="min-w-0 flex-1 rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] px-3 py-2 text-left shadow-[var(--shadow-sm)]"
              >
                <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-[var(--secundary-1)]">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                  <span className="truncate">{user?.nome || "Meu Perfil"}</span>
                </span>
              </button>

              <button
                type="button"
                className="civitas-action civitas-action--primary shrink-0 gap-2 px-3 py-2"
                onClick={() => {
                  logout();
                  push("/login");
                }}
                aria-label="Sair"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
            <DashboardPageHeader />

            <div className="w-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    </DashboardHeaderProvider>

  );
}
