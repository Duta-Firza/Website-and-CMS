# Deployment — Duta Firza (GCP VM)

Panduan lengkap provisioning **VM baru** untuk menjalankan aplikasi ini di production.
Ikuti berurutan: **Prasyarat → Variabel → B1 … B8 → GitHub Actions → Deploy pertama**.

## Arsitektur singkat

- **Branch `main` → VM GCP** lewat GitHub Actions (`.github/workflows/deploy-production.yml`).
  CI yang `next build` (mode `output: standalone`), lalu `rsync` bundle ke VM. **VM tidak pernah build** —
  hanya menjalankan `node server.js` via systemd. Ini menghindari OOM di instance kecil.
- **Branch `development` → Vercel** (integrasi Git bawaan Vercel — tidak ada workflow tambahan).
- **Media (gambar/PDF/video) → Google Cloud Storage**, bukan disk VM. URL disajikan publik langsung.
- **MongoDB** self-host di VM yang sama, data di **SSD persistent disk terpisah**, bind localhost.

```
GitHub (push main) ──build standalone──▶ rsync ──▶ /opt/dutafirza/releases/<sha>
                                                        │  ln -sfn
                                                        ▼
                        systemd: dutafirza ──▶ node /opt/dutafirza/current/server.js  (127.0.0.1:3000)
                                                        ▲
                                          nginx (443/TLS) ──proxy──┘
```

## Spesifikasi VM

| Item | Rekomendasi |
|------|-------------|
| Machine type | **Minimum GCP `e2-small`** (2 vCPU shared, **2 GB RAM**). `e2-micro` (1 GB) tidak disarankan bila MongoDB co-located. |
| Setara provider lain | DigitalOcean Basic 2 GB · Vultr/Linode 2 GB · AWS `t3.small`/`t4g.small` · Contabo VPS S |
| Boot disk | **10 GB SSD** (`pd-ssd`) |
| Data disk (MongoDB) | **10 GB SSD** (`pd-ssd`), terpisah dari boot |
| OS | **Debian 12 (bookworm)** atau **Ubuntu 24.04 LTS (noble)** / 22.04 (jammy). ⚠️ Hindari **Ubuntu 26.04** — belum didukung MongoDB 8.x. |
| Region | `asia-southeast2` (Jakarta) |

> **Distro yang didukung MongoDB 8.x**: Debian 12 (bookworm) / 13 (trixie), Ubuntu 22.04 (jammy) / 24.04 (noble).
> Repo MongoDB belum menyediakan paket untuk Ubuntu 26.04, jadi pilih salah satu di atas saat membuat VM.

## Versi runtime (per Jul 2026)

- **MongoDB 8.3.7** (seri 8.3 — versi terbaru)
- **Node.js 24 LTS** — samakan persis dengan CI (`.github/workflows/*` memakai `node-version: 24`)

---

## Cara baca panduan ini — konteks tiap perintah

Setiap langkah diberi label **di mana** perintah dijalankan. Perhatikan ikonnya:

