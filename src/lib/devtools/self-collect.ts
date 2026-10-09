import { connectDB } from "@/lib/db";
import { ServerMetric } from "@/models";
import { collect, type Snapshot } from "./collect";
import { rollup } from "./rollup";

/**
 * Built-in metrics collector for /devtools. Started from `src/instrumentation.ts`
 * so the server records its own history every minute — no cron/systemd timer on
 * the VM. `POST /api/devtools/collect` stays as an optional external trigger and
 * shares `recordSnapshot()` with this loop.
 */

const DEFAULT_INTERVAL_S = 60;
const MIN_INTERVAL_S = 15;
const FIRST_TICK_MS = 15_000;

type EnvLike = Record<string, string | undefined>;

declare global {
  // eslint-disable-next-line no-var
  var devtoolsCollector: ReturnType<typeof setInterval> | undefined;
}

/** Store one raw snapshot and refresh the current hour + day rollups. */
export async function recordSnapshot(): Promise<Snapshot> {
  await connectDB();
  const snap = await collect();
  await ServerMetric.create(snap);
  await rollup(snap.host, snap.ts);
  return snap;
}

/**
 * Never during `next build`. Otherwise `DEVTOOLS_SELF_COLLECT` decides; when
 * unset, on only for a self-hosted production server (the VM) — not on Vercel,
 * where lambdas would write metrics for throwaway hosts into the dev DB.
 */
export function isSelfCollectEnabled(env: EnvLike): boolean {
  if (env.NEXT_PHASE === "phase-production-build") return false;
  const flag = env.DEVTOOLS_SELF_COLLECT?.trim().toLowerCase();
  if (flag === "true" || flag === "1") return true;
  if (flag === "false" || flag === "0") return false;
  return env.NODE_ENV === "production" && !env.VERCEL;
}

export function collectIntervalMs(env: EnvLike): number {
  const n = Number(env.DEVTOOLS_COLLECT_INTERVAL_S);
  const s = Number.isFinite(n) && n > 0 ? Math.max(MIN_INTERVAL_S, n) : DEFAULT_INTERVAL_S;
  return s * 1000;
}

export function startSelfCollector(): void {
  if (globalThis.devtoolsCollector) return;
  const intervalMs = collectIntervalMs(process.env);
  let running = false;
  let failing = false;

  // Log only the first failure of a streak and the recovery, so a DB outage
  // doesn't write one journald line per minute.
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await recordSnapshot();
      if (failing) console.info("[devtools] collect recovered");
      failing = false;
    } catch (e) {
      if (!failing) console.error("[devtools] collect failed:", e instanceof Error ? e.message : e);
      failing = true;
    } finally {
      running = false;
    }
  };

  setTimeout(() => void tick(), FIRST_TICK_MS).unref();
  const timer = setInterval(() => void tick(), intervalMs);
  timer.unref();
  globalThis.devtoolsCollector = timer;
  console.info(`[devtools] self-collector on (every ${intervalMs / 1000}s)`);
}
