"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

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
        {/* Each page renders its own Topbar so the title/subtitle can vary;
            we pass the menu toggle down via context-free prop drilling by
            cloning is avoided — pages call <Topbar onMenuClick .../> directly. */}
        <SidebarToggleContext.Provider value={() => setSidebarOpen(true)}>
          {children}
        </SidebarToggleContext.Provider>
      </div>
    </div>
  );
}

import { SidebarToggleContext } from "./SidebarContext";
