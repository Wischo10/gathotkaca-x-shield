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
      className={`flex h-full min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none ${className}`}
    >
      <div className="mb-3 flex min-h-6 items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {title}
        </h2>
        {action}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
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
