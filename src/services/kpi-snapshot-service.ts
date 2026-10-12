import "server-only";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import type { MetricCardValue } from "@/types/ciso";

export type SnapshotMetric = {
  metricKey: string;
  value: number;
  unit: string;
  source: string;
  observedAt: string;
};

type HistoricalRow = { metric_key: string; metric_value: string; observed_at: Date };

/** Persist at most one genuine observation per UTC day and return real ~30-day baselines. */
export async function recordDailyKpiSnapshots(metrics: SnapshotMetric[]): Promise<Map<string, HistoricalRow>> {
  const history = new Map<string, HistoricalRow>();
  if (!env.database.url() || metrics.length === 0) return history;
  const db = getDb();
  for (const metric of metrics) {
    if (!Number.isFinite(metric.value) || !Number.isFinite(Date.parse(metric.observedAt))) continue;
    await db.query(
      `INSERT INTO ciso_kpi_snapshots
         (metric_key, metric_value, metric_unit, source_status, source, observed_at, observation_date)
       VALUES ($1, $2, $3, 'available', $4, $5::timestamptz, ($5::timestamptz AT TIME ZONE 'UTC')::date)
       ON CONFLICT (metric_key, observation_date) DO UPDATE SET
         metric_value = EXCLUDED.metric_value, metric_unit = EXCLUDED.metric_unit,
         source_status = EXCLUDED.source_status, source = EXCLUDED.source,
         observed_at = EXCLUDED.observed_at`,
      [metric.metricKey, metric.value, metric.unit, metric.source, metric.observedAt]
    );
  }
  const { rows } = await db.query<HistoricalRow>(
    `SELECT DISTINCT ON (metric_key) metric_key, metric_value, observed_at
     FROM ciso_kpi_snapshots
     WHERE metric_key = ANY($1::text[])
       AND observed_at BETWEEN NOW() - INTERVAL '35 days' AND NOW() - INTERVAL '25 days'
     ORDER BY metric_key, ABS(EXTRACT(EPOCH FROM (observed_at - (NOW() - INTERVAL '30 days'))))`,
    [metrics.map(metric => metric.metricKey)]
  );
  for (const row of rows) history.set(row.metric_key, row);
  return history;
}

export function genuineObservedAt(metric: MetricCardValue, fallback: string): string | null {
  if (metric.value === null || !Number.isFinite(metric.value)) return null;
  if (metric.availability && metric.availability.status !== "available") return null;
  return metric.availability?.fetchedAt ?? fallback;
}

export function applyTrend(metric: MetricCardValue, previous: HistoricalRow | undefined): void {
  if (!previous || metric.value === null) {
    metric.trend30d = null;
    metric.trendAvailable = false;
    metric.details = { ...metric.details, previous30d: null,
      explanation: `${metric.details?.explanation ?? ""} Insufficient historical observations.`.trim() };
    return;
  }
  const oldValue = Number(previous.metric_value);
  if (!Number.isFinite(oldValue)) return;
  metric.trend30d = Number((metric.value - oldValue).toFixed(2));
  metric.trendAvailable = true;
  metric.details = { ...metric.details, current: metric.value, previous30d: oldValue };
}
