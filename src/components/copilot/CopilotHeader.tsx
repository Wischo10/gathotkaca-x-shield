"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CopilotHeaderProps {
  onMenuClick?: () => void;
  onOpenChatModal?: () => void;
}

export function CopilotHeader({ onMenuClick, onOpenChatModal }: CopilotHeaderProps) {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Security Analyst");
  const [userRole, setUserRole] = useState<string>("SOC L2");
  const [notificationCount] = useState<number>(3);

  useEffect(() => {
    // Attempt to load current active session user from existing auth API
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data?.user) {
          const u = data.data.user;
          if (u.fullName) setUserName(u.fullName);
          if (u.role) setUserRole(u.role.toUpperCase());
        }
      })
      .catch(() => {
        // Fallback gracefully
      });
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      {/* Left side: Title & Subtitle */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="rounded-md border border-slate-200 p-1.5 text-slate-500 lg:hidden dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            aria-label="Open navigation"
          >
            ☰
          </button>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
              AI Cyber Security
            </h1>
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
              v2.4
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            AI-powered security operations and intelligent threat defense
          </p>
        </div>
      </div>

      {/* Right side: Business Unit, Date Range, Notification Badge, User/Profile, AI Chat Assistant button */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs">
        {/* Business Unit selector */}
        <div className="relative">
          <select
            defaultValue="all"
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 shadow-2xs hover:border-slate-300 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">All Business Units</option>
            <option value="bu-fin">Finance & Treasury</option>
            <option value="bu-it">IT & Infrastructure</option>
            <option value="bu-eng">Engineering & DevOps</option>
            <option value="bu-hr">HR & Operations</option>
          </select>
        </div>

        {/* Date range selector */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>May 13 – May 19, 2025</span>
        </div>

        {/* Notification icon with badge */}
        <button
          className="relative rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          title="Security Notifications"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-2xs">
              {notificationCount}
            </span>
          )}
        </button>

        {/* User / Profile section */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1 shadow-2xs dark:border-slate-700 dark:bg-slate-800">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 font-bold text-[10px] text-white">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden flex-col text-left sm:flex">
            <span className="text-[11px] font-semibold leading-tight text-slate-800 dark:text-slate-200">
              {userName}
            </span>
            <span className="text-[9px] text-slate-400 leading-none">
              {userRole}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="ml-1 text-[10px] text-slate-400 hover:text-red-500"
            title="Sign out"
          >
            ✕
          </button>
        </div>

        {/* Primary button: AI Chat Assistant */}
        <button
          onClick={onOpenChatModal}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          <span>✨</span>
          <span>AI Chat Assistant</span>
        </button>
      </div>
    </header>
  );
}
