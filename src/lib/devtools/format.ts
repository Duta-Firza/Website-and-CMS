/** Presentation helpers for the /devtools UI (client-safe, no deps). */

export function fmtBytes(b: number): string {
  if (!b || b < 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(b) / Math.log(1024)));
  const v = b / 1024 ** i;
  return `${v.toFixed(i >= 3 ? 1 : i === 0 ? 0 : 1)} ${units[i]}`;
}

export function fmtUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function fmtPct(n: number): string {
  return `${Math.round(n * 10) / 10}%`;
}

export function fmtTimeAxis(ms: number, range: string): string {
  const d = new Date(ms);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  if (range === "1h" || range === "6h" || range === "24h") return `${hh}:${mm}`;
  const day = String(d.getDate()).padStart(2, "0");
  const mon = String(d.getMonth() + 1).padStart(2, "0");
  if (range === "7d" || range === "30d") return `${day}/${mon}`;
  return `${day}/${mon}/${String(d.getFullYear()).slice(2)}`;
}

/** Health band for a percentage: ok < 70 ≤ warn < 90 ≤ crit. */
export function healthBand(pct: number): "ok" | "warn" | "crit" {
  if (pct >= 90) return "crit";
  if (pct >= 70) return "warn";
  return "ok";
}
