"use client";

import type { Heatmap } from "@/lib/devtools/types";

// Low → high ramp (emerald → amber → red), matching the reference design.
const RAMP = ["#0f3d2e", "#0f766e", "#22c55e", "#eab308", "#f97316", "#ef4444"];

function colorFor(value: number, max: number): string {
  if (max <= 0) return RAMP[0];
  const t = Math.min(1, value / max);
  const idx = Math.min(RAMP.length - 1, Math.floor(t * (RAMP.length - 1) + 0.0001));
  return RAMP[idx];
}

export function UsageHeatmap({ data, metric }: { data: Heatmap; metric: "cpu" | "ram" }) {
  const matrix = metric === "cpu" ? data.cpu : data.ram;
  const max = Math.max(0.001, ...matrix.flat());

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          {/* hour header */}
          <div className="mb-1 flex pl-10 text-[10px] text-muted-foreground">
            {data.hours.map((h) => (
              <div key={h} className="flex-1 text-center">
                {h % 3 === 0 ? String(h).padStart(2, "0") : ""}
              </div>
            ))}
          </div>
          {data.rows.map((row, ri) => (
            <div key={`${row.label}-${row.date}`} className="mb-1 flex items-center gap-1">
              <div className="w-9 shrink-0 text-right text-[10px] text-muted-foreground">
                {row.label}
              </div>
              <div className="flex flex-1 gap-1">
                {data.hours.map((h) => {
                  const v = matrix[ri]?.[h] ?? 0;
                  return (
                    <div
                      key={h}
                      className="aspect-square flex-1 rounded-[3px]"
                      style={{ background: colorFor(v, max) }}
                      title={`${row.label} ${row.date} · ${String(h).padStart(2, "0")}:00 — ${v.toFixed(1)}%`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* legend */}
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
        <span>Rendah</span>
        {RAMP.map((c) => (
          <span key={c} className="h-2.5 w-2.5 rounded-[2px]" style={{ background: c }} />
        ))}
        <span>Tinggi</span>
      </div>
    </div>
  );
}
