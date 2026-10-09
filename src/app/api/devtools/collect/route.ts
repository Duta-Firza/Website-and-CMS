import { NextResponse } from "next/server";
import { verifyCollectToken } from "@/lib/devtools/dev-auth";
import { recordSnapshot } from "@/lib/devtools/self-collect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Optional external trigger. The server already records a snapshot every minute
 * on its own (src/instrumentation.ts → self-collect.ts); this endpoint does the
 * same on demand for an external cron/timer or a manual check:
 *   curl -X POST -H "x-collect-token: <DEVTOOLS_COLLECT_TOKEN>" http://127.0.0.1:3000/api/devtools/collect
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
    const snap = await recordSnapshot();
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
