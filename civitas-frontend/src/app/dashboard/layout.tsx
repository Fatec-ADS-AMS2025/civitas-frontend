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
