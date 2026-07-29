"use client";

import {
  Activity,
  ArrowDown,
  ArrowUp,
  Clock,
  Cpu,
  Download,
  HardDrive,
  Minus,
  Network,
  RefreshCw,
  Server,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { fmtBytes, fmtPct, fmtUptime, healthBand } from "@/lib/devtools/format";
import type {
  Metric,
  OverviewResponse,
  Range,
  Recommendation,
  SeriesPoint,
} from "@/lib/devtools/types";
import { RANGES } from "@/lib/devtools/types";
import { cn } from "@/lib/utils";
import { UsageHeatmap } from "./heatmap";
import { type ChartSeries, UsageChart } from "./usage-chart";

const METRIC_META: Record<Metric, { label: string; color: string }> = {
  cpu: { label: "CPU", color: "#ef4444" },
  ram: { label: "RAM", color: "#3b82f6" },
  storage: { label: "Storage", color: "#8b5cf6" },
};

const REFRESH_OPTIONS = [
  { v: 5000, l: "5s" },
  { v: 10000, l: "10s" },
  { v: 30000, l: "30s" },
  { v: 0, l: "Off" },
];

// Healthy = neutral/brand (not green); only warn/crit draw attention.
const BAND_TEXT = { ok: "text-foreground", warn: "text-amber-500", crit: "text-red-500" } as const;
const BAND_BAR = { ok: "bg-brand-primary", warn: "bg-amber-500", crit: "bg-red-500" } as const;

export function DevToolsDashboard() {
  const [ov, setOv] = useState<OverviewResponse | null>(null);
  const [range, setRange] = useState<Range>("24h");
  const [enabled, setEnabled] = useState<Record<Metric, boolean>>({
    cpu: true,
    ram: true,
    storage: true,
  });
  const [seriesMap, setSeriesMap] = useState<Record<Metric, SeriesPoint[]>>({
    cpu: [],
    ram: [],
    storage: [],
  });
  const [heatMetric, setHeatMetric] = useState<"cpu" | "ram">("cpu");
  const [refreshMs, setRefreshMs] = useState(10000);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const rangeRef = useRef(range);
  rangeRef.current = range;

  const fetchOverview = useCallback(async () => {
    try {
      const r = await fetch("/api/devtools/overview", { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      setOv(await r.json());
      setUpdatedAt(Date.now());
      setErr(null);
    } catch {
      setErr("Gagal memuat data monitoring.");
    }
  }, []);

  const fetchSeries = useCallback(async (rng: Range) => {
    try {
      const metrics: Metric[] = ["cpu", "ram", "storage"];
      const res = await Promise.all(
        metrics.map((m) =>
          fetch(`/api/devtools/series?metric=${m}&range=${rng}`, { cache: "no-store" }).then((r) =>
            r.json(),
          ),
        ),
      );
      const map = { cpu: [], ram: [], storage: [] } as Record<Metric, SeriesPoint[]>;
      metrics.forEach((m, i) => {
        map[m] = res[i]?.points ?? [];
      });
      setSeriesMap(map);
    } catch {
      // keep previous series on transient error
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);
  useEffect(() => {
    fetchSeries(range);
  }, [range, fetchSeries]);
  useEffect(() => {
    if (!refreshMs) return;
    const id = setInterval(() => {
      fetchOverview();
      fetchSeries(rangeRef.current);
    }, refreshMs);
    return () => clearInterval(id);
  }, [refreshMs, fetchOverview, fetchSeries]);

  const chartSeries: ChartSeries[] = (["cpu", "ram", "storage"] as Metric[])
    .filter((m) => enabled[m])
    .map((m) => ({
      key: m,
      label: METRIC_META[m].label,
      color: METRIC_META[m].color,
      points: seriesMap[m],
    }));

  function exportCsv() {
    const metrics: Metric[] = ["cpu", "ram", "storage"];
    const base = seriesMap[metrics.find((m) => seriesMap[m].length) ?? "cpu"];
    const rows = [["time", "cpu", "ram", "storage"]];
    base.forEach((_, i) => {
      rows.push([
        new Date(seriesMap.cpu[i]?.t ?? base[i].t).toISOString(),
        String(seriesMap.cpu[i]?.v ?? ""),
        String(seriesMap.ram[i]?.v ?? ""),
        String(seriesMap.storage[i]?.v ?? ""),
      ]);
    });
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `devtools-${range}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-brand-primary" />
          <div>
            <h1 className="text-lg font-semibold leading-tight text-foreground">Server Monitor</h1>
            <p className="text-xs text-muted-foreground">
              {ov ? `${ov.host} · ${ov.platform} ${ov.kernel} · ${ov.arch}` : "Memuat…"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {updatedAt && <span>Diperbarui {new Date(updatedAt).toLocaleTimeString("id-ID")}</span>}
          <select
            value={refreshMs}
            onChange={(e) => setRefreshMs(Number(e.target.value))}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs"
            aria-label="Interval refresh"
          >
            {REFRESH_OPTIONS.map((o) => (
              <option key={o.l} value={o.v}>
                {o.v ? `Auto ${o.l}` : "Manual"}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              fetchOverview();
              fetchSeries(range);
            }}
            className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 hover:bg-muted"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      {err && (
        <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {err}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={Cpu}
          label="CPU"
          value={ov ? fmtPct(ov.cpu.pct) : "—"}
          sub={ov ? `${ov.cores} core · ${ov.cpuModel}` : ""}
          pct={ov?.cpu.pct}
        />
        <StatCard
          icon={Activity}
          label="RAM"
          value={ov ? fmtPct(ov.ram.pct) : "—"}
          sub={ov ? `${fmtBytes(ov.ram.usedB)} / ${fmtBytes(ov.ram.totalB)}` : ""}
          pct={ov?.ram.pct}
        />
        <StatCard
          icon={HardDrive}
          label="Storage"
          value={ov ? fmtPct(ov.storage.pct) : "—"}
          sub={
            ov
              ? `${fmtBytes(ov.storage.usedB)} / ${fmtBytes(ov.storage.totalB)} · ${ov.storage.diskCount} disk`
              : ""
          }
          pct={ov?.storage.pct}
        />
        <StatCard
          icon={Clock}
          label="Uptime"
          value={ov ? fmtUptime(ov.uptimeS) : "—"}
          sub="Waktu aktif server"
        />
        <StatCard
          icon={TrendingUp}
          label="Load Avg"
          value={ov ? ov.load.one.toFixed(2) : "—"}
          sub={ov ? `5m ${ov.load.five.toFixed(2)} · 15m ${ov.load.fifteen.toFixed(2)}` : ""}
        />
      </div>

      {/* Secondary stats */}
      {ov && (
        <div className="mt-3 flex flex-wrap gap-4 rounded-lg border border-border bg-card px-4 py-2.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5" /> {ov.procCount} proses
          </span>
          {ov.swap.totalB > 0 && (
            <span>
              Swap: {fmtBytes(ov.swap.usedB)} / {fmtBytes(ov.swap.totalB)} ({fmtPct(ov.swap.pct)})
            </span>
          )}
          {(ov.net.rxB > 0 || ov.net.txB > 0) && (
            <span className="flex items-center gap-1.5">
              <Network className="h-3.5 w-3.5" /> RX {fmtBytes(ov.net.rxB)} · TX{" "}
              {fmtBytes(ov.net.txB)}
            </span>
          )}
        </div>
      )}

      {/* Disk breakdown */}
      {ov && ov.disks.length > 0 && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <HardDrive className="h-4 w-4" /> Rincian Disk
            </h2>
            <div className="space-y-2.5">
              {ov.disks.map((d) => {
                const band = healthBand(d.pct);
                return (
                  <div key={d.mount} className="flex items-center gap-3 text-xs">
                    <span className="w-32 shrink-0 truncate font-mono text-muted-foreground">
                      {d.mount}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", BAND_BAR[band])}
                        style={{ width: `${Math.min(100, d.pct)}%` }}
                      />
                    </div>
                    <span className={cn("w-14 text-right font-medium", BAND_TEXT[band])}>
                      {fmtPct(d.pct)}
                    </span>
                    <span className="w-32 text-right text-muted-foreground">
                      {fmtBytes(d.usedB)} / {fmtBytes(d.totalB)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage over time */}
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">Penggunaan Sumber Daya</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-1">
                {(["cpu", "ram", "storage"] as Metric[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setEnabled((e) => ({ ...e, [m]: !e[m] }))}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors",
                      enabled[m]
                        ? "border-transparent bg-muted text-foreground"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: METRIC_META[m].color }}
                    />
                    {METRIC_META[m].label}
                  </button>
                ))}
              </div>
              <div className="flex rounded-md border border-border p-0.5">
                {RANGES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    className={cn(
                      "rounded px-2 py-0.5 text-xs transition-colors",
                      range === r
                        ? "bg-brand-primary text-white"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={exportCsv}
                className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                title="Ekspor CSV"
              >
                <Download className="h-3.5 w-3.5" /> CSV
              </button>
            </div>
          </div>
          <UsageChart series={chartSeries} range={range} />
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Heatmap */}
        <Card>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Heatmap Penggunaan</h2>
                <p className="text-xs text-muted-foreground">7 hari terakhir · rata-rata per jam</p>
              </div>
              <div className="flex rounded-md border border-border p-0.5 text-xs">
                {(["cpu", "ram"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setHeatMetric(m)}
                    className={cn(
                      "rounded px-2 py-0.5 transition-colors",
                      heatMetric === m ? "bg-muted text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            {ov ? (
              <UsageHeatmap data={ov.heatmap} metric={heatMetric} />
            ) : (
              <div className="h-40 animate-pulse rounded bg-muted" />
            )}
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold text-foreground">Insights</h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Pola terdeteksi dari 7 hari terakhir
            </p>
            <div className="space-y-2">
              {ov?.insights.length ? (
                ov.insights.map((it) => (
                  <div key={it.title} className="rounded-lg border border-border bg-muted/40 p-3">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-brand-primary">
                      <TrendingUp className="h-3.5 w-3.5" /> {it.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{it.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  Belum cukup data untuk menganalisis pola.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <div className="mt-4">
        <h2 className="text-sm font-semibold text-foreground">Rekomendasi Server</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          {ov ? `Berdasarkan ${ov.dailySummaries} ringkasan harian` : "Memuat…"}
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {ov?.recommendations.map((r) => (
            <RecCard key={r.resource} rec={r} />
          ))}
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  pct,
}: {
  icon: typeof Cpu;
  label: string;
  value: string;
  sub: string;
  pct?: number;
}) {
  const band = pct != null ? healthBand(pct) : "ok";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5" /> {label}
        </div>
        <div
          className={cn(
            "mt-1 text-2xl font-semibold tabular-nums",
            pct != null ? BAND_TEXT[band] : "text-foreground",
          )}
        >
          {value}
        </div>
        <div className="truncate text-xs text-muted-foreground" title={sub}>
          {sub}
        </div>
        {pct != null && (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full", BAND_BAR[band])}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const ACTION_META = {
  downgrade: {
    label: "Downgrade",
    icon: ArrowDown,
    cls: "text-brand-primary border-brand-primary/40 bg-brand-primary/10",
  },
  maintain: { label: "Maintain", icon: Minus, cls: "text-muted-foreground border-border bg-muted" },
  upgrade: {
    label: "Upgrade",
    icon: ArrowUp,
    cls: "text-amber-600 dark:text-amber-400 border-amber-500/40 bg-amber-500/10",
  },
} as const;

const LEVEL_LABEL = {
  low: "URGENSI RENDAH",
  medium: "URGENSI SEDANG",
  high: "URGENSI TINGGI",
} as const;
const CONF_LABEL = { low: "KONF. RENDAH", medium: "KONF. SEDANG", high: "KONF. TINGGI" } as const;

function RecCard({ rec }: { rec: Recommendation }) {
  const a = ACTION_META[rec.action];
  const ActionIcon = a.icon;
  const resourceLabel = rec.resource === "cpu" ? "CPU" : rec.resource === "ram" ? "RAM" : "Storage";
  const ResourceIcon = rec.resource === "cpu" ? Cpu : rec.resource === "ram" ? Activity : HardDrive;
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <ResourceIcon className="h-4 w-4" /> {resourceLabel}
          </span>
          <span
            className={cn(
              "flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
              a.cls,
            )}
          >
            <ActionIcon className="h-3 w-3" /> {a.label}
          </span>
        </div>
        <div className="mb-2 flex items-center gap-2 text-sm">
          <span className="rounded bg-muted px-2 py-0.5 font-medium text-foreground">
            {rec.current}
          </span>
          {rec.suggested !== rec.current && (
            <>
              <ArrowDown className="h-3.5 w-3.5 -rotate-90 text-muted-foreground" />
              <span className="rounded bg-brand-primary/15 px-2 py-0.5 font-medium text-brand-primary">
                {rec.suggested}
              </span>
            </>
          )}
        </div>
        <p className="mb-3 text-xs text-muted-foreground">{rec.reason}</p>
        <div className="flex gap-2 text-[10px]">
          <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-muted-foreground">
            {LEVEL_LABEL[rec.urgency]}
          </span>
          <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-muted-foreground">
            {CONF_LABEL[rec.confidence]}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
