"use client";

import { useEffect, useRef, useState } from "react";
import { fmtTimeAxis } from "@/lib/devtools/format";
import type { Metric, Range, SeriesPoint } from "@/lib/devtools/types";

export interface ChartSeries {
  key: Metric;
  label: string;
  color: string;
  points: SeriesPoint[];
}

const H = 300;
const PAD = { t: 12, r: 14, b: 26, l: 38 };

export function UsageChart({ series, range }: { series: ChartSeries[]; range: Range }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(900);
  const [hoverX, setHoverX] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cw = entries[0]?.contentRect.width;
      if (cw) setW(Math.max(320, Math.floor(cw)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const active = series.filter((s) => s.points.length > 0);
  const ref0 = active.reduce<SeriesPoint[]>(
    (a, s) => (s.points.length > a.length ? s.points : a),
    [],
  );

  let tMin = Number.POSITIVE_INFINITY;
  let tMax = Number.NEGATIVE_INFINITY;
  for (const s of active) {
    for (const p of s.points) {
      if (p.t < tMin) tMin = p.t;
      if (p.t > tMax) tMax = p.t;
    }
  }
  const hasData = active.length > 0 && Number.isFinite(tMin) && tMax > tMin;

  const innerW = w - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const x = (t: number) => PAD.l + ((t - tMin) / (tMax - tMin || 1)) * innerW;
  const y = (v: number) => PAD.t + (1 - v / 100) * innerH;

  const yTicks = [0, 25, 50, 75, 100];
  const xTickCount = Math.min(6, ref0.length);
  const xTicks = hasData
    ? Array.from(
        { length: xTickCount },
        (_, i) => tMin + ((tMax - tMin) * i) / (xTickCount - 1 || 1),
      )
    : [];

  const hoverIdx =
    hoverX !== null && ref0.length
      ? Math.max(
          0,
          Math.min(
            ref0.length - 1,
            Math.round(((hoverX - PAD.l) / (innerW || 1)) * (ref0.length - 1)),
          ),
        )
      : null;

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverX(((e.clientX - rect.left) / rect.width) * w);
  }

  return (
    <div ref={ref} className="relative w-full">
      <svg
        width={w}
        height={H}
        role="img"
        aria-label="Grafik penggunaan sumber daya"
        onMouseMove={onMove}
        onMouseLeave={() => setHoverX(null)}
      >
        <title>Resource usage over time</title>
        {/* grid + y labels */}
        {yTicks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.l}
              x2={w - PAD.r}
              y1={y(t)}
              y2={y(t)}
              stroke="currentColor"
              className="text-border"
              strokeDasharray="3 3"
              opacity={0.5}
            />
            <text
              x={PAD.l - 6}
              y={y(t) + 3}
              textAnchor="end"
              className="fill-muted-foreground text-[10px]"
            >
              {t}%
            </text>
          </g>
        ))}
        {/* x labels */}
        {xTicks.map((t) => (
          <text
            key={t}
            x={x(t)}
            y={H - 8}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            {fmtTimeAxis(t, range)}
          </text>
        ))}

        {hasData &&
          active.map((s) => {
            const line = s.points.map((p, i) => `${i ? "L" : "M"}${x(p.t)},${y(p.v)}`).join(" ");
            const area = `${line} L${x(s.points[s.points.length - 1].t)},${y(0)} L${x(s.points[0].t)},${y(0)} Z`;
            const gid = `grad-${s.key}`;
            return (
              <g key={s.key}>
                <defs>
                  <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <path d={area} fill={`url(#${gid})`} />
                <path d={line} fill="none" stroke={s.color} strokeWidth={1.75} />
              </g>
            );
          })}

        {/* hover crosshair + points */}
        {hoverIdx !== null && hasData && (
          <g>
            <line
              x1={x(ref0[hoverIdx].t)}
              x2={x(ref0[hoverIdx].t)}
              y1={PAD.t}
              y2={H - PAD.b}
              stroke="currentColor"
              className="text-muted-foreground"
              opacity={0.4}
            />
            {active.map((s) => {
              const p = s.points[hoverIdx] ?? s.points[s.points.length - 1];
              return <circle key={s.key} cx={x(p.t)} cy={y(p.v)} r={3} fill={s.color} />;
            })}
          </g>
        )}

        {!hasData && (
          <text x={w / 2} y={H / 2} textAnchor="middle" className="fill-muted-foreground text-xs">
            Belum ada data untuk rentang ini.
          </text>
        )}
      </svg>

      {/* tooltip */}
      {hoverIdx !== null && hasData && (
        <div
          className="pointer-events-none absolute top-2 rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md"
          style={{
            left: Math.min(w - 150, Math.max(0, x(ref0[hoverIdx].t) + 8)),
          }}
        >
          <div className="mb-1 font-medium text-foreground">
            {fmtTimeAxis(ref0[hoverIdx].t, range === "1h" || range === "6h" ? "24h" : range)}
          </div>
          {active.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.label}:{" "}
              <span className="font-medium text-foreground">
                {(s.points[hoverIdx]?.v ?? 0).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
