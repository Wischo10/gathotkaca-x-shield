"use client";

import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/app/dashboard/layout";
import { ReactNode } from "react";

interface CisoDetailHeaderProps {
  title: string;
  subtitle: string;
  badge?: string;
  action?: ReactNode;
}

export function CisoDetailHeader({
  title,
  subtitle,
  badge,
  action,
}: CisoDetailHeaderProps) {
  const openSidebar = useSidebarToggle();

  return (
    <>
      <Topbar
        title={title}
        subtitle={subtitle}
        onMenuClick={openSidebar}
      />
      <div className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/ciso"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <span>←</span>
              <span>Back to CISO Dashboard</span>
            </Link>

            <nav className="hidden items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 md:flex">
              <span>Dashboard</span>
              <span>/</span>
              <Link href="/dashboard/ciso" className="hover:underline">
                CISO
              </Link>
              <span>/</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {title}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {badge && (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                {badge}
              </span>
            )}
            {action}
          </div>
        </div>
      </div>
    </>
  );
}
