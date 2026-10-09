# /devtools — Server Monitoring Setup

The dashboard at `/devtools` shows live + historical metrics of the **VM the app
runs on** (self-hosted `next start` on the GCP Compute Engine instance).

- **Live values** (CPU / RAM / disks / uptime / load) are read on demand by
  `GET /api/devtools/overview`.
- **History** (7d/30d/90d/1y, heatmap, insights, recommendations) is built from
  snapshots the server stores **on its own** every minute (built-in collector).
  The header shows "Data terakhir: …", and an amber banner appears when no
  sample has arrived for 5 minutes.

## 1. Environment variables

In the VM's environment (`/opt/dutafirza/shared/.env`) or `.env.local`:

```bash
DEVTOOLS_PASSWORD="<strong password to open /devbooks + /devtools>"
DEVTOOLS_SESSION_HOURS="8"        # optional, login auto-expires after this
DEVTOOLS_COLLECT_TOKEN="<random>" # optional, only for the external trigger (§2b)
DEVTOOLS_SELF_COLLECT="true"      # optional, see §2a
DEVTOOLS_COLLECT_INTERVAL_S="60"  # optional, default 60, minimum 15
```

## 2. Collector

### 2a. Built-in (default — nothing to install)

`src/instrumentation.ts` starts `src/lib/devtools/self-collect.ts` when the
server boots. Every `DEVTOOLS_COLLECT_INTERVAL_S` it reads the host metrics,
stores a raw snapshot and refreshes the hourly/daily rollups.

| `DEVTOOLS_SELF_COLLECT` | Behaviour |
| ----------------------- | --------- |
| unset                   | On for a self-hosted production server (the VM). Off in `next dev`, on Vercel and during `next build`. |
| `true` / `1`            | Force on (e.g. to test locally). Still off during `next build`. |
| `false` / `0`           | Force off. |

Check it on the VM:

```bash
journalctl -u dutafirza | grep devtools
# [devtools] self-collector on (every 60s)   ← on each start
# [devtools] collect failed: …               ← first failure of a streak (DB/env)
# [devtools] collect recovered               ← back to normal
```

### 2b. External trigger (optional)

`POST /api/devtools/collect` does the same as one tick, for a manual check or an
extra scheduler. It needs `DEVTOOLS_COLLECT_TOKEN`:

```bash
TOKEN=$(sudo grep '^DEVTOOLS_COLLECT_TOKEN=' /opt/dutafirza/shared/.env | cut -d= -f2- | tr -d '"')
curl -sS -X POST -H "x-collect-token: $TOKEN" http://127.0.0.1:3000/api/devtools/collect
# {"ok":true,"ts":"…","host":"dutafirza-prod","cpuPct":…,"memPct":…,"disks":2}
```

Not needed alongside §2a (it would double the samples). If you ever run it from
systemd, load the token with `EnvironmentFile=/opt/dutafirza/shared/.env` and
reference it as `${DEVTOOLS_COLLECT_TOKEN}`. Do **not** use `%E{…}`: `%E` is the
systemd specifier for the config directory (`/etc`), not an env variable, so the
header becomes `/etc{…}` and every call gets 401.

## 3. Retention (automatic)

MongoDB TTL indexes prune data so it never grows unbounded:

| Collection            | Kept    | Powers            |
| --------------------- | ------- | ----------------- |
| `servermetrics`       | 3 days  | 1h / 6h / 24h     |
| `servermetrichourlies`| 120 days| 7d / 30d, heatmap |
| `servermetricdailies` | ~2 years| 90d / 1y, recommendations |

## 4. Seeding demo history (dev only)

To exercise the long ranges without waiting:

```bash
pnpm tsx scripts/seed-devtools.ts
```

Generates ~120 days of daily + 35 days of hourly + 24h of raw data for the
current hostname. **Clears existing metric docs for that host first.**

## 5. Notes

- The app runs with `TZ=Asia/Jakarta` (`deploy/dutafirza.service`), so daily
  buckets, heatmap hours and the "WIB" insight texts line up. GCP images default
  to UTC.
- Disks are one entry per block device. systemd hardening bind-mounts the root
  device again at `/usr`, `/etc`, `/tmp`, … inside the service; those are
  collapsed into `/`.
- Real history accrues over time; until the collector has run for N days, the
  longer ranges show only what exists so far.
- On Linux, RAM uses `/proc/meminfo` `MemAvailable`; disks are enumerated from
  `/proc/mounts` + `statfs`. macOS dev falls back to `vm_stat` / `statfs`.
