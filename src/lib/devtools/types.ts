/** Shared response shapes for the /devtools API (imported type-only by the UI). */

export const METRICS = ["cpu", "ram", "storage"] as const;
export type Metric = (typeof METRICS)[number];

export const RANGES = ["1h", "6h", "24h", "7d", "30d", "90d", "1y"] as const;
export type Range = (typeof RANGES)[number];

export interface SeriesPoint {
  t: number; // epoch ms
  v: number; // percent 0–100
}

export interface SeriesResponse {
  metric: Metric;
  range: Range;
  points: SeriesPoint[];
}

export interface DiskInfo {
  mount: string;
  usedB: number;
  totalB: number;
  pct: number;
}

export interface Insight {
  title: string;
  text: string;
}

export type RecAction = "downgrade" | "maintain" | "upgrade";
export type RecLevel = "low" | "medium" | "high";

export interface Recommendation {
  resource: "cpu" | "ram" | "storage";
  current: string;
  suggested: string;
  action: RecAction;
  urgency: RecLevel;
  confidence: RecLevel;
  reason: string;
}

export interface Heatmap {
  /** 7 rows (oldest→newest), each labelled by weekday + date. */
  rows: Array<{ label: string; date: string }>;
  hours: number[]; // 0..23
  cpu: number[][]; // [row][hour] percent
  ram: number[][];
}

export interface OverviewResponse {
  host: string;
  platform: string;
  kernel: string;
  arch: string;
  cpuModel: string;
  cores: number;
  updatedAt: number;
  uptimeS: number;
  cpu: { pct: number };
  ram: { usedB: number; totalB: number; pct: number };
  swap: { usedB: number; totalB: number; pct: number };
  storage: { usedB: number; totalB: number; pct: number; diskCount: number };
  load: { one: number; five: number; fifteen: number };
  disks: DiskInfo[];
  procCount: number;
  net: { rxB: number; txB: number };
  dailySummaries: number;
  insights: Insight[];
  recommendations: Recommendation[];
  heatmap: Heatmap;
}
