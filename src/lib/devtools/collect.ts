import { execFile } from "node:child_process";
import { readdir, readFile, statfs } from "node:fs/promises";
import os from "node:os";
import { promisify } from "node:util";
import { pctOf, round1, round2 } from "./metrics-util";

const execFileP = promisify(execFile);

/**
 * Reads a live metrics snapshot of the host the Node process runs on.
 * Prefers Linux `/proc` (the production GCP VM) and falls back to the portable
 * `os`/`statfs` APIs (so it still works in local macOS dev). Never throws —
 * missing sources degrade to zeros/best-effort.
 */

export interface DiskUsage {
  mount: string;
  usedB: number;
  totalB: number;
  pct: number;
}

export interface Snapshot {
  host: string;
  ts: Date;
  cpuPct: number;
  cores: number;
  cpuModel: string;
  arch: string;
  kernel: string;
  platform: string;
  load1: number;
  load5: number;
  load15: number;
  memUsedB: number;
  memTotalB: number;
  swapUsedB: number;
  swapTotalB: number;
  uptimeS: number;
  disks: DiskUsage[];
  storageUsedB: number;
  storageTotalB: number;
  procCount: number;
  netRxB: number;
  netTxB: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Busy-percentage across all cores, sampled over a short window. */
async function cpuPercent(windowMs = 150): Promise<number> {
  const a = os.cpus();
  await sleep(windowMs);
  const b = os.cpus();
  let idle = 0;
  let total = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const ta = a[i].times;
    const tb = b[i].times;
    const idleD = tb.idle - ta.idle;
    const totalD =
      tb.user +
      tb.nice +
      tb.sys +
      tb.idle +
      tb.irq -
      (ta.user + ta.nice + ta.sys + ta.idle + ta.irq);
    idle += idleD;
    total += totalD;
  }
  return total > 0 ? round1((1 - idle / total) * 100) : 0;
}

async function memory(): Promise<{
  usedB: number;
  totalB: number;
  swapUsedB: number;
  swapTotalB: number;
}> {
  try {
    const txt = await readFile("/proc/meminfo", "utf8");
    const kb = (key: string) => {
      const line = txt.split("\n").find((l) => l.startsWith(key));
      const m = line ? /(\d+)/.exec(line) : null;
      return m ? Number(m[1]) * 1024 : 0;
    };
    const total = kb("MemTotal:");
    const avail = kb("MemAvailable:");
    const swapTotal = kb("SwapTotal:");
    const swapFree = kb("SwapFree:");
    if (total > 0) {
      return {
        usedB: total - avail,
        totalB: total,
        swapUsedB: swapTotal - swapFree,
        swapTotalB: swapTotal,
      };
    }
  } catch {
    // not linux — fall through
  }
  // macOS (local dev): os.freemem() ignores cache and reads ~0, so use vm_stat.
  if (process.platform === "darwin") {
    try {
      const { stdout } = await execFileP("vm_stat");
      const pageSize = Number(/page size of (\d+)/.exec(stdout)?.[1] ?? 4096);
      const pages = (key: string) => Number(new RegExp(`${key}:\\s+(\\d+)`).exec(stdout)?.[1] ?? 0);
      const used =
        (pages("Pages active") +
          pages("Pages wired down") +
          pages("Pages occupied by compressor")) *
        pageSize;
      const total = os.totalmem();
      if (used > 0 && used <= total) {
        return { usedB: used, totalB: total, swapUsedB: 0, swapTotalB: 0 };
      }
    } catch {
      // fall through to os fallback
    }
  }
  const total = os.totalmem();
  return { usedB: total - os.freemem(), totalB: total, swapUsedB: 0, swapTotalB: 0 };
}

async function listMounts(): Promise<string[]> {
  try {
    const txt = await readFile("/proc/mounts", "utf8");
    const skip = new Set([
      "proc",
      "sysfs",
      "tmpfs",
      "devtmpfs",
      "devpts",
      "cgroup",
      "cgroup2",
      "overlay",
      "squashfs",
      "mqueue",
      "debugfs",
      "tracefs",
      "securityfs",
      "pstore",
      "bpf",
      "autofs",
      "hugetlbfs",
      "configfs",
      "fusectl",
      "ramfs",
      "nsfs",
      "binfmt_misc",
      "efivarfs",
    ]);
    const seen = new Set<string>();
    const out: string[] = [];
    for (const line of txt.split("\n")) {
      const [dev, mount, fstype] = line.split(" ");
      if (!dev || !mount || !fstype) continue;
      if (skip.has(fstype)) continue;
      if (!dev.startsWith("/dev/")) continue;
      if (seen.has(mount)) continue;
      seen.add(mount);
      out.push(mount);
    }
    if (out.length) return out;
  } catch {
    // not linux
  }
  return ["/"];
}

async function disks(): Promise<DiskUsage[]> {
  const mounts = await listMounts();
  const out: DiskUsage[] = [];
  for (const mount of mounts) {
    try {
      const s = await statfs(mount);
      const totalB = Number(s.blocks) * s.bsize;
      const freeB = Number(s.bfree) * s.bsize;
      const usedB = totalB - freeB;
      if (totalB > 0) out.push({ mount, usedB, totalB, pct: pctOf(usedB, totalB) });
    } catch {
      // skip unreadable mount
    }
  }
  return out;
}

async function network(): Promise<{ rx: number; tx: number }> {
  try {
    const txt = await readFile("/proc/net/dev", "utf8");
    let rx = 0;
    let tx = 0;
    for (const line of txt.split("\n")) {
      const m = /^\s*([^:]+):\s*(.*)$/.exec(line);
      if (!m) continue;
      const iface = m[1].trim();
      if (iface === "lo") continue;
      const cols = m[2].trim().split(/\s+/).map(Number);
      rx += cols[0] || 0;
      tx += cols[8] || 0;
    }
    return { rx, tx };
  } catch {
    return { rx: 0, tx: 0 };
  }
}

async function processCount(): Promise<number> {
  try {
    const entries = await readdir("/proc");
    return entries.filter((e) => /^\d+$/.test(e)).length;
  } catch {
    return 0;
  }
}

export async function collect(): Promise<Snapshot> {
  const [cpuPct, mem, disksList, net, procCount] = await Promise.all([
    cpuPercent(),
    memory(),
    disks(),
    network(),
    processCount(),
  ]);
  const cpus = os.cpus();
  const [load1, load5, load15] = os.loadavg();
  const storageUsedB = disksList.reduce((s, d) => s + d.usedB, 0);
  const storageTotalB = disksList.reduce((s, d) => s + d.totalB, 0);

  return {
    host: os.hostname(),
    ts: new Date(),
    cpuPct,
    cores: cpus.length,
    cpuModel: cpus[0]?.model?.trim() ?? "unknown",
    arch: os.arch(),
    kernel: os.release(),
    platform: os.platform(),
    load1: round2(load1),
    load5: round2(load5),
    load15: round2(load15),
    memUsedB: mem.usedB,
    memTotalB: mem.totalB,
    swapUsedB: mem.swapUsedB,
    swapTotalB: mem.swapTotalB,
    uptimeS: Math.round(os.uptime()),
    disks: disksList,
    storageUsedB,
    storageTotalB,
    procCount,
    netRxB: net.rx,
    netTxB: net.tx,
  };
}
