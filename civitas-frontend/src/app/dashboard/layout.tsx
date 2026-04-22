"use client";

import React from "react";
import Sidebar from "@/components/Sidebar/sidebar";
import {
  DashboardHeaderProvider,
  DashboardPageHeader,
} from "@/components/dashboard/dashboard-header";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardHeaderProvider>
      <div className="dashboard-shell flex min-h-screen w-full bg-[var(--surface-page)]">
        <Sidebar />

        <div
          data-contrast-target="content"
          className="w-full flex-1 sm:ml-[92px] lg:pr-[78px] 2xl:pr-[86px]"
        >
          <div className="mx-auto w-full max-w-[1680px] px-4 pb-8 pt-5 sm:px-5 lg:px-8 lg:pt-6 2xl:px-10">
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
