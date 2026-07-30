import { ServerMetricDaily, ServerMetricHourly } from "@/models";
import { mean, round1 } from "./metrics-util";
import type { Heatmap, Insight, RecLevel, Recommendation } from "./types";

const GiB = 1024 ** 3;
const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

interface HourlyRow {
  hourStart: Date;
  cpu: { avg: number };
  ram: { avg: number };
}

function fmtGB(gb: number): string {
  return gb >= 1 ? `${round1(gb)} GB` : `${Math.round(gb * 1024)} MB`;
}

function confidenceFor(n: number): RecLevel {
  return n >= 90 ? "high" : n >= 30 ? "medium" : "low";
}

// ── Insights (peak hours + peak day/time from last 7 days of hourly data) ─────
export async function getInsights(host: string): Promise<Insight[]> {
  const since = new Date(Date.now() - 7 * 86_400_000);
  const rows = await ServerMetricHourly.find({ host, hourStart: { $gte: since } }).lean<
    HourlyRow[]
  >();
  if (rows.length < 6) return [];

  const load = (r: HourlyRow) => r.cpu.avg + r.ram.avg; // combined load signal
  const byHour: number[][] = Array.from({ length: 24 }, () => []);
  const byDowHour = new Map<string, number[]>();

  for (const r of rows) {
    const d = new Date(r.hourStart);
    byHour[d.getHours()].push(load(r));
    const key = `${d.getDay()}-${d.getHours()}`;
    let bucket = byDowHour.get(key);
    if (!bucket) {
      bucket = [];
      byDowHour.set(key, bucket);
    }
    bucket.push(load(r));
  }

  const hourAvgs = byHour.map((a, h) => ({ h, v: a.length ? mean(a) : 0 }));
  const top = [...hourAvgs].sort((a, b) => b.v - a.v).slice(0, 3);
  const peakHours = top.map((t) => `${String(t.h).padStart(2, "0")}:00`).join(", ");
  const peakCombined = Math.round(top[0]?.v ?? 0);

  let best = { key: "", v: -1 };
  for (const [key, arr] of byDowHour) {
    const v = mean(arr);
    if (v > best.v) best = { key, v };
  }
  const [dow, hh] = best.key.split("-").map(Number);

  const insights: Insight[] = [
    {
      title: "Jam Beban Puncak",
      text: `Beban server tertinggi terjadi sekitar pukul ${peakHours} WIB. Puncak beban gabungan (CPU+RAM): ${peakCombined}%.`,
    },
  ];
  if (best.v >= 0) {
    insights.push({
      title: "Hari & Jam Tersibuk",
      text: `Beban tertinggi pada hari ${DAY_LABELS[dow]} pukul ${String(hh).padStart(2, "0")}:00 WIB (rata-rata gabungan ${Math.round(best.v)}%).`,
    });
  }
  return insights;
}

// ── Recommendations (from all daily summaries) ───────────────────────────────
interface DailyRow {
  cpu: { avg: number; p95: number };
  ram: { avg: number; p95: number };
  storage: { avg: number; p95: number };
}

