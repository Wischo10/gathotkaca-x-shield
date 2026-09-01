"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Only "SOC Dashboard" is wired to real data in this milestone. The rest
// are present (matching the reference nav) but marked as not-yet-built —
// per the brief, we don't invent functionality for screens that haven't
// been implemented yet.
const NAV_ITEMS = [
  { label: "Executive Dashboard", href: "/dashboard/executive", enabled: true },
  { label: "CISO Dashboard", href: "/dashboard/ciso", enabled: true },
  { label: "SOC Dashboard", href: "/dashboard/soc", enabled: true },
  { label: "SOC L2 Console", href: "/dashboard/soc-l2", enabled: true },
  { label: "AI Cyber Security Copilot", href: "/dashboard/copilot", enabled: true },
  { label: "Vulnerability Dashboard", href: "/dashboard/vulnerability", enabled: true },
  {
    label: "Regulatory & Security Compliance Dashboard",
    href: "/dashboard/compliance",
    enabled: true,
  },
  { label: "Security Data & Integration Hub", href: "/dashboard/data-hub", enabled: true },
  { label: "MSSP Portal", href: "/dashboard/mssp", enabled: true },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform overflow-y-auto border-r border-slate-800 bg-brand-navy px-4 py-5 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-red font-bold text-white">
            X
          </div>
          <div>
            <p className="text-sm font-bold leading-none text-white">
              Gathotkaca X-Shield
            </p>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              Advanced AI Defense
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const content = (
              <span
                className={`flex items-center rounded-lg px-3 py-2 text-sm ${
                  active
                    ? "bg-brand-red/90 text-white"
                    : item.enabled
                    ? "text-slate-300 hover:bg-white/5 hover:text-white"
                    : "cursor-not-allowed text-slate-600"
                }`}
              >
                {item.label}
                {!item.enabled && (
                  <span className="ml-auto rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500">
                    Soon
                  </span>
                )}
              </span>
            );
            return item.enabled ? (
              <Link key={item.href} href={item.href} onClick={onClose}>
                {content}
              </Link>
            ) : (
              <div key={item.href} aria-disabled title="Not yet implemented">
                {content}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
