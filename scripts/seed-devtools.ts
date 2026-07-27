/**
 * Seeds fake /devtools history so the long ranges (7d/30d/90d/1y), heatmap,
 * insights, and recommendations can be exercised without waiting for the real
 * collector to accumulate data.
 *
 *   pnpm tsx scripts/seed-devtools.ts
 *
 * Uses the current machine's hostname so seeded history lines up with live
 * snapshots from POST /api/devtools/collect. Clears existing metric docs for
 * this host first. DEV ONLY.
 */
import os from "node:os";
import { config as loadEnv } from "dotenv";
import mongoose from "mongoose";

loadEnv({ path: ".env.local", override: true });
loadEnv({ path: ".env" });

import { ServerMetric, ServerMetricDaily, ServerMetricHourly } from "../src/models";

const HOST = os.hostname();
const GiB = 1024 ** 3;
const MEM_TOTAL = Math.round(3.8 * GiB);
const CORES = 2;
const CPU_MODEL = os.cpus()[0]?.model?.trim() || "AMD EPYC 7B12";

const DISK_SPEC: Array<[string, number, number]> = [
  // [mount, usedPct, totalGiB]
  ["/", 0.4516, 18.3],
  ["/boot", 0.0859, 0.86],
  ["/boot/efi", 0.0585, 0.102],
  ["/data/mongodb", 0.0459, 9.7],
];

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const r1 = (n: number) => Math.round(n * 10) / 10;

// Diurnal shape — peaks around 08:00, 13:00, 06:00 (matches the mock insights).
function hourFactor(hour: number): number {
  const peaks: Array<[number, number]> = [
    [8, 1],
    [13, 0.9],
    [6, 0.7],
  ];
  let f = 0.35;
  for (const [h, w] of peaks) f += w * Math.exp(-((hour - h) ** 2) / 6);
  return f; // ~0.35 .. 1.7
}
// Tuesday (2) busiest; weekends quietest.
function dowFactor(dow: number): number {
  return [0.6, 0.9, 1.0, 0.95, 0.9, 0.85, 0.55][dow] ?? 0.8;
}

function sampleFor(date: Date, hour: number, daysAgo: number) {
  const hf = hourFactor(hour);
  const df = dowFactor(date.getDay());
  const cpuAvg = clamp(1 + 3 * hf * df * rand(0.6, 1.2), 0.4, 22);
  const cpuP95 = clamp(cpuAvg * rand(1.8, 2.6), cpuAvg, 40);
  const cpuMax = clamp(cpuP95 * rand(1.3, 1.9), cpuP95, 60);
  const ramAvg = clamp(29 + 3 * hf * df * rand(0.7, 1.1), 25, 44);
  const ramP95 = clamp(ramAvg + rand(1, 3), ramAvg, 55);
  const ramMax = clamp(ramP95 + rand(1, 4), ramP95, 70);
  const stoBase = 31 - (daysAgo / 120) * 2; // slow rise toward today
  const stoAvg = clamp(stoBase + rand(-0.2, 0.2), 20, 90);
  return {
    cpu: { avg: r1(cpuAvg), p95: r1(cpuP95), max: r1(cpuMax) },
    ram: { avg: r1(ramAvg), p95: r1(ramP95), max: r1(ramMax) },
    storage: { avg: r1(stoAvg), p95: r1(stoAvg + 0.1), max: r1(stoAvg + 0.3) },
  };
}

function aggOfAggs(rows: Array<{ avg: number; p95: number; max: number }>) {
  const avg = rows.reduce((s, r) => s + r.avg, 0) / rows.length;
  return {
    avg: r1(avg),
    p95: r1(Math.max(...rows.map((r) => r.p95))),
    max: r1(Math.max(...rows.map((r) => r.max))),
  };
}

