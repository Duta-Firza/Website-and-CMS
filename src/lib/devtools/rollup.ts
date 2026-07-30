import { ServerMetric, ServerMetricDaily, ServerMetricHourly } from "@/models";
import { type Agg, aggStat, pctOf, startOfDay, startOfHour, ymd } from "./metrics-util";

interface RawRow {
  cpuPct: number;
  memUsedB: number;
  memTotalB: number;
  storageUsedB: number;
  storageTotalB: number;
}

interface Rollup {
  cpu: Agg;
  ram: Agg;
  storage: Agg;
  samples: number;
}

function summarise(rows: RawRow[]): Rollup {
  const cpu = rows.map((r) => r.cpuPct);
  const ram = rows.map((r) => pctOf(r.memUsedB, r.memTotalB));
  const storage = rows.map((r) => pctOf(r.storageUsedB, r.storageTotalB));
  return { cpu: aggStat(cpu), ram: aggStat(ram), storage: aggStat(storage), samples: rows.length };
}

/**
 * Recompute the current hour + day aggregates from raw samples and upsert them.
 * Called after each raw insert. Raw for the running hour/day is still within the
 * TTL window, so re-summarising is cheap and self-healing.
 */
export async function rollup(host: string, at: Date): Promise<void> {
  const hourStart = startOfHour(at);
  const hourEnd = new Date(+hourStart + 3600_000);
  const dayStart = startOfDay(at);
  const dayEnd = new Date(+dayStart + 86_400_000);
  const select = "cpuPct memUsedB memTotalB storageUsedB storageTotalB";

  const [hourRows, dayRows] = await Promise.all([
    ServerMetric.find({ host, ts: { $gte: hourStart, $lt: hourEnd } })
      .select(select)
      .lean<RawRow[]>(),
    ServerMetric.find({ host, ts: { $gte: dayStart, $lt: dayEnd } })
      .select(select)
      .lean<RawRow[]>(),
  ]);

  const ops: Promise<unknown>[] = [];
  if (hourRows.length) {
    ops.push(
      ServerMetricHourly.updateOne(
        { host, hourStart },
        { $set: summarise(hourRows) },
        { upsert: true },
      ),
    );
  }
  if (dayRows.length) {
    ops.push(
      ServerMetricDaily.updateOne(
        { host, date: ymd(at) },
        { $set: { ...summarise(dayRows), dateAt: dayStart } },
        { upsert: true },
      ),
    );
  }
  await Promise.all(ops);
}