export async function getRecommendations(
  host: string,
  current: { cores: number; memTotalB: number; storageUsedB: number; storageTotalB: number },
): Promise<{ recommendations: Recommendation[]; dailySummaries: number }> {
  const rows = await ServerMetricDaily.find({ host }).lean<DailyRow[]>();
  const n = rows.length;
  const conf = confidenceFor(n);
  if (!n) return { recommendations: [], dailySummaries: 0 };

  const cpuAvg = round1(mean(rows.map((r) => r.cpu.avg)));
  const cpuP95 = round1(mean(rows.map((r) => r.cpu.p95)));
  const ramAvg = round1(mean(rows.map((r) => r.ram.avg)));
  const ramP95 = round1(mean(rows.map((r) => r.ram.p95)));
  const stoAvg = round1(mean(rows.map((r) => r.storage.avg)));

  // CPU
  const cores = current.cores || 1;
  const cpu: Recommendation = {
    resource: "cpu",
    current: `${cores} Core${cores > 1 ? "s" : ""}`,
    suggested: `${cores} Core${cores > 1 ? "s" : ""}`,
    action: "maintain",
    urgency: "low",
    confidence: conf,
    reason: `Beban CPU sehat. Rata-rata ${cpuAvg}%, P95 ${cpuP95}%.`,
  };
  if (cpuP95 < 40 && cpuAvg < 20 && cores > 1) {
    const s = Math.max(1, Math.floor(cores / 2));
    cpu.action = "downgrade";
    cpu.suggested = `${s} Core${s > 1 ? "s" : ""}`;
    cpu.reason = `Rata-rata CPU hanya ${cpuAvg}%, P95 ${cpuP95}%. Sumber daya kurang termanfaatkan.`;
  } else if (cpuP95 > 85 || cpuAvg > 60) {
    cpu.action = "upgrade";
    cpu.suggested = `${cores * 2} Cores`;
    cpu.urgency = cpuP95 > 95 ? "high" : "medium";
    cpu.reason = `CPU tinggi — rata-rata ${cpuAvg}%, P95 ${cpuP95}%. Pertimbangkan menambah core.`;
  }

  // RAM
  const ramGB = current.memTotalB / GiB;
  const ram: Recommendation = {
    resource: "ram",
    current: fmtGB(ramGB),
    suggested: fmtGB(ramGB),
    action: "maintain",
    urgency: "low",
    confidence: conf,
    reason: `Penggunaan RAM sehat. Rata-rata ${ramAvg}%, P95 ${ramP95}%.`,
  };
  if (ramP95 > 85) {
    ram.action = "upgrade";
    ram.suggested = fmtGB(ramGB * 2);
    ram.urgency = ramP95 > 95 ? "high" : "medium";
    ram.reason = `RAM tinggi — rata-rata ${ramAvg}%, P95 ${ramP95}%. Pertimbangkan menambah RAM.`;
  } else if (ramP95 < 25 && ramAvg < 20 && ramGB > 1) {
    ram.action = "downgrade";
    ram.suggested = fmtGB(Math.max(1, ramGB / 2));
    ram.reason = `Rata-rata RAM hanya ${ramAvg}%, P95 ${ramP95}%. Sumber daya kurang termanfaatkan.`;
  }

  // Storage
  const stoGB = current.storageTotalB / GiB;
  const usedGB = current.storageUsedB / GiB;
  const storage: Recommendation = {
    resource: "storage",
    current: `${Math.round(stoGB)} GB`,
    suggested: `${Math.round(stoGB)} GB`,
    action: "maintain",
    urgency: "low",
    confidence: conf,
    reason: `Penggunaan storage ${stoAvg}%. Kapasitas memadai.`,
  };
  if (stoAvg < 40 && stoGB > 12) {
    const s = Math.max(10, Math.ceil((usedGB * 2) / 5) * 5);
    if (s < stoGB) {
      storage.action = "downgrade";
      storage.suggested = `${s} GB`;
      storage.reason = `Rata-rata storage hanya ${stoAvg}%. Banyak ruang tak terpakai.`;
    }
  } else if (stoAvg > 80) {
    storage.action = "upgrade";
    storage.suggested = `${Math.ceil((stoGB * 1.5) / 5) * 5} GB`;
    storage.urgency = stoAvg > 90 ? "high" : "medium";
    storage.reason = `Storage hampir penuh (${stoAvg}%). Tambah kapasitas.`;
  }

  return { recommendations: [cpu, ram, storage], dailySummaries: n };
}

// ── Heatmap (last 7 days × 24 hours) ─────────────────────────────────────────
export async function getHeatmap(host: string): Promise<Heatmap> {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const rows = await ServerMetricHourly.find({ host, hourStart: { $gte: start } }).lean<
    HourlyRow[]
  >();

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayKeys: string[] = [];
  const rowsMeta: Array<{ label: string; date: string }> = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    dayKeys.push(key);
    rowsMeta.push({
      label: DAY_LABELS[d.getDay()],
      date: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
    });
  }

  const cpu = rowsMeta.map(() => Array<number>(24).fill(0));
  const ram = rowsMeta.map(() => Array<number>(24).fill(0));
  for (const r of rows) {
    const d = new Date(r.hourStart);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const ri = dayKeys.indexOf(key);
    if (ri < 0) continue;
    cpu[ri][d.getHours()] = round1(r.cpu.avg);
    ram[ri][d.getHours()] = round1(r.ram.avg);
  }

  return { rows: rowsMeta, hours, cpu, ram };
}