function disksAt(storagePct: number) {
  // Scale each mount's used bytes so the aggregate matches storagePct.
  const disks = DISK_SPEC.map(([mount, usedPct, totalGiB]) => {
    const totalB = Math.round(totalGiB * GiB);
    const usedB = Math.round(totalB * usedPct);
    return { mount, usedB, totalB, pct: r1(usedPct * 100) };
  });
  const totalB = disks.reduce((s, d) => s + d.totalB, 0);
  const usedB = Math.round((storagePct / 100) * totalB);
  return { disks, storageUsedB: usedB, storageTotalB: totalB };
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set (check .env.local)");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  console.log(`Seeding /devtools metrics for host "${HOST}"…`);

  await Promise.all([
    ServerMetric.deleteMany({ host: HOST }),
    ServerMetricHourly.deleteMany({ host: HOST }),
    ServerMetricDaily.deleteMany({ host: HOST }),
  ]);

  const now = new Date();
  const DAYS = 120;
  const HOURLY_DAYS = 35;
  const hourlyDocs: Record<string, unknown>[] = [];
  const dailyDocs: Record<string, unknown>[] = [];

  for (let d = DAYS - 1; d >= 0; d--) {
    const day = new Date(now);
    day.setDate(day.getDate() - d);
    day.setHours(0, 0, 0, 0);

    const hourAggs = { cpu: [] as number[], _rows: [] as ReturnType<typeof sampleFor>[] };
    for (let h = 0; h < 24; h++) {
      const s = sampleFor(day, h, d);
      hourAggs._rows.push(s);
      if (d < HOURLY_DAYS) {
        const hourStart = new Date(day);
        hourStart.setHours(h, 0, 0, 0);
        if (hourStart <= now) {
          hourlyDocs.push({
            host: HOST,
            hourStart,
            cpu: s.cpu,
            ram: s.ram,
            storage: s.storage,
            samples: 12,
          });
        }
      }
    }
    dailyDocs.push({
      host: HOST,
      date: `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`,
      dateAt: day,
      cpu: aggOfAggs(hourAggs._rows.map((r) => r.cpu)),
      ram: aggOfAggs(hourAggs._rows.map((r) => r.ram)),
      storage: aggOfAggs(hourAggs._rows.map((r) => r.storage)),
      samples: 24 * 12,
    });
  }

  // Raw for the last 24h, every 5 minutes.
  const rawDocs: Record<string, unknown>[] = [];
  for (let i = 24 * 12; i >= 0; i--) {
    const ts = new Date(now.getTime() - i * 5 * 60_000);
    const s = sampleFor(ts, ts.getHours(), 0);
    const cpuPct = r1(clamp(s.cpu.avg * rand(0.7, 1.4), 0.2, 60));
    const ramPct = r1(clamp(s.ram.avg + rand(-1.5, 1.5), 20, 70));
    const { disks, storageUsedB, storageTotalB } = disksAt(s.storage.avg);
    rawDocs.push({
      host: HOST,
      ts,
      cpuPct,
      cores: CORES,
      cpuModel: CPU_MODEL,
      arch: "x64",
      kernel: "6.17.0-1008-gcp",
      platform: "linux",
      load1: r1((cpuPct / 100) * CORES),
      load5: r1((cpuPct / 100) * CORES * 0.9),
      load15: r1((cpuPct / 100) * CORES * 0.8),
      memUsedB: Math.round((ramPct / 100) * MEM_TOTAL),
      memTotalB: MEM_TOTAL,
      swapUsedB: 0,
      swapTotalB: 0,
      uptimeS: 135 * 86400 + i * 300,
      disks,
      storageUsedB,
      storageTotalB,
      procCount: Math.round(rand(120, 160)),
      netRxB: 0,
      netTxB: 0,
    });
  }

  await ServerMetricDaily.insertMany(dailyDocs);
  await ServerMetricHourly.insertMany(hourlyDocs);
  await ServerMetric.insertMany(rawDocs);

  console.log(
    `✓ Seeded ${dailyDocs.length} daily, ${hourlyDocs.length} hourly, ${rawDocs.length} raw docs.`,
  );
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
