import { ServerMetric, ServerMetricDaily, ServerMetricHourly } from "@/models";
import { pctOf, round1 } from "./metrics-util";
import type { Metric, Range, SeriesPoint } from "./types";

const RANGE_MS: Record<Range, number> = {
  "1h": 3600_000,
  "6h": 6 * 3600_000,
  "24h": 24 * 3600_000,
  "7d": 7 * 86_400_000,
  "30d": 30 * 86_400_000,
  "90d": 90 * 86_400_000,
  "1y": 365 * 86_400_000,
};

const MAX_POINTS = 240;

interface RawRow {
  ts: Date;
  cpuPct: number;
  memUsedB: number;
  memTotalB: number;
  storageUsedB: number;
  storageTotalB: number;
}
interface AggRow {
  when: Date;
  cpu: { avg: number };
  ram: { avg: number };
  storage: { avg: number };
}

function rawValue(metric: Metric, r: RawRow): number {
  if (metric === "cpu") return round1(r.cpuPct);
  if (metric === "ram") return pctOf(r.memUsedB, r.memTotalB);
  return pctOf(r.storageUsedB, r.storageTotalB);
}

/** Bucket-average down to at most `max` points, preserving time order. */
function downsample(points: SeriesPoint[], max = MAX_POINTS): SeriesPoint[] {
  if (points.length <= max) return points;
  const size = Math.ceil(points.length / max);
  const out: SeriesPoint[] = [];
  for (let i = 0; i < points.length; i += size) {
    const slice = points.slice(i, i + size);
    const v = slice.reduce((s, p) => s + p.v, 0) / slice.length;
    out.push({ t: slice[0].t, v: round1(v) });
  }
  return out;
}

export async function getSeries(
  host: string,
  metric: Metric,
  range: Range,
): Promise<SeriesPoint[]> {
  const since = new Date(Date.now() - RANGE_MS[range]);

  if (range === "1h" || range === "6h" || range === "24h") {
    const rows = await ServerMetric.find({ host, ts: { $gte: since } })
      .sort({ ts: 1 })
      .select("ts cpuPct memUsedB memTotalB storageUsedB storageTotalB")
      .lean<RawRow[]>();
    return downsample(rows.map((r) => ({ t: +new Date(r.ts), v: rawValue(metric, r) })));
  }

  if (range === "7d" || range === "30d") {
    const rows = await ServerMetricHourly.find({ host, hourStart: { $gte: since } })
      .sort({ hourStart: 1 })
      .lean<Array<AggRow & { hourStart: Date }>>();
    return downsample(rows.map((r) => ({ t: +new Date(r.hourStart), v: round1(r[metric].avg) })));
  }

  const rows = await ServerMetricDaily.find({ host, dateAt: { $gte: since } })
    .sort({ dateAt: 1 })
    .lean<Array<AggRow & { dateAt: Date }>>();
  return downsample(rows.map((r) => ({ t: +new Date(r.dateAt), v: round1(r[metric].avg) })));
}
