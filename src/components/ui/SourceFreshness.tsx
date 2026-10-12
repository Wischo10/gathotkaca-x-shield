export function SourceFreshness({
  source,
  timestamp,
  timestampLabel,
  className = "",
}: {
  source: string;
  timestamp?: string | null;
  timestampLabel?: string;
  className?: string;
}) {
  const parsed = timestamp ? new Date(timestamp) : null;
  const formatted = parsed && Number.isFinite(parsed.getTime())
    ? parsed.toLocaleString("en-GB", {
      timeZone: "Asia/Jakarta", day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", timeZoneName: "short",
    })
    : null;

  return (
    <div className={`text-[10px] leading-4 text-slate-400 dark:text-slate-500 ${className}`}>
      <span>Source: {source}</span>
      {formatted && timestampLabel && <span className="block">{timestampLabel}: {formatted}</span>}
    </div>
  );
}
