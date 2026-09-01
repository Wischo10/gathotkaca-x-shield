import { ReactNode } from "react";

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PanelLoading() {
  return (
    <div className="flex h-40 animate-pulse items-center justify-center text-sm text-slate-400">
      Loading…
    </div>
  );
}

export function PanelEmpty({ message = "No data available" }: { message?: string }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-1 text-center text-sm text-slate-400">
      <span>{message}</span>
    </div>
  );
}

export function PanelError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-2 text-center text-sm">
      <span className="text-brand-red">Failed to load data</span>
      <span className="text-slate-400">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Retry
        </button>
      )}
    </div>
  );
}