| Label | Dijalankan di | Via apa |
|-------|---------------|---------|
| 🖥️ **DEV** | Terminal mesin lokal kamu, di dalam root repo | shell biasa (butuh repo ter-clone) |
| ☁️ **GCLOUD** | Mesin lokal **atau** [Cloud Shell](https://console.cloud.google.com) | perintah `gcloud` (butuh login + project aktif) |
| 🔒 **VM** | Di dalam VM | masuk dengan `gcloud compute ssh dutafirza-prod --zone=asia-southeast2-a` |
| 🍃 **MONGOSH** | Di dalam prompt `mongosh` pada VM | bahasa JavaScript, bukan bash |
| 🌐 **WEB** | Browser | GitHub UI / GCP Console / panel DNS domain |

> **Cara masuk VM** (dipakai di semua langkah 🔒): dari 🖥️ DEV atau ☁️ Cloud Shell jalankan
> `gcloud compute ssh dutafirza-prod --zone=asia-southeast2-a`. Dengan cara ini kamu **tidak perlu tahu
> IP atau username** — gcloud mengurus key & login otomatis. `<VM_IP>`/`<user>` hanya diperlukan untuk
> konfigurasi CI (lihat tabel variabel).

---

## Prasyarat di mesin dev (lakukan sekali)

**🖥️ DEV** — siapkan tools & kredensial sebelum menyentuh VM:

```bash
# 1. Google Cloud CLI terpasang & login. https://cloud.google.com/sdk/docs/install
gcloud --version
gcloud auth login
gcloud config set project <PROJECT_ID>          # lihat tabel variabel di bawah
gcloud config set compute/zone asia-southeast2-a

# 2. Repo ter-clone (semua perintah 🖥️ DEV dijalankan dari sini).
git clone https://github.com/Duta-Firza/Website-and-CMS.git
cd Website-and-CMS

# 3. Buat keypair khusus CI (BUKAN key pribadimu). Tanpa passphrase agar dipakai GitHub Actions.
ssh-keygen -t ed25519 -f ~/.ssh/dutafirza_deploy -C "ci-deploy" -N ""
#   → ~/.ssh/dutafirza_deploy       (private, nanti jadi GitHub secret SSH_PRIVATE_KEY)
#   → ~/.ssh/dutafirza_deploy.pub   (public,  nanti ke authorized_keys user `deploy` di VM)
```

Selain itu siapkan **akun pihak ketiga**: domain `dutafirza.com` (akses panel DNS), akun
[Resend](https://resend.com) (untuk email), dan tentukan password/secret sesuai tabel berikut.

---

## Variabel yang dipakai & dari mana nilainya

Ganti setiap `<...>` di perintah dengan nilai berikut. Nilai yang perlu kamu **buat sendiri** →
generate acak, jangan pakai contoh apa adanya.

| Placeholder | Arti | Cara dapat / tentukan |
|-------------|------|------------------------|
| `<PROJECT_ID>` | ID project GCP | ☁️ `gcloud projects list`, atau lihat di GCP Console pojok kiri atas |
| `<VM_IP>` | IP eksternal VM | ☁️ `gcloud compute instances describe dutafirza-prod --zone=asia-southeast2-a --format='get(networkInterfaces[0].accessConfigs[0].natIP)'` (setelah B1) |
| `<user>` | Username SSH-mu di VM | Otomatis bila pakai `gcloud compute ssh`. Untuk CI dipakai user literal **`deploy`** (dibuat di B6) |
| `<STRONG_PW>` | Password admin MongoDB | Buat sendiri: 🖥️ `openssl rand -base64 24` |
| `<APP_PW>` | Password user aplikasi MongoDB (`duta-app`) | Buat sendiri: 🖥️ `openssl rand -base64 24` |
| `<NEXTAUTH_SECRET>` | Secret sesi NextAuth (≥32 char) | Buat sendiri: 🖥️ `openssl rand -base64 32` |
| `<RESEND_API_KEY>` | API key kirim email | 🌐 Dashboard Resend → **API Keys** → Create |
| `<RESEND_FROM_EMAIL>` | Alamat pengirim terverifikasi | 🌐 Resend → domain terverifikasi, mis. `no-reply@dutafirza.com` |
| `<INQUIRY_TO_EMAIL>` / `<CONTACT_TO_EMAIL>` | Tujuan email form | Tentukan sendiri, mis. `info@dutafirza.com` |
| `<DEVTOOLS_PASSWORD>` / `<DEVTOOLS_COLLECT_TOKEN>` | Gate area `/devtools` | Buat sendiri: 🖥️ `openssl rand -hex 16` |
| `<SEED_ADMIN_EMAIL>` / `<SEED_ADMIN_PASSWORD>` | Kredensial super-admin awal | Tentukan sendiri (dipakai login `/admin` pertama kali) |
| `<sha-lama>` | Nama folder release sebelumnya (rollback) | 🔒 `ls -1dt /opt/dutafirza/releases/*/` |

**Nilai tetap** (boleh diganti bila mau, tapi konsisten di semua perintah): instance `dutafirza-prod`,
zona `asia-southeast2-a`, bucket `duta-firza-media`, domain `dutafirza.com`, data disk `dutafirza-mongo`.

---

## B1. Provisioning VM

**☁️ GCLOUD** · Prasyarat: Prasyarat DEV selesai (gcloud login + project aktif).

```bash
gcloud compute instances create dutafirza-prod \
  --zone=asia-southeast2-a --machine-type=e2-small \
  --image-family=debian-12 --image-project=debian-cloud \
  --boot-disk-size=10GB --boot-disk-type=pd-ssd \
  --create-disk=name=dutafirza-mongo,size=10GB,type=pd-ssd,auto-delete=no \
  --tags=http-server,https-server
```

Untuk **Ubuntu 24.04 LTS** ganti dua flag image (jangan pakai `ubuntu-2604` — MongoDB 8.x belum mendukungnya):

```bash
  --image-family=ubuntu-2404-lts-amd64 --image-project=ubuntu-os-cloud
```

**☁️ GCLOUD** · Firewall — izinkan HTTP/HTTPS ke VM (sekali per project; SSH sudah diizinkan default network):

```bash
gcloud compute firewall-rules create dutafirza-allow-web \
  --direction=INGRESS --action=ALLOW --rules=tcp:80,tcp:443 \
  --target-tags=http-server,https-server
```

- **Jangan** buat rule untuk **27017** — MongoDB hanya localhost.
- Pertimbangkan **reserve static external IP** agar `<VM_IP>` tidak berubah saat VM restart:
  `gcloud compute addresses create dutafirza-ip --region=asia-southeast2` lalu assign ke instance.

---

## B1b. Salin file konfigurasi `deploy/` ke VM

**🖥️ DEV → 🔒 VM** · Prasyarat: B1 selesai (VM sudah ada).

File `deploy/*.conf` & `deploy/*.service` ada di **repo (mesin dev)**, bukan di VM — bundle
`standalone` yang dikirim CI tidak menyertakannya. Kirim sekali via gcloud (tidak perlu IP/user):

```bash
# dari 🖥️ DEV, di root repo
gcloud compute scp --recurse --zone=asia-southeast2-a deploy/ dutafirza-prod:~/deploy
```

> ⚠️ Semua perintah `sudo cp deploy/...` di B3/B6/B7 dijalankan **dari home dir (`~`) pada VM**,
> tempat folder `deploy/` tadi berada. Kalau tidak, muncul `cp: cannot stat 'deploy/...': No such file or directory`.

Lalu masuk VM untuk langkah berikutnya:

```bash
gcloud compute ssh dutafirza-prod --zone=asia-southeast2-a
```

---

## B2. Format & mount SSD data disk untuk MongoDB

**🔒 VM** · Prasyarat: sudah di dalam VM. Verifikasi dulu ada 2 disk lewat `lsblk`.

```bash
lsblk                                    # cari device data disk, mis. /dev/sdb (yang belum ada mountpoint)
sudo mkfs.ext4 -m 0 -F -E lazy_itable_init=0,lazy_journal_init=0,discard /dev/sdb
sudo mkdir -p /var/lib/mongodb-data
sudo mount -o discard,defaults /dev/sdb /var/lib/mongodb-data

# Persist di /etc/fstab (pakai UUID, bukan nama device yang bisa berubah):
DISK_UUID=$(sudo blkid -s UUID -o value /dev/sdb)
echo "UUID=$DISK_UUID /var/lib/mongodb-data ext4 discard,defaults,nofail 0 2" | sudo tee -a /etc/fstab
```

- ⚠️ Pastikan `/dev/sdb` benar-benar data disk kosong (bukan boot disk `/dev/sda`) — `mkfs` menghapus isinya.
- `discard` → TRIM aktif (SSD lebih cepat & awet). `nofail` → boot tidak macet bila disk lepas.

---

## B3. Install & konfigurasi MongoDB 8.3 (data di SSD)

**🔒 VM** · Prasyarat: B2 selesai (disk ter-mount di `/var/lib/mongodb-data`).

Repo MongoDB **berbeda** antara Debian (`apt/debian … main`) dan Ubuntu (`apt/ubuntu … multiverse`).
Skrip berikut **mendeteksi distro otomatis**, memilih repo yang benar, dan menolak distro yang belum didukung
(mis. Ubuntu 26.04) supaya tidak salah pasang. Tempel apa adanya:

```bash
# Seri MongoDB. 8.3 = rapid release (fitur terbaru). Untuk dukungan jangka
# panjang, ganti ke MONGO_SERIES=8.0 (LTS) — langkah lainnya identik.
MONGO_SERIES=8.3
# Rapid release (8.1/8.2/8.3) TIDAK punya key sendiri; pakai key seri basis .0.
MONGO_KEY_SERIES="${MONGO_SERIES%.*}.0"          # 8.3 -> 8.0 ; 8.0 -> 8.0 ; 7.0 -> 7.0
KEYRING="/usr/share/keyrings/mongodb-server-${MONGO_KEY_SERIES}.gpg"

. /etc/os-release
case "$ID:${VERSION_CODENAME:-}" in
  debian:bookworm|debian:trixie)
    MONGO_REPO="deb [ signed-by=${KEYRING} ] https://repo.mongodb.org/apt/debian ${VERSION_CODENAME}/mongodb-org/${MONGO_SERIES} main" ;;
  ubuntu:jammy|ubuntu:noble)
    MONGO_REPO="deb [ arch=amd64,arm64 signed-by=${KEYRING} ] https://repo.mongodb.org/apt/ubuntu ${VERSION_CODENAME}/mongodb-org/${MONGO_SERIES} multiverse" ;;
  *)
    echo "✗ $PRETTY_NAME belum didukung MongoDB ${MONGO_SERIES}." >&2
    echo "  Pakai Debian 12/13 atau Ubuntu 22.04/24.04 LTS." >&2
    exit 1 ;;
esac

sudo apt install -y gnupg curl
sudo rm -f "$KEYRING"
curl -fsSL "https://pgp.mongodb.com/server-${MONGO_KEY_SERIES}.asc" | \
  sudo gpg --dearmor -o "$KEYRING"
echo "$MONGO_REPO" | sudo tee "/etc/apt/sources.list.d/mongodb-org-${MONGO_SERIES}.list"
sudo apt update
sudo apt install -y mongodb-org
echo "mongodb-org hold" | sudo dpkg --set-selections
```

> Butuh patch spesifik? Ganti baris install jadi
> `sudo apt install -y mongodb-org=8.3.7 mongodb-org-server=8.3.7 mongodb-org-database=8.3.7 mongodb-org-mongos=8.3.7 mongodb-org-tools=8.3.7 mongodb-mongosh`.

**🔒 VM** — set ownership data dir & pasang config (bind localhost, dbPath SSD, cache 0.5 GB, auth).
Dijalankan **dari `~`** (tempat `deploy/` dari B1b):

```bash
cd ~
sudo chown -R mongodb:mongodb /var/lib/mongodb-data
sudo cp deploy/mongod-dutafirza.conf /etc/mongod.conf
sudo systemctl enable --now mongod
sudo systemctl status mongod --no-pager      # pastikan "active (running)"
```

**🍃 MONGOSH** · Prasyarat: mongod running. Buat user **sebelum** akses terkunci (localhost exception
berlaku sampai user pertama dibuat). Ganti `<STRONG_PW>` & `<APP_PW>` sesuai tabel variabel:

```bash
mongosh                                       # 🔒 VM: membuka prompt 🍃 MONGOSH
```
```js
use admin
db.createUser({ user: "admin", pwd: "<STRONG_PW>", roles: ["root"] })
use dutafirza
db.createUser({ user: "duta-app", pwd: "<APP_PW>", roles: [{ role: "readWrite", db: "dutafirza" }] })
exit
```

`MONGODB_URI` yang terbentuk (dipakai di `.env` runtime B6 & seeding B8):
```
mongodb://duta-app:<APP_PW>@127.0.0.1:27017/dutafirza?authSource=dutafirza
```

---

## B4. Swap + Node.js 24 + rsync + ghostscript

**🔒 VM** · Prasyarat: sudah di dalam VM.

```bash
# Swap 2 GB — jaring pengaman spike RAM (sharp/ffmpeg).
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab

# Node.js 24 LTS (NodeSource) — jalan di Debian & Ubuntu.
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs

# rsync WAJIB — workflow deploy mengirim bundle ke VM lewat rsync, dan rsync
# harus ada di KEDUA ujung. Tanpa ini deploy gagal: "rsync: command not found".
# ghostscript OPSIONAL — kompresi PDF (kalau absen, fallback pdf-lib tetap jalan).
sudo apt install -y rsync ghostscript

node --version                                 # konfirmasi v24.x
```

> Pastikan `which node` = `/usr/bin/node` (dipakai di `deploy/dutafirza.service`). Kalau pakai nvm, sesuaikan `ExecStart`.

---

## B5. Setup Google Cloud Storage

**☁️ GCLOUD** · Prasyarat: gcloud login + project aktif. Bisa dari 🖥️ DEV atau Cloud Shell (tidak perlu di VM).

App menyajikan media lewat URL **publik langsung** (`https://storage.googleapis.com/<bucket>/<obj>`),
bukan signed URL → bucket **wajib public-read**. Ganti `<PROJECT_ID>` sesuai tabel variabel:

```bash
# Bucket regional, uniform bucket-level access. Nama bucket harus unik global.
gcloud storage buckets create gs://duta-firza-media \
  --location=asia-southeast2 --uniform-bucket-level-access

# Public-read untuk semua objek.
gcloud storage buckets add-iam-policy-binding gs://duta-firza-media \
  --member=allUsers --role=roles/storage.objectViewer

# Service account khusus app — akses tulis/hapus hanya di bucket ini.
gcloud iam service-accounts create dutafirza-storage
gcloud storage buckets add-iam-policy-binding gs://duta-firza-media \
  --member=serviceAccount:dutafirza-storage@<PROJECT_ID>.iam.gserviceaccount.com \
  --role=roles/storage.objectAdmin

# Key JSON → base64 untuk env GCS_CREDENTIALS_JSON, lalu HAPUS file key.
gcloud iam service-accounts keys create key.json \
  --iam-account=dutafirza-storage@<PROJECT_ID>.iam.gserviceaccount.com
base64 -w0 key.json    # 🖥️ salin OUTPUT panjang ini → nilai GCS_CREDENTIALS_JSON di B6
rm -f key.json         # jangan simpan file key di disk
```

> `base64 -w0` tersedia di Linux. Di macOS pakai `base64 -i key.json | tr -d '\n'`.
> Opsional: set `GCS_PUBLIC_URL_BASE` bila memakai Cloud CDN / custom domain untuk media.

---

## B6. Struktur app, user deploy, systemd

**🔒 VM** · Prasyarat: B4 selesai (Node terpasang), punya isi `GCS_CREDENTIALS_JSON` dari B5 & password dari B3.

```bash
# User deploy non-root (dipakai CI untuk rsync + restart).
sudo adduser --disabled-password --gecos "" deploy
sudo mkdir -p /opt/dutafirza/{releases,shared}
sudo chown -R deploy:deploy /opt/dutafirza
sudo -u deploy mkdir -p /home/deploy/.ssh && sudo -u deploy chmod 700 /home/deploy/.ssh
```

**🔒 VM** — pasang **public key CI** (`~/.ssh/dutafirza_deploy.pub` dari Prasyarat DEV) ke user `deploy`.
Cara termudah, jalankan **🖥️ DEV** ini lalu paste hasilnya:

```bash
# 🖥️ DEV: tampilkan public key untuk disalin
cat ~/.ssh/dutafirza_deploy.pub
```
```bash
# 🔒 VM: tempelkan baris public key tadi ke authorized_keys milik deploy
echo "<PASTE_PUBLIC_KEY>" | sudo tee -a /home/deploy/.ssh/authorized_keys
sudo chown deploy:deploy /home/deploy/.ssh/authorized_keys
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

**🔒 VM** — tulis **runtime env** `/opt/dutafirza/shared/.env` (chmod 600, milik `deploy`) — TIDAK di GitHub.
Isi tiap `<...>` dari tabel variabel & hasil B3/B5:

```bash
sudo -u deploy tee /opt/dutafirza/shared/.env > /dev/null <<'EOF'
MONGODB_URI=mongodb://duta-app:<APP_PW>@127.0.0.1:27017/dutafirza?authSource=dutafirza
NEXTAUTH_SECRET=<NEXTAUTH_SECRET>
NEXTAUTH_URL=https://dutafirza.com
RESEND_API_KEY=<RESEND_API_KEY>
RESEND_FROM_EMAIL=<RESEND_FROM_EMAIL>
INQUIRY_TO_EMAIL=<INQUIRY_TO_EMAIL>
CONTACT_TO_EMAIL=<CONTACT_TO_EMAIL>
# APPLICATIONS_TO_EMAIL=<opsional>
NEXT_PUBLIC_SITE_URL=https://dutafirza.com
# NEXT_PUBLIC_UMAMI_WEBSITE_ID / _SHARE_URL / _SCRIPT_URL  (opsional)
GCS_PROJECT_ID=<PROJECT_ID>
GCS_BUCKET=duta-firza-media
# GCS_FOLDER=<opsional prefix>
GCS_CREDENTIALS_JSON=<base64 dari B5>
# GCS_PUBLIC_URL_BASE=<opsional CDN base>
DEVTOOLS_PASSWORD=<DEVTOOLS_PASSWORD>
DEVTOOLS_COLLECT_TOKEN=<DEVTOOLS_COLLECT_TOKEN>
DEVTOOLS_SESSION_HOURS=12
EOF
sudo chmod 600 /opt/dutafirza/shared/.env
```

> ⚠️ Heredoc `<<'EOF'` **tidak** mengganti `<...>` otomatis — edit file setelahnya
> (`sudo -u deploy nano /opt/dutafirza/shared/.env`) dan isi nilai sebenarnya.

**🔒 VM** — systemd service + izin restart untuk CI (dijalankan dari `~`):

```bash
cd ~
sudo cp deploy/dutafirza.service /etc/systemd/system/dutafirza.service
sudo systemctl daemon-reload
sudo systemctl enable dutafirza          # start-nya setelah deploy pertama mengisi current/

# Sudoers: izinkan user deploy restart service tanpa password (dipakai workflow).
echo 'deploy ALL=(root) NOPASSWD: /bin/systemctl restart dutafirza' | \
  sudo tee /etc/sudoers.d/dutafirza-deploy
sudo chmod 440 /etc/sudoers.d/dutafirza-deploy
```

---

## B7. Reverse proxy + TLS + DNS

**🌐 WEB** · Prasyarat: punya `<VM_IP>` (dari tabel variabel). **Lakukan DNS dulu** — certbot butuh domain
sudah mengarah ke VM. Di panel DNS domain: buat **A record** `dutafirza.com` → `<VM_IP>`, dan `www` → `<VM_IP>`.
Tunggu propagasi (cek: `dig +short dutafirza.com`).

**🔒 VM** · Prasyarat: DNS sudah mengarah, dijalankan dari `~`:

```bash
cd ~
sudo apt install -y nginx
sudo cp deploy/nginx-dutafirza.conf /etc/nginx/sites-available/dutafirza
sudo ln -s /etc/nginx/sites-available/dutafirza /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# TLS via Let's Encrypt (certbot otomatis menambah blok 443 + redirect).
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d dutafirza.com -d www.dutafirza.com
```

---

## B8. Seeding & migrasi database

> Bundle `standalone` **tidak** memuat `scripts/` maupun `tsx`, dan MongoDB hanya bind di localhost.
> Jadi seed/migrasi dijalankan **dari 🖥️ DEV lewat SSH tunnel** — port 27017 tetap tidak terekspos.

**🖥️ DEV → tunnel** · Prasyarat: B3 selesai (user `duta-app` ada). Buka tunnel, **biarkan jalan** di terminal terpisah:

```bash
gcloud compute ssh dutafirza-prod --zone=asia-southeast2-a -- -N -L 27017:127.0.0.1:27017
```

**🖥️ DEV** — di terminal lain, dari root repo. Buat `.env.local` sementara berisi nilai dari tabel variabel:

```dotenv
# .env.local (sementara, di mesin dev — port 27017 di-forward ke VM oleh tunnel)
MONGODB_URI=mongodb://duta-app:<APP_PW>@127.0.0.1:27017/dutafirza?authSource=dutafirza
SEED_ADMIN_EMAIL=<SEED_ADMIN_EMAIL>
SEED_ADMIN_PASSWORD=<SEED_ADMIN_PASSWORD>
```
```bash
pnpm install --frozen-lockfile    # sekali, agar tsx & deps tersedia (repo pakai pnpm)
pnpm seed                         # seed semua konten + super-admin (idempotent)
pnpm seed customers partners      # (opsional) subset target tertentu
```
Super-admin di-upsert by email; `passwordHash` hanya di-set saat insert → aman diulang tanpa menimpa password.
Daftar lengkap target ada di header `scripts/seed.ts`.

**🖥️ DEV** — migrasi one-off (**hanya** bila memigrasi data lama; idempotent; DB fresh tidak perlu):
```bash
pnpm tsx scripts/migrate-admin-scopes.ts   # scope RBAC lama → leaf scopes
pnpm tsx scripts/migrate-inquiries.ts      # pisah read-state dari status inquiry
```

**4. JANGAN** jalankan `scripts/seed-devtools.ts` di produksi — DEV ONLY (mengisi metrik palsu & menghapus metrik asli host).

---

## GitHub Actions — secrets & variables

**🌐 WEB** · Repo GitHub → **Settings → Secrets and variables → Actions**. Prasyarat: B1 & B6 selesai.

**Secrets** (tab *Secrets* → *New repository secret*):

| Nama | Isi | Dari mana |
|------|-----|-----------|
| `SSH_PRIVATE_KEY` | Isi file `~/.ssh/dutafirza_deploy` | 🖥️ `cat ~/.ssh/dutafirza_deploy` (seluruh isi, termasuk baris BEGIN/END) |
| `SSH_HOST` | `<VM_IP>` | ☁️ perintah describe di tabel variabel |
| `SSH_USER` | `deploy` | literal (user dibuat di B6) |
| `SSH_KNOWN_HOSTS` | Host key VM | 🖥️ `ssh-keyscan <VM_IP>` — salin seluruh output |

**Variables** (tab *Variables* → *New repository variable*) — build-time, non-sensitif (di-inline saat build):

| Nama | Contoh |
|------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://dutafirza.com` |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | (opsional) dari dashboard Umami |
| `NEXT_PUBLIC_UMAMI_SHARE_URL` | (opsional) |
| `NEXT_PUBLIC_UMAMI_SCRIPT_URL` | (opsional) |

> Secret runtime lain (Mongo, NextAuth, Resend, GCS, DevTools) **tidak** di GitHub — hanya di
> `/opt/dutafirza/shared/.env` pada VM (B6).

---

## Deploy pertama & verifikasi

1. **Pastikan** B1–B7 selesai + secrets/variables GitHub terisi.
2. **🌐 WEB** — Actions → **Deploy Production** → *Run workflow* (`workflow_dispatch`) pada branch `main`.
3. **🔒 VM** — cek hasil: `sudo systemctl status dutafirza` (active), `ls -l /opt/dutafirza/current`
   (menunjuk release terbaru), dan health check di workflow lolos.
4. **🖥️ DEV** — seed DB (B8) bila belum, lalu **🌐 WEB** buka `https://dutafirza.com` → homepage,
   login `/admin` (pakai `<SEED_ADMIN_EMAIL>`/`<SEED_ADMIN_PASSWORD>`), uji upload media (tampil dari GCS).
5. Selanjutnya cukup **push ke `main`** → pipeline `test → build → deploy` jalan otomatis.

**Rollback manual** — **🔒 VM** (`<sha-lama>` dari `ls -1dt /opt/dutafirza/releases/*/`):
```bash
ln -sfn /opt/dutafirza/releases/<sha-lama> /opt/dutafirza/current
sudo systemctl restart dutafirza
```
