import { type InferSchemaType, model, models, Schema } from "mongoose";

/**
 * Three-tier server metrics for /devtools:
 *  - ServerMetric        raw snapshots, TTL 3 days   → powers 1h / 6h / 24h
 *  - ServerMetricHourly  hourly rollups, TTL 120 days → powers 7d / 30d + heatmap
 *  - ServerMetricDaily   daily rollups, kept ~2 years → powers 90d / 1y + recommendations
 * Percent fields are 0–100. Byte fields are absolute.
 */

const RAW_TTL_S = 60 * 60 * 24 * 3;
const HOURLY_TTL_S = 60 * 60 * 24 * 120;
const DAILY_TTL_S = 60 * 60 * 24 * 800;

const aggSchema = new Schema(
  {
    avg: { type: Number, default: 0 },
    p95: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
  },
  { _id: false },
);

const diskSchema = new Schema(
  {
    mount: { type: String, required: true },
    usedB: { type: Number, default: 0 },
    totalB: { type: Number, default: 0 },
    pct: { type: Number, default: 0 },
  },
  { _id: false },
);

// ── Raw snapshot ────────────────────────────────────────────────────────────
const serverMetricSchema = new Schema({
  host: { type: String, required: true },
  ts: { type: Date, default: Date.now },
  cpuPct: { type: Number, default: 0 },
  cores: { type: Number, default: 0 },
  cpuModel: { type: String, default: "" },
  arch: { type: String, default: "" },
  kernel: { type: String, default: "" },
  platform: { type: String, default: "" },
  load1: { type: Number, default: 0 },
  load5: { type: Number, default: 0 },
  load15: { type: Number, default: 0 },
  memUsedB: { type: Number, default: 0 },
  memTotalB: { type: Number, default: 0 },
  swapUsedB: { type: Number, default: 0 },
  swapTotalB: { type: Number, default: 0 },
  uptimeS: { type: Number, default: 0 },
  disks: { type: [diskSchema], default: [] },
  storageUsedB: { type: Number, default: 0 },
  storageTotalB: { type: Number, default: 0 },
  procCount: { type: Number, default: 0 },
  netRxB: { type: Number, default: 0 },
  netTxB: { type: Number, default: 0 },
});
serverMetricSchema.index({ host: 1, ts: -1 });
serverMetricSchema.index({ ts: 1 }, { expireAfterSeconds: RAW_TTL_S });

// ── Hourly rollup ───────────────────────────────────────────────────────────
const serverMetricHourlySchema = new Schema({
  host: { type: String, required: true },
  hourStart: { type: Date, required: true },
  cpu: { type: aggSchema, default: () => ({}) },
  ram: { type: aggSchema, default: () => ({}) },
  storage: { type: aggSchema, default: () => ({}) },
  samples: { type: Number, default: 0 },
});
serverMetricHourlySchema.index({ host: 1, hourStart: 1 }, { unique: true });
serverMetricHourlySchema.index({ hourStart: 1 }, { expireAfterSeconds: HOURLY_TTL_S });

// ── Daily rollup ────────────────────────────────────────────────────────────
const serverMetricDailySchema = new Schema({
  host: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD (local)
  dateAt: { type: Date, required: true },
  cpu: { type: aggSchema, default: () => ({}) },
  ram: { type: aggSchema, default: () => ({}) },
  storage: { type: aggSchema, default: () => ({}) },
  samples: { type: Number, default: 0 },
});
serverMetricDailySchema.index({ host: 1, date: 1 }, { unique: true });
serverMetricDailySchema.index({ dateAt: 1 }, { expireAfterSeconds: DAILY_TTL_S });

export type ServerMetricDoc = InferSchemaType<typeof serverMetricSchema>;
export type ServerMetricHourlyDoc = InferSchemaType<typeof serverMetricHourlySchema>;
export type ServerMetricDailyDoc = InferSchemaType<typeof serverMetricDailySchema>;

export const ServerMetric = models.ServerMetric ?? model("ServerMetric", serverMetricSchema);
export const ServerMetricHourly =
  models.ServerMetricHourly ?? model("ServerMetricHourly", serverMetricHourlySchema);
export const ServerMetricDaily =
  models.ServerMetricDaily ?? model("ServerMetricDaily", serverMetricDailySchema);
