/** Small shared math/time helpers for the metrics pipeline (collect, rollup,
 *  series, seed). No Node/Mongoose deps so it is safe to import anywhere. */

export const round1 = (n: number): number => Math.round(n * 10) / 10;
export const round2 = (n: number): number => Math.round(n * 100) / 100;

export function mean(a: number[]): number {
  return a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
}

/** Nearest-rank percentile over an ascending-sorted array. */
export function percentile(sortedAsc: number[], p: number): number {
  if (!sortedAsc.length) return 0;
  const idx = Math.ceil((p / 100) * sortedAsc.length) - 1;
  return sortedAsc[Math.min(sortedAsc.length - 1, Math.max(0, idx))];
}

export interface Agg {
  avg: number;
  p95: number;
  max: number;
}

export function aggStat(arr: number[]): Agg {
  if (!arr.length) return { avg: 0, p95: 0, max: 0 };
  const sorted = [...arr].sort((a, b) => a - b);
  return {
    avg: round1(mean(arr)),
    p95: round1(percentile(sorted, 95)),
    max: round1(Math.max(...arr)),
  };
}

export function startOfHour(d: Date): Date {
  const x = new Date(d);
  x.setMinutes(0, 0, 0);
  return x;
}

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Local-time YYYY-MM-DD key. */
export function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export const pctOf = (used: number, total: number): number =>
  total > 0 ? round1((used / total) * 100) : 0;
