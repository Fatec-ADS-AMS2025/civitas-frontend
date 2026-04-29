"use client";

import React from "react";
import Sidebar from "@/components/Sidebar/sidebar";
import {
  DashboardHeaderProvider,
  DashboardPageHeader,
} from "@/components/dashboard/dashboard-header";
import { useAppNavigation } from '@/hooks/useNavigationProgress'


export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const { push } = useAppNavigation()
  return (
    <DashboardHeaderProvider>
      <div className="dashboard-shell flex min-h-screen w-full bg-[var(--surface-page)]">
        <Sidebar />
        <button 
          className="fixed right-8 top-5 bg-primary-2 px-4 py-2 rounded-sm text-white cursor-pointer z-[9997] flex justify-between gap-2 items-center justify-center"
          onClick={() => push('/login')}
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
