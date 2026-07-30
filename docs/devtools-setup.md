# /devtools — Server Monitoring Setup

The dashboard at `/devtools` shows live + historical metrics of the **VM the app
runs on** (self-hosted `next start` on the GCP Compute Engine instance).

- **Live values** (CPU / RAM / disks / uptime / load) are read on demand by
  `GET /api/devtools/overview`.
- **History** (7d/30d/90d/1y, heatmap, insights, recommendations) is built from
  snapshots stored by a periodic collector. Set that up below.

## 1. Environment variables

In the VM's environment (or `.env.local`):

```bash
DEVTOOLS_PASSWORD="<strong password to open /devbooks + /devtools>"
DEVTOOLS_COLLECT_TOKEN="<random, e.g. openssl rand -hex 32>"
DEVTOOLS_SESSION_HOURS="8"   # optional, login auto-expires after this
```

## 2. Periodic collector (choose ONE)

The collector just POSTs to the app with the token; the app reads the host
metrics and writes a snapshot + refreshes the hourly/daily rollups.

### Option A — systemd timer (recommended)

`/etc/systemd/system/devtools-collect.service`:

```ini
[Unit]
Description=Collect server metrics for /devtools
After=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/bin/curl -fsS -X POST \
  -H "x-collect-token: %E{DEVTOOLS_COLLECT_TOKEN}" \
  http://127.0.0.1:3000/api/devtools/collect
Environment=DEVTOOLS_COLLECT_TOKEN=REPLACE_ME
```

`/etc/systemd/system/devtools-collect.timer`:

```ini
[Unit]
Description=Run devtools metrics collector every minute

[Timer]
OnBootSec=1min
OnUnitActiveSec=1min
AccuracySec=5s

[Install]
WantedBy=timers.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now devtools-collect.timer
systemctl list-timers | grep devtools   # verify
```

### Option B — cron

```cron
* * * * * curl -fsS -X POST -H "x-collect-token: <TOKEN>" http://127.0.0.1:3000/api/devtools/collect >/dev/null 2>&1
```

> One sample/minute → 12 raw points per 5-min bucket, matching the "Raw data
> points" view. Every 5 minutes is also fine; adjust to taste.

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

- The collector target is `127.0.0.1:3000` (same VM). Adjust the port if the app
  runs elsewhere.
- Real history accrues over time; until the collector has run for N days, the
  longer ranges show only what exists so far.
- On Linux, RAM uses `/proc/meminfo` `MemAvailable`; disks are enumerated from
  `/proc/mounts` + `statfs`. macOS dev falls back to `vm_stat` / `statfs`.
