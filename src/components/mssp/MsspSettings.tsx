import type { ReactNode } from "react";
import { Panel } from "@/components/ui/Panel";

const KPI_ITEMS = [
  { title: "System Uptime", reason: "Platform uptime monitoring not configured", icon: "uptime" },
  { title: "Users", reason: "User management source not configured", icon: "users" },
  { title: "Roles", reason: "Role management source not configured", icon: "roles" },
  { title: "Integrations", reason: "Integration registry not configured", icon: "integrations" },
  { title: "Active API Keys", reason: "API key management not configured", icon: "keys" },
  { title: "Audit Logs (7 Days)", reason: "Platform audit logging not configured", icon: "audit" },
] as const;

const INTEGRATIONS = [
  ["Wazuh Manager", "Security telemetry provider"],
  ["Wazuh / OpenSearch", "Security analytics provider"],
  ["Bitdefender", "Endpoint incident provider"],
  ["AbuseIPDB", "Threat intelligence provider"],
  ["PostgreSQL", "Application persistence capability"],
  ["Incident Ticketing", "Fail-closed demo-capable provider"],
] as const;

export function MsspSettings({ platformVersion }: { platformVersion: string }) {
  return <div className="space-y-4">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="text-xl font-semibold text-slate-800 dark:text-white">Settings</h1><p className="mt-1 text-sm text-slate-500">Platform configuration, integrations, access, and operational capability visibility.</p></div>
      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900">Read-only platform settings overview</span>
    </header>

    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">{KPI_ITEMS.map((item) => <SettingsKpiCard key={item.title} {...item} />)}</section>

    <section className="grid auto-rows-fr gap-4 xl:grid-cols-12">
      <div className="xl:col-span-4"><SystemConfigurationPanel /></div>
      <div className="min-w-0 xl:col-span-4"><IntegrationsPanel /></div>
      <div className="xl:col-span-4"><UnavailablePanel title="User Management" reason="User management source not configured" /></div>
    </section>

    <section className="grid auto-rows-fr gap-4 xl:grid-cols-12">
      <div className="xl:col-span-4"><UnavailablePanel title="Roles & Permissions" reason="Role and permission management not configured" /></div>
      <div className="xl:col-span-4"><AuditLogPanel /></div>
      <div className="xl:col-span-4"><UnavailablePanel title="Notification Settings" reason="Notification preference source not configured" /></div>
    </section>

    <section className="grid auto-rows-fr gap-4 xl:grid-cols-12">
      <div className="xl:col-span-3"><SystemInformationPanel platformVersion={platformVersion} /></div>
      <div className="xl:col-span-3"><AccessManagementPanel /></div>
      <div className="xl:col-span-3"><DataStoragePanel /></div>
      <div className="xl:col-span-3"><UnavailablePanel title="Recent System Activities" reason="System activity source not configured" compact /></div>
    </section>

    <p className="text-[10px] text-slate-400">A valid signed session permits dashboard access only; it does not establish MSSP administrator authorization.</p>
  </div>;
}

function SettingsKpiCard({ title, reason, icon }: { title: string; reason: string; icon: IconName }) {
  return <article className="flex min-h-32 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><SettingsIcon name={icon} /><p className="text-xs font-semibold leading-4 text-slate-500">{title}</p></div><StateBadge state="na" /></div><p className="mt-3 text-2xl font-bold text-slate-800 dark:text-white">N/A</p><p className="mt-auto pt-2 text-[10px] leading-4 text-slate-400">{reason}</p></article>;
}

function SystemConfigurationPanel() {
  const rows = [
    ["General Settings", "N/A", "Platform settings registry not configured", "na"],
    ["Authentication", "Configured", "Signed-session authentication", "configured"],
    ["Security Settings", "N/A", "Administrative security settings not configured", "na"],
    ["Data Retention", "N/A", "Retention policy source not configured", "na"],
    ["Backup & Recovery", "N/A", "Backup management source not configured", "na"],
  ] as const;
  return <Panel title="System Configuration" action={<ReadOnlyBadge />}><div className="divide-y divide-slate-100 dark:divide-slate-800">{rows.map(([name, value, detail, state]) => <div key={name} className="flex items-start justify-between gap-3 py-2.5"><div><p className="text-xs font-medium text-slate-600 dark:text-slate-300">{name}</p><p className="mt-0.5 text-[10px] leading-4 text-slate-400">{detail}</p></div><StateBadge state={state} label={value} /></div>)}</div></Panel>;
}

function IntegrationsPanel() {
  return <Panel title="Integrations & Connections" action={<StateBadge state="unknown" label="Health Unknown" />}><div className="overflow-x-auto"><table className="w-full min-w-[480px] text-left text-[10px]"><thead className="border-b border-slate-200 text-slate-400 dark:border-slate-800"><tr><TableHead>Integration</TableHead><TableHead>Type</TableHead><TableHead>State</TableHead><TableHead>Health Checked</TableHead></tr></thead><tbody>{INTEGRATIONS.map(([name, type]) => <tr key={name} className="border-b border-slate-100 dark:border-slate-800"><TableCell>{name}</TableCell><TableCell muted>{type}</TableCell><TableCell><StateBadge state="unknown" label="Unknown" /></TableCell><TableCell muted>No</TableCell></tr>)}</tbody></table><SourceNote text="Known repository capabilities only · Configuration and runtime health not exposed" /></div></Panel>;
}

