import os from "node:os";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireDevSession } from "@/lib/devtools/dev-session";
import { getSeries } from "@/lib/devtools/series";
import {
  METRICS,
  type Metric,
  RANGES,
  type Range,
  type SeriesResponse,
} from "@/lib/devtools/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/devtools/series?metric=cpu|ram|storage&range=1h..1y[&host=…] */
export async function GET(req: Request) {
  const denied = await requireDevSession();
  if (denied) return denied;

  const url = new URL(req.url);
  const metric = url.searchParams.get("metric") as Metric | null;
  const range = url.searchParams.get("range") as Range | null;
  const host = url.searchParams.get("host") ?? os.hostname();

  if (!metric || !METRICS.includes(metric)) {
    return NextResponse.json({ error: "invalid metric" }, { status: 400 });
  }
  if (!range || !RANGES.includes(range)) {
    return NextResponse.json({ error: "invalid range" }, { status: 400 });
  }

  await connectDB();
  const points = await getSeries(host, metric, range);
  const body: SeriesResponse = { metric, range, points };
  return NextResponse.json(body);
}
