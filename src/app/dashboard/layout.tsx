"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

import { SidebarToggleContext } from "@/context/sidebar-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col h-screen overflow-y-auto">
        <SidebarToggleContext.Provider value={() => setSidebarOpen(true)}>
          {children}
        </SidebarToggleContext.Provider>
      </div>
    </div>
  );
}

