import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { collect } from "@/lib/devtools/collect";
import { verifyCollectToken } from "@/lib/devtools/dev-auth";
import { rollup } from "@/lib/devtools/rollup";
import { ServerMetric } from "@/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Called by the VM's cron/systemd timer every ~1–5 min:
 *   curl -H "x-collect-token: <DEVTOOLS_COLLECT_TOKEN>" https://…/api/devtools/collect
 * Stores a raw snapshot and refreshes the current hour + day rollups.
 */
export async function POST(req: Request) {
  const token =
    req.headers.get("x-collect-token") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!verifyCollectToken(token)) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    await connectDB();
    const snap = await collect();
    await ServerMetric.create(snap);
    await rollup(snap.host, snap.ts);
    return NextResponse.json({
      ok: true,
      ts: snap.ts,
      host: snap.host,
      cpuPct: snap.cpuPct,
      memPct: snap.memTotalB ? Math.round((snap.memUsedB / snap.memTotalB) * 100) : 0,
      disks: snap.disks.length,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "COLLECT_FAILED" },
      { status: 500 },
    );
  }
}
