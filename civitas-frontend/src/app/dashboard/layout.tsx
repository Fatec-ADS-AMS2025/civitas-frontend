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
<<<<<<< Updated upstream
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
=======
    <div className="dashboard-shell flex min-h-screen w-full bg-[var(--background)]">

      <Sidebar />

      <div
        ref={paiRef}
        data-contrast-target="content"
        className="w-full flex-1 pb-24 sm:ml-[92px] sm:pb-0 lg:pr-[78px] 2xl:pr-[86px]"
      >
        <div className="mx-auto w-full max-w-[1680px] pb-8 pl-4 pr-[68px] pt-5 sm:px-5 lg:px-8 lg:pt-6 2xl:px-10">
          <div className='mb-6 sm:mb-7'>
            <h1 className='text-[30px] font-bold capitalize text-[var(--secundary-1)] sm:text-[34px] lg:text-[38px]'>
              {currentMeta.title}
            </h1>

            <div className='mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1'>
              {parts.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => alterarPagina(index)}
                  className='cursor-pointer text-sm capitalize text-[var(--text-muted)] opacity-90 transition-colors duration-200 hover:text-[var(--secundary-1)] hover:opacity-100'
                >
                  {item}
                  {index < parts.length - 1 && <span className="px-1 text-[var(--text-subtle)]">/</span>}
                </button>
              ))}
>>>>>>> Stashed changes
            </div>
          </div>
        </div>
      </div>
    </DashboardHeaderProvider>

  );
}
