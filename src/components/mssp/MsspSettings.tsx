"use client";

import type { ReactNode } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { Panel } from "@/components/ui/Panel";
import type { MsspSettingsDemoData } from "@/types/mssp";

const ICONS = { uptime: "◴", users: "♙", roles: "◇", integrations: "⇄", keys: "⚿", audit: "▤" } as const;

export function MsspSettings({ platformVersion, demo }: { platformVersion: string; demo: MsspSettingsDemoData }) {
  const activeUsers = demo.users.filter((user) => user.status === "Active").length;
  const audit7Days = demo.auditEvents.filter((event) => Date.parse(demo.snapshotAt) - Date.parse(event.timestamp) <= 7 * 86_400_000).length;
  const kpis = [
    { title: "System Uptime", value: `${demo.uptimePercent.toFixed(2)}%`, icon: "uptime" as const, history: demo.uptimeHistory, source: "DEMO DATA" },
    { title: "Users", value: `${demo.users.length}`, icon: "users" as const, history: [6, 6, 7, 7, 8, demo.users.length], source: "DEMO DATA" },
    { title: "Roles", value: `${demo.roles.length}`, icon: "roles" as const, history: [5, 5, 6, 6, 7, demo.roles.length], source: "DEMO DATA" },
    { title: "Integrations", value: `${demo.integrations.length}`, icon: "integrations" as const, history: [5, 5, 5, 6, 6, demo.integrations.length], source: "REAL CAPABILITIES", note: "Known entries, not health" },
    { title: "Active API Keys", value: `${demo.apiAccess.activeApiKeys}`, icon: "keys" as const, history: [3, 3, 4, 4, 5, demo.apiAccess.activeApiKeys], source: "DEMO DATA" },
    { title: "Audit Logs (7 Days)", value: `${audit7Days}`, icon: "audit" as const, history: demo.auditHistory, source: "DEMO DATA" },
  ];
  return <div className="space-y-4">
    <header className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h1 className="text-xl font-semibold text-slate-800 dark:text-white">Settings</h1><Badge kind="mixed">Mixed: Real + Demo</Badge></div><p className="mt-1 text-sm text-slate-500">Real platform metadata with demo administrative configuration</p></div><p className="text-[10px] text-slate-400">Read-only · No configuration changes</p></header>
    <section className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">{kpis.map((item) => <Kpi key={item.title} {...item} />)}</section>
    <section className="grid items-stretch gap-4 xl:grid-cols-12">
      <div className="xl:col-span-4"><SystemConfiguration /></div>
      <div className="min-w-0 xl:col-span-4"><Integrations demo={demo} /></div>
      <div className="min-w-0 xl:col-span-4"><Users demo={demo} active={activeUsers} /></div>
    </section>
    <section className="grid items-stretch gap-4 xl:grid-cols-12">
      <div className="xl:col-span-4"><Roles demo={demo} /></div>
      <div className="min-w-0 xl:col-span-4"><Audit demo={demo} /></div>
      <div className="xl:col-span-4"><Notifications demo={demo} /></div>
    </section>
    <section className="grid items-stretch gap-4 xl:grid-cols-12">
      <div className="xl:col-span-2"><SystemInformation version={platformVersion} /></div>
      <div className="xl:col-span-3"><ApiAccess demo={demo} /></div>
      <div className="xl:col-span-3"><Storage demo={demo} /></div>
      <div className="xl:col-span-4"><Activities demo={demo} /></div>
    </section>
    <p className="text-[10px] text-slate-400">A valid signed session permits dashboard access only; this preview does not establish MSSP administrator authorization.</p>
  </div>;
}

function Kpi({ title, value, icon, history, source, note = "Deterministic preview trend" }: { title: string; value: string; icon: keyof typeof ICONS; history: number[]; source: string; note?: string }) {
  const delta = history.at(-1)! - history[0];
  return <article className="flex min-h-32 flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm text-brand-blue dark:bg-blue-950">{ICONS[icon]}</span><p className="text-[11px] font-semibold leading-4 text-slate-500">{title}</p></div><Badge kind={source === "DEMO DATA" ? "demo" : "real"}>{source}</Badge></div><div className="mt-2 grid grid-cols-[1fr_4rem] items-end gap-1"><div><p className="text-xl font-bold leading-none text-slate-800 dark:text-white">{value}</p><p className={`mt-1 text-[9px] ${delta >= 0 ? "text-emerald-600" : "text-rose-500"}`}>{delta >= 0 ? "↑" : "↓"} {Math.abs(delta).toFixed(title.includes("Uptime") ? 2 : 0)} <span className="text-slate-400">trend</span></p></div><div className="h-9"><ResponsiveContainer><LineChart data={history.map((point, index) => ({ index, point }))}><Line dataKey="point" stroke="#2563eb" strokeWidth={1.8} dot={false} /></LineChart></ResponsiveContainer></div></div><p className="mt-auto pt-1 text-[8px] text-slate-400">{note}</p></article>;
}