function AuditLogPanel() {
  return <Panel title="Audit Log (Recent Activity)" action={<StateBadge state="na" />}><div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-[10px]"><thead className="border-b border-slate-200 text-slate-400 dark:border-slate-800"><tr>{["Time", "User", "Action", "Resource", "IP Address"].map((heading) => <TableHead key={heading}>{heading}</TableHead>)}</tr></thead><tbody><tr><td colSpan={5}><UnavailableState reason="Platform audit logging not configured" /></td></tr></tbody></table></div></Panel>;
}

function SystemInformationPanel({ platformVersion }: { platformVersion: string }) {
  return <Panel title="System Information" action={<ReadOnlyBadge />}><div className="space-y-2"><InformationRow label="Platform Version" value={platformVersion} real /><InformationRow label="Build Identifier" value="N/A" /><InformationRow label="Database Version" value="N/A" /><InformationRow label="Deployment Environment" value="N/A" /><InformationRow label="Server Region" value="N/A" /><InformationRow label="Support Contact" value="N/A" /></div><SourceNote text="Version source: application package metadata" /></Panel>;
}

function AccessManagementPanel() {
  return <Panel title="API & Access Management" action={<StateBadge state="na" />}><div className="space-y-2"><InformationRow label="API Keys" value="N/A" /><InformationRow label="Webhook Endpoints" value="N/A" /><InformationRow label="Trusted IPs" value="N/A" /></div><SourceNote text="Portal access-management registries not configured" /></Panel>;
}

function DataStoragePanel() {
  return <Panel title="Data & Storage" action={<StateBadge state="na" />}><div className="space-y-2"><InformationRow label="Storage Used" value="N/A" /><InformationRow label="Log Storage (7 Days)" value="N/A" /><InformationRow label="Backups (30 Days)" value="N/A" /></div><SourceNote text="Storage and backup telemetry not configured" /></Panel>;
}

function InformationRow({ label, value, real = false }: { label: string; value: string; real?: boolean }) { return <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800/60"><span className="text-slate-500">{label}</span><span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">{value}<StateBadge state={real ? "real" : "na"} /></span></div>; }
function UnavailablePanel({ title, reason, compact = false }: { title: string; reason: string; compact?: boolean }) { return <Panel title={title} action={<StateBadge state="na" />}><UnavailableState reason={reason} compact={compact} /></Panel>; }
function UnavailableState({ reason, compact = false }: { reason: string; compact?: boolean }) { return <div className={`flex flex-col items-center justify-center px-4 text-center ${compact ? "min-h-44" : "min-h-64"}`}><p className="text-2xl font-semibold text-slate-300 dark:text-slate-600">N/A</p><p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">{reason}</p></div>; }

type State = "real" | "configured" | "unknown" | "na";
function StateBadge({ state, label }: { state: State; label?: string }) {
  const styles: Record<State, string> = { real: "bg-blue-50 text-brand-blue dark:bg-blue-950", configured: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300", unknown: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300", na: "bg-slate-100 text-slate-500 dark:bg-slate-800" };
  const defaults: Record<State, string> = { real: "Real", configured: "Configured", unknown: "Unknown", na: "Not Available" };
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide ${styles[state]}`}>{label ?? defaults[state]}</span>;
}
function ReadOnlyBadge() { return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800">Read Only</span>; }
function SourceNote({ text }: { text: string }) { return <p className="mt-3 border-t border-slate-100 pt-2 text-[9px] leading-4 text-slate-400 dark:border-slate-800">{text}</p>; }
function TableHead({ children }: { children: ReactNode }) { return <th className="whitespace-nowrap px-2 py-2 font-semibold first:pl-0 last:pr-0">{children}</th>; }
function TableCell({ children, muted = false }: { children: ReactNode; muted?: boolean }) { return <td className={`px-2 py-2 first:pl-0 last:pr-0 ${muted ? "text-slate-500" : "font-medium text-slate-600 dark:text-slate-300"}`}>{children}</td>; }

type IconName = (typeof KPI_ITEMS)[number]["icon"];
function SettingsIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    uptime: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    users: <><circle cx="8" cy="8" r="3" /><circle cx="16" cy="9" r="2.5" /><path d="M3 19c.5-3 2.2-5 5-5s4.5 2 5 5M13 15c3.6-1.2 6.6.7 7 4" /></>,
    roles: <><path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z" /><path d="m9 12 2 2 4-5" /></>,
    integrations: <><path d="M8 12h8M6 8l-4 4 4 4M18 8l4 4-4 4" /></>,
    keys: <><circle cx="8" cy="12" r="4" /><path d="M12 12h9M18 12v3M15 12v2" /></>,
    audit: <><path d="M6 3h12v18H6z" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
  };
  return <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" aria-hidden="true"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg></span>;
}
