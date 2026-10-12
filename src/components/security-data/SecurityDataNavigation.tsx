"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  ["Data Overview", "/dashboard/data-hub"],
  ["Data Sources", "/dashboard/data-hub/data-sources"],
  ["Integrations", "/dashboard/data-hub/integrations"],
  ["Data Quality", "/dashboard/data-hub/data-quality"],
  ["Use Cases & Analytics", "/dashboard/data-hub/analytics"],
  ["Data Explorer", "/dashboard/data-hub/explorer"],
  ["Settings", "/dashboard/data-hub/settings"],
] as const;

export function SecurityDataNavigation() {
  const pathname = usePathname();

  return (
    <div className="flex gap-4 overflow-x-auto">
      {tabs.map(([label, href]) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap pb-2 text-sm font-medium ${active ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500"}`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
