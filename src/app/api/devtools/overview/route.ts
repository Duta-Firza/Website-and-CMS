import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getHeatmap, getInsights, getRecommendations } from "@/lib/devtools/analysis";
import { collect } from "@/lib/devtools/collect";
import { requireDevSession } from "@/lib/devtools/dev-session";
import { pctOf } from "@/lib/devtools/metrics-util";
import type { OverviewResponse } from "@/lib/devtools/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Current snapshot + host info + insights + recommendations + heatmap. */
export async function GET() {
  const denied = await requireDevSession();
  if (denied) return denied;

  await connectDB();
  const snap = await collect();
  const [insights, recs, heatmap] = await Promise.all([
    getInsights(snap.host),
    getRecommendations(snap.host, {
      cores: snap.cores,
      memTotalB: snap.memTotalB,
      storageUsedB: snap.storageUsedB,
      storageTotalB: snap.storageTotalB,
    }),
    getHeatmap(snap.host),
  ]);

  const body: OverviewResponse = {
    host: snap.host,
    platform: snap.platform,
    kernel: snap.kernel,
    arch: snap.arch,
    cpuModel: snap.cpuModel,
    cores: snap.cores,
    updatedAt: +snap.ts,
    uptimeS: snap.uptimeS,
    cpu: { pct: snap.cpuPct },
    ram: {
      usedB: snap.memUsedB,
      totalB: snap.memTotalB,
      pct: pctOf(snap.memUsedB, snap.memTotalB),
    },
    swap: {
      usedB: snap.swapUsedB,
      totalB: snap.swapTotalB,
      pct: pctOf(snap.swapUsedB, snap.swapTotalB),
    },
    storage: {
      usedB: snap.storageUsedB,
      totalB: snap.storageTotalB,
      pct: pctOf(snap.storageUsedB, snap.storageTotalB),
      diskCount: snap.disks.length,
    },
    load: { one: snap.load1, five: snap.load5, fifteen: snap.load15 },
    disks: snap.disks,
    procCount: snap.procCount,
    net: { rxB: snap.netRxB, txB: snap.netTxB },
    dailySummaries: recs.dailySummaries,
    insights,
    recommendations: recs.recommendations,
    heatmap,
  };

  return NextResponse.json(body);
}
