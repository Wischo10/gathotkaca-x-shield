"use client";

import { useRouter } from "next/navigation";

export function Topbar({
  title,
  subtitle,
  onMenuClick,
}: {
  title: string;
  subtitle: string;
  onMenuClick: () => void;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex items-start gap-3">
        <button
          onClick={onMenuClick}
          className="mt-1 rounded-md border border-slate-200 p-1.5 text-slate-500 lg:hidden dark:border-slate-700"
          aria-label="Open navigation"
        >
          ☰
        </button>
        <div>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-white sm:text-xl">
            {title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <select
          className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          defaultValue="all"
          aria-label="Business unit filter"
        >
          <option value="all">All Business Units</option>
        </select>
        <span className="rounded-md border border-slate-200 px-2 py-1.5 text-slate-600 dark:border-slate-700 dark:text-slate-300">
          Last 7 days
        </span>
        <button
          onClick={handleLogout}
          className="rounded-md border border-slate-200 px-2 py-1.5 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
