export function StatCard({
  label,
  value,
  changePct,
  loading,
}: {
  label: string;
  value: string;
  changePct?: number;
  loading?: boolean;
}) {
  const positive = (changePct ?? 0) >= 0;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      {loading ? (
        <div className="mt-2 h-6 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      ) : (
        <p className="mt-1 text-2xl font-semibold text-slate-800 dark:text-white">
          {value}
        </p>
      )}
      {typeof changePct === "number" && !loading && (
        <p
          className={`mt-1 text-xs ${
            positive ? "text-emerald-600" : "text-brand-red"
          }`}
        >
          {positive ? "↑" : "↓"} {Math.abs(changePct)}% vs last 7 days
        </p>
      )}
    </div>
  );
}
