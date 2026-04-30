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
  const { isAuthenticated, isHydrated, logout } = useAuth();
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
          className="fixed right-8 top-5 bg-primary-2 px-4 py-2 rounded-sm text-white cursor-pointer z-[9997] flex justify-between gap-2 items-center justify-center"
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