function SystemConfiguration() {
  const rows = [
    ["General Settings", "UNKNOWN", "No authoritative settings registry", "unknown"],
    ["Authentication", "CONFIGURED", "Signed-session authentication", "real"],
    ["Security Settings", "UNKNOWN", "No administrative policy registry", "unknown"],
    ["Data Retention", "UNKNOWN", "No authoritative retention registry", "unknown"],
    ["Backup & Recovery", "DEMO", "Operational preview only", "demo"],
  ] as const;
  return <Panel title="System Configuration" action={<Badge kind="mixed">Real + Unknown</Badge>}><div className="divide-y divide-slate-100 dark:divide-slate-800">{rows.map(([name, state, detail, kind]) => <div key={name} className="flex items-start justify-between gap-2 py-2.5"><div><p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{name}</p><p className="mt-0.5 text-[9px] leading-4 text-slate-400">{detail}</p></div><Badge kind={kind}>{state}</Badge></div>)}</div></Panel>;
}
function Integrations({ demo }: { demo: MsspSettingsDemoData }) { return <Panel title="Integrations & Connections" action={<Badge kind="unknown">Health Unknown</Badge>}><Table heads={["Capability", "State", "Health"]}>{demo.integrations.map((item) => <tr key={item.name}><Cell strong>{item.name}<small className="block truncate font-normal text-slate-400">{item.type}</small></Cell><Cell><Badge kind={item.state === "AVAILABLE" ? "real" : "unknown"}>{item.state}</Badge></Cell><Cell><Badge kind="unknown">{item.health}</Badge><small className="mt-1 block text-slate-400">Checked: No</small></Cell></tr>)}</Table><Note>Known repository capabilities only · No runtime health check</Note></Panel>; }
function Users({ demo, active }: { demo: MsspSettingsDemoData; active: number }) { return <Panel title="User Management" action={<Badge kind="demo">Demo Data</Badge>}><div className="mb-3 grid grid-cols-3 gap-2">{[["Total", demo.users.length], ["Active", active], ["Inactive", demo.users.length - active]].map(([label, value]) => <Mini key={label} label={String(label)} value={String(value)} />)}</div><Table heads={["User", "Role", "Status", "Last Login"]}>{demo.users.slice(0, 6).map((user) => <tr key={user.id}><Cell strong>{user.displayName}<small className="block truncate font-normal text-slate-400">{user.emailAlias}</small></Cell><Cell>{demo.roles.find((role) => role.id === user.roleId)?.name}</Cell><Cell><Badge kind={user.status === "Active" ? "configured" : "unknown"}>{user.status}</Badge></Cell><Cell>{user.lastLoginAt ? dateTime(user.lastLoginAt) : "Never"}</Cell></tr>)}</Table><Note>{demo.users.length} synthetic users · Read-only preview</Note></Panel>; }
function Roles({ demo }: { demo: MsspSettingsDemoData }) { return <Panel title="Roles & Permissions" action={<Badge kind="demo">Demo Data</Badge>}><div className="divide-y divide-slate-100 dark:divide-slate-800">{demo.roles.map((role) => <div key={role.id} className="grid grid-cols-[1fr_auto] gap-2 py-2"><div><p className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">{role.name}</p><p className="text-[8px] text-slate-400">{role.description}</p></div><span className="text-[9px] text-slate-500">{demo.users.filter((user) => user.roleId === role.id).length} users</span></div>)}</div></Panel>; }
function Audit({ demo }: { demo: MsspSettingsDemoData }) { return <Panel title="Audit Log" action={<Badge kind="demo">Demo Data</Badge>}><Table heads={["Time", "Actor", "Action", "Resource"]}>{demo.auditEvents.slice(0, 7).map((event) => <tr key={event.id}><Cell>{dateTime(event.timestamp)}</Cell><Cell strong>{event.actor}</Cell><Cell>{event.action}</Cell><Cell>{event.resource}</Cell></tr>)}</Table><Note>No IP addresses or operational audit records</Note></Panel>; }
function Notifications({ demo }: { demo: MsspSettingsDemoData }) { return <Panel title="Notification Settings" action={<Badge kind="demo">Demo Preview</Badge>}><div className="grid grid-cols-[1fr_auto_auto] border-b border-slate-100 pb-2 text-[9px] font-semibold text-slate-400 dark:border-slate-800"><span>Notification</span><span>Email</span><span className="ml-4">In-App</span></div><div className="divide-y divide-slate-100 dark:divide-slate-800">{demo.notifications.map((item) => <div key={item.name} className="grid grid-cols-[1fr_auto_auto] items-center py-2.5 text-[10px]"><span className="text-slate-600 dark:text-slate-300">{item.name}</span><Toggle on={item.email} /><span className="ml-4"><Toggle on={item.inApp} /></span></div>)}</div><Note>Visual preferences only · Disabled and not persisted</Note></Panel>; }

function SystemInformation({ version }: { version: string }) { return <Panel title="System Information" action={<Badge kind="mixed">Mixed</Badge>}><Info label="Platform Version" value={version} kind="real" /><Info label="Build Identifier" value="N/A" /><Info label="Database Version" value="N/A" /><Info label="Deployment Environment" value="N/A" /><Info label="Server Region" value="N/A" /><Info label="Support Contact" value="N/A" /><Note>Version derived from application package metadata</Note></Panel>; }
function ApiAccess({ demo }: { demo: MsspSettingsDemoData }) { return <Panel title="API & Access Management" action={<Badge kind="demo">Demo Data</Badge>}><div className="grid grid-cols-3 gap-2"><Mini label="API Keys" value={String(demo.apiAccess.apiKeys)} detail={`${demo.apiAccess.activeApiKeys} active`} /><Mini label="Webhook Endpoints" value={String(demo.apiAccess.webhookEndpoints)} detail="metadata only" /><Mini label="Trusted IP Rules" value={String(demo.apiAccess.trustedIpRules)} detail="counts only" /></div><Note>No key values, tokens, endpoints, or IP rules are displayed</Note></Panel>; }
function Storage({ demo }: { demo: MsspSettingsDemoData }) { return <Panel title="Data & Storage" action={<Badge kind="demo">Demo Data</Badge>}><Info label="Storage Used" value={demo.storage.storageUsed} kind="demo" /><div className="mb-2 h-1.5 overflow-hidden rounded bg-slate-100 dark:bg-slate-800"><div className="h-full bg-blue-500" style={{ width: `${demo.storage.storageUsedPercent}%` }} /></div><Info label="Log Storage (7 Days)" value={demo.storage.logStorage7Days} kind="demo" /><Info label="Backups (30 Days)" value={String(demo.storage.backups30Days)} kind="demo" /><Info label="Last Backup" value={dateTime(demo.storage.lastBackupAt)} kind="demo" /></Panel>; }
function Activities({ demo }: { demo: MsspSettingsDemoData }) { return <Panel title="Recent System Activities" action={<Badge kind="demo">Demo Data</Badge>}><div className="divide-y divide-slate-100 dark:divide-slate-800">{demo.activities.map((item) => <div key={item.id} className="flex gap-2 py-2.5"><i className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" /><div><p className="text-[10px] font-medium text-slate-600 dark:text-slate-300">{item.activity}</p><p className="mt-0.5 text-[8px] text-slate-400">{dateTime(item.timestamp)}</p></div></div>)}</div></Panel>; }

function Table({ heads, children }: { heads: string[]; children: ReactNode }) { return <div className="overflow-x-auto"><table className="w-full text-left text-[9px]"><thead className="border-b border-slate-200 text-slate-400 dark:border-slate-800"><tr>{heads.map((head) => <th key={head} className="whitespace-nowrap px-1.5 py-2 font-semibold first:pl-0">{head}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{children}</tbody></table></div>; }
function Cell({ children, strong = false }: { children: ReactNode; strong?: boolean }) { return <td className={`max-w-32 px-1.5 py-2 first:pl-0 ${strong ? "font-medium text-slate-600 dark:text-slate-300" : "text-slate-500"}`}>{children}</td>; }
function Mini({ label, value, detail }: { label: string; value: string; detail?: string }) { return <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60"><p className="text-[8px] text-slate-400">{label}</p><p className="mt-1 text-lg font-bold text-slate-700 dark:text-slate-200">{value}</p>{detail && <p className="text-[8px] text-slate-400">{detail}</p>}</div>; }
function Info({ label, value, kind = "unknown" }: { label: string; value: string; kind?: BadgeKind }) { return <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2 py-2 text-[9px] dark:bg-slate-800/60"><span className="text-slate-500">{label}</span><span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">{value}<Badge kind={kind}>{kind === "unknown" ? "Unknown" : kind === "real" ? "Real" : "Demo"}</Badge></span></div>; }
function Toggle({ on }: { on: boolean }) { return <span aria-label={`Demo preference ${on ? "enabled" : "disabled"}`} className={`relative inline-flex h-4 w-7 rounded-full opacity-70 ${on ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-700"}`}><i className={`absolute top-0.5 h-3 w-3 rounded-full bg-white ${on ? "left-3.5" : "left-0.5"}`} /></span>; }
function Note({ children }: { children: ReactNode }) { return <p className="mt-3 border-t border-slate-100 pt-2 text-[8px] leading-4 text-slate-400 dark:border-slate-800">{children}</p>; }
type BadgeKind = "real" | "demo" | "unknown" | "configured" | "mixed";
function Badge({ kind, children }: { kind: BadgeKind; children: ReactNode }) { const style: Record<BadgeKind, string> = { real: "bg-blue-50 text-blue-600 dark:bg-blue-950", demo: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300", unknown: "bg-slate-100 text-slate-500 dark:bg-slate-800", configured: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300", mixed: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300" }; return <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-wide ${style[kind]}`}>{children}</span>; }
function dateTime(value: string) { return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value)); }
