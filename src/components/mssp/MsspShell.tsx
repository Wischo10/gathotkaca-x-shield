"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/components/layout/SidebarToggle";

const NAVIGATION = [
  ["Overview", "/dashboard/mssp"], ["Clients", "/dashboard/mssp/clients"], ["Alerts & Incidents", "/dashboard/mssp/alerts"],
  ["Services", "/dashboard/mssp/services"], ["Reports", "/dashboard/mssp/reports"], ["Compliance", "/dashboard/mssp/compliance"],
  ["Tickets", "/dashboard/mssp/tickets"], ["Assets", "/dashboard/mssp/assets"], ["Account Management", "/dashboard/mssp/account-management"],
  ["Settings", "/dashboard/mssp/settings"],
] as const;

export function MsspShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const openSidebar = useSidebarToggle();
  const usesUnavailableClientScope = ["/dashboard/mssp/clients", "/dashboard/mssp/services", "/dashboard/mssp/reports", "/dashboard/mssp/compliance", "/dashboard/mssp/tickets", "/dashboard/mssp/assets", "/dashboard/mssp/account-management", "/dashboard/mssp/settings"].some((route) => pathname.startsWith(route));
  return <>
    <Topbar title="MSSP Portal" subtitle="Read-only security service visibility across integrated telemetry" onMenuClick={openSidebar} businessUnitFilterLabel={usesUnavailableClientScope ? "All Clients" : "Tenant filter unavailable"} businessUnitFilterDisabled />
    <div className="border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6"><nav className="flex gap-5 overflow-x-auto" aria-label="MSSP portal">
      {NAVIGATION.map(([label, href]) => { const active = href === "/dashboard/mssp" ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} className={`shrink-0 border-b-2 py-3 text-xs font-medium ${active ? "border-brand-blue text-brand-blue" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>{label}</Link>; })}
    </nav></div>
    <main className="flex-1 bg-slate-50 p-4 dark:bg-slate-950 sm:p-6">{children}</main>
  </>;
}
