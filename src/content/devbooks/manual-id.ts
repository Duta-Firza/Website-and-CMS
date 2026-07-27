import type { Book } from "./types";

/**
 * Manual Book Admin — Bahasa Indonesia (native port of the former standalone
 * HTML). Content is data; the EN edition reuses the same structure.
 * Inline markup: **bold**, `code`, [label](#anchor). Figure codes match the
 * screenshot checklist (GBR-x.y) → images at content/devbooks/manual/images/.
 */
export const manualId: Book = {
  slug: "manual",
  lang: "id",
  langLabel: "Bahasa Indonesia",
  title: "Buku Manual Admin — Website & CMS PT Duta Firza",
  coverKicker: "Buku Manual Administrator",
  coverTitle: "Website & CMS PT Duta Firza",
  subtitle: "Panduan pengelolaan konten, pembacaan data, dan administrasi dashboard admin",
  version: "1.0",
  year: "2026",
  chapters: [
    {
      no: "1",
      id: "bab1",
      title: "Pendahuluan",
      blocks: [
        { t: "h3", id: "s1-1", text: "1.1 Tujuan buku ini" },
        {
          t: "lead",
          text: "Buku ini adalah panduan praktis untuk mengelola website PT Duta Firza melalui dashboard admin (CMS). Setelah membaca buku ini, admin diharapkan mampu:",
        },
        {
          t: "ul",
          items: [
            "Masuk ke dashboard admin dan memahami tata letaknya.",
            "Mengatur konten setiap halaman — teks, gambar, dokumen — dalam dua bahasa (Indonesia & Inggris).",
            "Memahami **di mana** dan **bagaimana** setiap konten muncul di website publik.",
            "Membaca data pengunjung serta menindaklanjuti pesan masuk (inquiry, lamaran kerja, dan lead unduhan laporan).",
            "Mengelola akun pengguna admin beserta hak aksesnya.",
          ],
        },
        { t: "h3", id: "s1-2", text: "1.2 Untuk siapa buku ini" },
        {
          t: "p",
          text: "Buku ini ditujukan untuk **admin non-teknis** yang bertugas memelihara konten website sehari-hari. Bagian teknis (Bab 7) ditujukan untuk pengelola sistem/IT dan boleh dilewati oleh editor konten.",
        },
        { t: "h3", id: "s1-3", text: "1.3 Ikhtisar website & CMS" },
        { t: "p", text: "Website PT Duta Firza terdiri dari dua sisi:" },
        {
          t: "ul",
          items: [
            "**Sisi Publik** — halaman yang dilihat pengunjung (beranda, profil, solusi/layanan, hubungan investor, kontak, karir). Alamatnya diawali `/id/…` (Indonesia) atau `/en/…` (Inggris).",
            "**Sisi Admin (CMS)** — tempat mengelola semua konten di atas. Alamatnya diawali `/id/admin`. Hanya bisa diakses setelah login.",
          ],
        },
        {
          t: "p",
          text: "Setiap perubahan yang Anda simpan di sisi admin akan **langsung tampil** di sisi publik (kecuali status halaman diatur tersembunyi/segera hadir — lihat [bagian 3.6](#s3-6)).",
        },
        {
          t: "callout",
          kind: "tip",
          title: "Info Teknis Singkat",
          body: [
            "Website dibangun dengan Next.js + MongoDB, mendukung dua bahasa, tema terang/gelap, editor teks kaya, unggah gambar & PDF, peta lokasi, dan analitik pengunjung (Umami). Anda tidak perlu memahami teknologi ini untuk memakai CMS.",
          ],
        },
        { t: "h3", id: "s1-4", text: "1.4 Istilah penting" },
        {
          t: "table",
          head: ["Istilah", "Arti"],
          rows: [
            ["**CMS / Dashboard admin**", "Area `/id/admin` tempat mengelola konten."],
            ["**Sisi publik**", "Halaman website yang dilihat pengunjung umum."],
            ["**Field**", "Kolom isian pada formulir (mis. Judul, Deskripsi)."],
            [
              "**Localized field (ID/EN)**",
              "Field yang punya versi Indonesia dan Inggris sekaligus.",
            ],
            ["**Section**", "Satu blok/bagian pada sebuah halaman (mis. bagian Hero, Statistik)."],
            [
              "**Status halaman**",
              "Pengaturan tampil/tidaknya halaman: Tayang / Segera Hadir / Disembunyikan.",
            ],
            ["**Slug**", "Potongan alamat unik sebuah artikel/halaman."],
            ["**Inquiry**", "Pesan/pertanyaan yang dikirim pengunjung lewat formulir."],
            ["**Lead**", "Data calon kontak yang tertangkap (mis. saat mengunduh laporan)."],
            ["**RBAC**", "Pengaturan hak akses berbasis peran (Super Admin / Editor / Viewer)."],
          ],
        },
      ],
    },
    {
      no: "2",
      id: "bab2",
      title: "Memulai",
      blocks: [
        { t: "h3", id: "s2-1", text: "2.1 Masuk (login) & keluar (logout)" },
        {
          t: "steps",
          items: [
            "Buka peramban (Chrome/Edge/Safari) dan kunjungi `/id/admin/login`.",
            "Masukkan **Email** dan **Kata sandi** akun admin Anda.",
            "Klik tombol **Masuk**. Bila berhasil, Anda diarahkan ke `/id/admin` (Dasbor).",
          ],
        },
        { t: "figure", code: "GBR-2.1", caption: "Halaman masuk admin", url: "/id/admin/login" },
        {
          t: "callout",
          kind: "warn",
          title: "Bila gagal masuk",
          body: [
            "Pesan “Email atau kata sandi salah” berarti kredensial keliru. Jika akun Anda dinonaktifkan atau sesi berakhir, sistem mengembalikan Anda ke halaman login. Hubungi Super Admin bila perlu reset kata sandi (lihat [6.3](#s6-3)).",
          ],
        },
        {
          t: "p",
          text: "**Keluar (logout):** klik nama/avatar Anda di pojok bawah sidebar, lalu pilih **Keluar**.",
        },
        { t: "h3", id: "s2-2", text: "2.2 Orientasi dashboard & sidebar" },
        {
          t: "p",
          text: "Setelah masuk, layar terbagi menjadi dua: **sidebar menu** di kiri dan **area kerja** di kanan. Menu dikelompokkan menjadi empat bagian:",
        },
        {
          t: "table",
          head: ["Bagian", "Isi menu", "Fungsi"],
          rows: [
            ["**Analitik**", "Dasbor, Analitik Pengunjung", "Ringkasan & data trafik."],
            [
              "**Konten**",
              "Beranda, Tentang Kami, Solusi, Hubungan Investor, Connect",
              "Semua konten yang tampil ke publik.",
            ],
            ["**Inbox**", "Inquiry, Lamaran Kerja, Download Laporan", "Pesan & lead yang masuk."],
            ["**Sistem**", "Pengguna", "Kelola akun admin (khusus Super Admin)."],
          ],
        },
        {
          t: "p",
          text: "Angka merah kecil (badge) pada menu **Inquiry** dan **Lamaran Kerja** menunjukkan jumlah pesan yang belum dibaca dan diperbarui otomatis.",
        },
        {
          t: "callout",
          kind: "note",
          title: "Catatan RBAC",
          body: [
            "Menu yang tampil bergantung pada peran & hak akses akun Anda. Editor mungkin hanya melihat sebagian menu. Menu **Pengguna** hanya muncul untuk Super Admin. Lihat [Bab 6](#bab6).",
          ],
        },
        {
          t: "figure",
          code: "GBR-2.2",
          caption: "Tata letak dasbor & sidebar menu",
          url: "/id/admin",
        },
        {
          t: "p",
          text: "Halaman **Dasbor** menampilkan kartu ringkasan tiap kelompok konten dan inbox — berguna sebagai titik awal navigasi. Sidebar bisa diperlebar/diringkas lewat tombol **Perluas/Ringkas sidebar**.",
        },
        { t: "h3", id: "s2-3", text: "2.3 Ganti bahasa antarmuka & tema" },
        { t: "p", text: "Di pojok bawah sidebar (menu akun) tersedia:" },
        {
          t: "ul",
          items: [
            "**Pengalih bahasa** — mengubah bahasa tampilan CMS antara Indonesia & Inggris. (Ini berbeda dari mengisi konten dua bahasa — lihat [3.1](#s3-1).)",
            "**Pengalih tema** — Terang / Gelap / Ikuti sistem.",
            "**Ganti kata sandi** — untuk mengubah kata sandi akun Anda sendiri (lihat [6.3](#s6-3)).",
          ],
        },
        {
          t: "figure",
          code: "GBR-2.3",
          caption: "Menu akun di sidebar · pengalih bahasa & tema",
        },
      ],
    },
    {
      no: "3",
      id: "bab3",
      title: "Konsep Dasar (dipakai di semua halaman)",
      blocks: [
        {
          t: "lead",
          text: "Sebagian besar halaman CMS memakai elemen antarmuka yang sama. Pahami sekali di sini, lalu Anda bisa mengelola halaman mana pun di Bab 4–6.",
        },
        { t: "h3", id: "s3-1", text: "3.1 Konten dua bahasa (ID/EN)" },
        {
          t: "p",
          text: "Hampir semua field teks (Judul, Deskripsi, Ringkasan, dll.) memiliki **dua versi**: Indonesia dan Inggris, ditandai tab/penanda `ID` dan `EN`. Isi keduanya agar konten tampil benar di kedua versi bahasa website.",
        },
        { t: "figure", code: "GBR-3.1", caption: "Mengisi konten dua bahasa pada satu field" },
        {
          t: "callout",
          kind: "warn",
          title: "Penting",
          body: [
            "Jika versi **EN** dibiarkan kosong, pengunjung berbahasa Inggris bisa melihat bagian kosong (kecuali dinyatakan boleh kosong → memakai teks Indonesia, seperti pada sel tabel pemegang saham). Biasakan mengisi kedua bahasa.",
          ],
        },
        { t: "h3", id: "s3-2", text: "3.2 Editor teks kaya (rich text)" },
        {
          t: "p",
          text: "Untuk isi panjang (paragraf, isi artikel, deskripsi pekerjaan) tersedia editor teks kaya dengan toolbar: **tebal, miring, judul, daftar, tautan,** dan sisip **gambar**. Gunakan toolbar ini untuk memformat; hindari menempel format mentah dari Word.",
        },
        { t: "figure", code: "GBR-3.2", caption: "Editor teks kaya & toolbar pemformatan" },
        { t: "h3", id: "s3-3", text: "3.3 Unggah & crop gambar/video" },
        {
          t: "p",
          text: "Untuk gambar/logo/foto: klik area unggah atau seret berkas (drag & drop). Setelah memilih gambar, muncul dialog **Crop gambar**:",
        },
        {
          t: "steps",
          items: [
            "Atur **Zoom** dan geser gambar untuk menentukan area yang tampil.",
            "Klik **Terapkan crop** untuk memakai hasil potongan, atau **Unggah gambar utuh** untuk memakai gambar apa adanya.",
            "Sistem mengompres gambar otomatis dan menampilkan penghematan ukuran (mis. 2 MB → 400 KB).",
          ],
        },
        { t: "figure", code: "GBR-3.3", caption: "Dialog crop & kompres gambar sebelum simpan" },
        {
          t: "callout",
          kind: "tip",
          title: "Ukuran gambar yang disarankan",
          body: [
            "Setiap field gambar mencantumkan rekomendasi ukuran & rasio (mis. hero 1920×1080/16:9, foto pimpinan potret 4:5, logo mitra PNG transparan). Ikuti anjuran ini agar hasil tampil rapi. Detail per konten ada di Bab 4.",
          ],
        },
        {
          t: "p",
          text: "**Video** (khusus halaman About): unggah MP4; sistem mengompres ke 1080p. Ada opsi putar otomatis tanpa suara.",
        },
        { t: "h3", id: "s3-4", text: "3.4 Pemilih ikon & pemilih titik peta" },
        {
          t: "ul",
          items: [
            "**Pemilih ikon** — beberapa kartu (Statistik & Solusi di beranda) memakai ikon. Klik untuk memilih dari daftar ikon yang tersedia.",
            "**Pemilih titik peta** — pada Jangkauan (peta di beranda), klik di peta atau geser pin untuk menentukan koordinat lokasi.",
          ],
        },
        {
          t: "figure",
          code: "GBR-3.4",
          caption: "Pemilih ikon (kiri) & pemilih titik peta (kanan)",
        },
        { t: "h3", id: "s3-5", text: "3.5 Mengubah urutan (drag & drop)" },
        {
          t: "p",
          text: "Daftar item (statistik, mitra, produk, milestone, dll.) bisa diurutkan dengan menyeret. Tarik pegangan sebuah item ke posisi baru.",
        },
        {
          t: "callout",
          kind: "note",
          title: "Syarat mengurutkan",
          body: [
            "Fitur seret-urut hanya aktif saat daftar dalam **urutan manual**. Bila Anda sedang mencari/memfilter/mengurutkan berdasarkan nama, hapus dulu pencarian & filter agar bisa menyeret.",
          ],
        },
        { t: "h3", id: "s3-6", text: "3.6 Status halaman & mode section" },
        {
          t: "p",
          text: "Banyak halaman publik punya **Status** yang menentukan apakah halaman tampil:",
        },
        {
          t: "table",
          head: ["Status", "Perilaku di publik"],
          rows: [
            ["**Tayang**", "Halaman dapat diakses publik secara normal."],
            ["**Segera Hadir**", "Pengunjung melihat halaman “Segera Hadir”."],
            ["**Disembunyikan**", "Halaman menampilkan 404 dan tidak muncul di navigasi."],
          ],
        },
        { t: "p", text: "Selain itu, banyak **section** (Judul & Body halaman) punya **mode**:" },
        {
          t: "ul",
          items: [
            "**Section aktif** (on/off) — nyalakan/matikan tampilnya section.",
            "**Default** — memakai teks bawaan sistem.",
            "**Custom** — memakai teks yang Anda tulis sendiri.",
          ],
        },
        {
          t: "figure",
          code: "GBR-3.6",
          caption: "Status halaman (Tayang/Segera/Sembunyi) & mode section",
        },
        { t: "h3", id: "s3-7", text: "3.7 Menyimpan & melihat pratinjau" },
        {
          t: "p",
          text: "Saat Anda mengubah sesuatu, muncul **bar simpan** di bawah layar. Klik **Simpan** untuk menyimpan; status berubah menjadi “Tersimpan”. Banyak halaman juga punya tombol **Lihat halaman publik** untuk membuka hasilnya di tab baru.",
        },
        { t: "figure", code: "GBR-3.7", caption: "Bar simpan & tautan pratinjau publik" },
        {
          t: "callout",
          kind: "warn",
          title: "Jangan lupa Simpan",
          body: [
            "Perubahan hanya berlaku setelah **Simpan** ditekan. Meninggalkan halaman tanpa menyimpan akan membatalkan perubahan.",
          ],
        },
        { t: "h3", id: "s3-8", text: "3.8 Mencari, memfilter & mengurutkan daftar" },
        {
          t: "p",
          text: "Halaman berbentuk daftar (produk, proyek, artikel, inquiry, pengguna) punya toolbar: **kotak Cari**, **Filter** (status/kategori), **Urutkan**, dan pengalih **tampilan kartu/tabel**. Bawah daftar ada penomoran halaman (pagination).",
        },
        {
          t: "figure",
          code: "GBR-3.8",
          caption: "Toolbar pencarian, filter, pengurutan, & pergantian tampilan",
        },
      ],
    },
    {
      no: "4",
      id: "bab4",
      title: "Mengelola Konten",
      blocks: [
        {
          t: "lead",
          text: "Bab ini membahas setiap menu di grup **Konten**. Pola tiap bagian sama: Apa yang dikelola → Field/langkah → Di mana muncul di publik → Efek status.",
        },
        {
          t: "callout",
          kind: "tip",
          title: "Membaca kolom “Halaman publik”",
          body: [
            "Kolom itu adalah alamat yang bisa Anda buka untuk memeriksa hasil. Ganti awalan `/id` menjadi `/en` untuk versi Inggris.",
          ],
        },
        { t: "h3", id: "s4-1", text: "4.1 Beranda — menu “Beranda › Halaman Beranda”" },
        {
          t: "p",
          text: "**Lokasi admin:** `/id/admin/landing` · **Muncul di:** homepage `/id`. Halaman ini memakai **tab** yang urutannya mengikuti urutan section di homepage:",
        },
        {
          t: "table",
          head: ["Tab", "Yang diatur", "Muncul di homepage sebagai"],
          rows: [
            [
              "**Hero**",
              "Eyebrow, judul, subjudul, tombol CTA (utama & sekunder), gambar latar, dekorasi hero, judul/subjudul tiap section.",
              "Banner utama paling atas + heading tiap bagian.",
            ],
            [
              "**Statistik**",
              "Kartu angka (label ID/EN, prefix, nilai, sufiks, ikon). Bisa diurutkan.",
              "Baris angka ringkas (Quick Stats).",
            ],
            ["**Mitra Kami**", "—", "Strip logo mitra. Dikelola di menu lain (lihat catatan)."],
            [
              "**Solusi Kami**",
              "Kartu solusi (judul, deskripsi, ikon, tautan) + jumlah kolom per baris.",
              "Bagian Solutions Spotlight.",
            ],
            [
              "**Jangkauan**",
              "Titik lokasi (kota, provinsi, koordinat via peta).",
              "Peta sebaran + daftar lokasi.",
            ],
            [
              "**Pelanggan**",
              "Logo pelanggan (nama, logo, opsi invert di tema gelap, aktif).",
              "Carousel logo pelanggan.",
            ],
          ],
        },
        {
          t: "callout",
          kind: "note",
          title: "Mitra dikelola terpisah",
          body: [
            "Tab “Mitra Kami” hanya berisi pintasan. Logo mitra sebenarnya dikelola di `/id/admin/solutions/trading/partners` (tab Mitra). Lihat [4.3](#s4-3).",
          ],
        },
        { t: "h4", text: "Rekomendasi gambar" },
        {
          t: "ul",
          items: [
            "**Latar Hero:** 1920×1080 (16:9), JPG/WebP. Kosongkan untuk memakai gradasi bawaan. Dekorasi aktif = overlay gelap+pola; nonaktif = gambar utuh.",
            "**Logo pelanggan:** PNG transparan, min 280×93 (tampil ~40px).",
          ],
        },
        {
          t: "figure",
          code: "GBR-4.1.1",
          caption: "Editor Beranda & tab section",
          url: "/id/admin/landing",
        },
        { t: "figure", code: "GBR-4.1.2", caption: "Tab Hero: judul, CTA, gambar latar" },
        {
          t: "figure",
          code: "GBR-4.1.3",
          caption: "Tab Statistik (kartu angka) & Tab Solusi (kartu + ikon)",
        },
        { t: "figure", code: "GBR-4.1.4", caption: "Tab Jangkauan: menandai titik lokasi di peta" },
        {
          t: "figure",
          code: "GBR-4.1.5",
          caption: "**Hasil di publik**: homepage (hero, statistik, solusi, peta, pelanggan)",
          url: "/id",
        },
        { t: "h3", id: "s4-2", text: "4.2 Tentang Kami — menu “Tentang Kami”" },
        { t: "p", text: "Grup ini mengelola seluruh halaman di bawah `/id/about`." },
        {
          t: "table",
          head: ["Menu admin", "Lokasi admin", "Yang dikelola", "Halaman publik"],
          rows: [
            [
              "**Tentang Kami**",
              "`/admin/about`",
              "Konten Who We Are & intro halaman Bisnis; nilai perusahaan; video profil.",
              "`/id/about`",
            ],
            [
              "**Kepemimpinan**",
              "`/admin/about/leadership`",
              "Daftar Direksi & Komisaris (foto, nama, jabatan, bio). Ada tab per tipe.",
              "`/id/about/leadership`",
            ],
            [
              "**Sejarah**",
              "`/admin/about/history`",
              "Timeline milestone (tahun, judul, deskripsi, gambar opsional).",
              "`/id/about/history`",
            ],
            [
              "**Bisnis Kami**",
              "`/admin/about/business`",
              "Bisnis inti & bisnis afiliasi / sister company (logo, deskripsi, divisi).",
              "`/id/about/business`",
            ],
            [
              "**Kredensial**",
              "`/admin/about/credentials`",
              "Sertifikasi & penghargaan (scan dokumen, penerbit, tahun). Tab: Sertifikasi / Penghargaan.",
              "`/id/about/credentials`",
            ],
          ],
        },
        {
          t: "callout",
          kind: "tip",
          title: "Rekomendasi gambar (About)",
          body: [
            "Foto pimpinan: potret 4:5 (min 400×500), wajah di tengah-atas frame. Scan kredensial: potret 3:4 (min 600×800). Gambar sejarah (opsional): 16:9 (min 1280×720). Video About: MP4 16:9, maks 200 MB.",
          ],
        },
        {
          t: "figure",
          code: "GBR-4.2.1",
          caption: "Editor Kepemimpinan",
          url: "/id/admin/about/leadership",
        },
        {
          t: "figure",
          code: "GBR-4.2.2",
          caption: "Editor Sejarah (timeline)",
          url: "/id/admin/about/history",
        },
        { t: "figure", code: "GBR-4.2.3", caption: "Editor Kredensial & Bisnis Afiliasi" },
        {
          t: "figure",
          code: "GBR-4.2.4",
          caption: "**Hasil di publik** · Kepemimpinan & Sejarah",
          url: "/id/about/leadership",
        },
        { t: "h3", id: "s4-3", text: "4.3 Solusi — menu “Solusi”" },
        {
          t: "p",
          text: "Grup ini mengatur halaman layanan di bawah `/id/solutions`. Mulailah dari **Overview** untuk menentukan status tiap halaman.",
        },
        {
          t: "table",
          head: ["Menu admin", "Yang dikelola", "Halaman publik"],
          rows: [
            [
              "**Solusi (Overview)** `/admin/solutions`",
              "Status & konten setiap sub-halaman Solusi.",
              "—",
            ],
            [
              "**Trading** `/admin/solutions/trading`",
              "Hero & intro + pengaturan form inquiry.",
              "`/id/solutions/trading`",
            ],
            [
              "**Trading · Mitra** `/admin/solutions/trading/partners`",
              "Hero/intro + logo mitra (dipakai juga di strip homepage).",
              "`/id/solutions/trading/partners`",
            ],
            [
              "**Trading · Produk** `/admin/solutions/trading/products`",
              "Hero/intro + katalog produk (principle, asal, tipe, dll.).",
              "`/id/solutions/trading/products`",
            ],
            [
              "**Manufaktur** `/admin/solutions/manufacturing`",
              "Konten + form quote.",
              "`/id/solutions/manufacturing`",
            ],
            [
              "**EPC** `/admin/solutions/epc`",
              "Hero/intro. Item proyek dikelola di Master · Proyek.",
              "`/id/solutions/epc`",
            ],
            [
              "**Teknologi** `/admin/solutions/technology`",
              "Konten + form inquiry + tautan website eksternal.",
              "`/id/solutions/technology`",
            ],
          ],
        },
        {
          t: "callout",
          kind: "note",
          title: "Form & WhatsApp",
          body: [
            "Beberapa halaman Solusi punya **form inquiry** yang bisa dinyalakan/dimatikan dan field-nya diatur lewat Form Builder (lihat 4.5 & 5.3). Halaman Produk mendukung tombol **Chat WhatsApp** — isi nomor format internasional (mis. `628123456789`); kosongkan untuk menonaktifkan.",
          ],
        },
        {
          t: "figure",
          code: "GBR-4.3.1",
          caption: "Overview Solusi & pengaturan status",
          url: "/id/admin/solutions",
        },
        {
          t: "figure",
          code: "GBR-4.3.2",
          caption: "Katalog produk Trading + WhatsApp",
          url: "/id/admin/solutions/trading/products",
        },
        {
          t: "figure",
          code: "GBR-4.3.3",
          caption: "**Hasil di publik** · katalog produk",
          url: "/id/solutions/trading/products",
        },
        { t: "h3", id: "s4-4", text: "4.4 Hubungan Investor — menu “Hubungan Investor”" },
        { t: "p", text: "Grup ini mengelola halaman investor di bawah `/id/investor-relations`." },
        {
          t: "table",
          head: ["Menu admin", "Yang dikelola", "Halaman publik"],
          rows: [
            [
              "**Saham** `/admin/investor-relations/stocks`",
              "Konten + tabel komposisi pemegang saham (kolom & baris dinamis).",
              "`/id/investor-relations/stocks`",
            ],
            [
              "**Laporan** `/admin/investor-relations/reports`",
              "Laporan tahunan & keuangan (PDF + thumbnail) + pengaturan form gate.",
              "`/id/investor-relations/reports`",
            ],
            [
              "**Publikasi** `/admin/investor-relations/publications`",
              "Konten halaman publikasi (payung berita & siaran pers).",
              "`/id/investor-relations/publications`",
            ],
            [
              "**Siaran Pers** `/admin/investor-relations/press-release`",
              "Artikel siaran pers (judul, slug, isi, tanggal, gambar).",
              "`/id/investor-relations/publications/press-release`",
            ],
            [
              "**Newsroom** `/admin/investor-relations/newsroom`",
              "Artikel berita (judul, slug, isi, sumber asli opsional).",
              "`/id/investor-relations/publications/newsroom`",
            ],
            [
              "**Profil Perusahaan** `/admin/investor-relations/company-profile`",
              "Unggah PDF Profil Perusahaan.",
              "`/id/investor-relations/publications/company-profile`",
            ],
          ],
        },
        { t: "h4", text: "Tabel pemegang saham (Saham)" },
        {
          t: "p",
          text: "Susun tabel dengan menambah **kolom** dulu (label + perataan kiri/tengah/kanan), lalu **baris**. Isi sel per bahasa; sel EN yang kosong otomatis memakai teks Indonesia. Centang “Tebalkan baris ini” untuk baris total.",
        },
        { t: "h4", text: "Laporan & thumbnail (Laporan)" },
        { t: "p", text: "Untuk tiap laporan, unggah PDF dan pilih sumber thumbnail:" },
        {
          t: "ul",
          items: [
            "**Upload thumbnail** — Anda unggah gambar sendiri.",
            "**Gunakan halaman pertama PDF** — sistem membuat thumbnail dari halaman 1 PDF (klik Generate dari PDF).",
            "**Gunakan default** — placeholder netral.",
          ],
        },
        {
          t: "callout",
          kind: "note",
          title: "Slug otomatis",
          body: [
            "Untuk artikel (Siaran Pers/Newsroom), **slug** dibuat otomatis dari judul bahasa Inggris. Edit manual bila perlu. Slug menjadi bagian alamat artikel di publik.",
          ],
        },
        {
          t: "figure",
          code: "GBR-4.4.1",
          caption: "Penyusun tabel pemegang saham",
          url: "/id/admin/investor-relations/stocks",
        },
        {
          t: "figure",
          code: "GBR-4.4.2",
          caption: "Unggah laporan & pilih thumbnail",
          url: "/id/admin/investor-relations/reports",
        },
        { t: "figure", code: "GBR-4.4.3", caption: "Editor artikel (judul, slug, isi teks kaya)" },
        {
          t: "figure",
          code: "GBR-4.4.4",
          caption: "**Hasil di publik** · daftar laporan",
          url: "/id/investor-relations/reports",
        },
        { t: "h3", id: "s4-5", text: "4.5 Kontak & Karir — menu “Connect”" },
        { t: "h4", text: "Halaman Kontak — /admin/contact → /id/contact" },
        { t: "p", text: "Halaman ini memiliki 4 tab:" },
        {
          t: "table",
          head: ["Tab", "Isi"],
          rows: [
            ["**Konten**", "Hero & intro halaman kontak."],
            [
              "**Lokasi & Peta**",
              "Tampilkan/sembunyikan peta, lokasi pabrik, jam operasional, tombol rute; embed peta Google Maps & link rute (Kantor Pusat & Pabrik).",
            ],
            [
              "**Info Kontak**",
              "**Sumber data “Pengaturan”**: alamat, jam, telepon, email umum/penjualan, dan tautan media sosial. Data ini dipakai di seluruh situs (mis. footer).",
            ],
            ["**Form**", "Aktif/nonaktifkan form kontak & atur field-nya (Form Builder)."],
          ],
        },
        {
          t: "callout",
          kind: "tip",
          title: "Cara embed peta Google Maps",
          body: [
            "Buka Google Maps → **Bagikan → Sematkan peta**, lalu tempel URL `src` dari iframe ke field embed. Tidak perlu API key.",
          ],
        },
        { t: "h4", text: "Halaman Karir — /admin/contact/careers → /id/contact/careers" },
        {
          t: "p",
          text: "Tab: **Halaman** (hero/intro), **Papan Lowongan** (link papan eksternal), **Budaya & Benefit**, **Lowongan** (daftar posisi), dan **Form Lamaran**. Untuk tiap **Lowongan**, pilih **Metode Lamar**:",
        },
        {
          t: "table",
          head: ["Metode", "Perilaku tombol “Lamar” di publik"],
          rows: [
            [
              "**Form di website ini**",
              "Pelamar mengisi form & unggah CV; lamaran masuk ke Inbox Lamaran Kerja (Bab 5.4).",
            ],
            ["**Link eksternal**", "Mengarahkan ke URL ATS/papan lowongan (`applyUrl`)."],
            ["**Kirim email**", "Membuka aplikasi email pelamar ke alamat tujuan."],
          ],
        },
        {
          t: "callout",
          kind: "note",
          title: "Form Builder",
          body: [
            "Baik form kontak, form quote, maupun form lamaran memakai **Form Builder** yang sama: tambah field (tipe, label, placeholder, wajib/opsional), atur label tombol kirim & pesan sukses. Untuk form lamaran, field nama, email, telepon, dan unggah CV selalu ada.",
          ],
        },
        {
          t: "figure",
          code: "GBR-4.5.1",
          caption: "Tab Info Kontak (alamat, jam, email, sosial)",
          url: "/id/admin/contact",
        },
        {
          t: "figure",
          code: "GBR-4.5.2",
          caption: "Editor Lowongan & metode lamar",
          url: "/id/admin/contact/careers",
        },
        { t: "figure", code: "GBR-4.5.3", caption: "Form Builder: menyusun field formulir" },
        {
          t: "figure",
          code: "GBR-4.5.4",
          caption: "**Hasil di publik** · Kontak & Karir",
          url: "/id/contact",
        },
      ],
    },
    {
      no: "5",
      id: "bab5",
      title: "Membaca Data & Menindaklanjuti Inbox",
      blocks: [
        {
          t: "lead",
          text: "Bab ini menjelaskan cara membaca angka & menindaklanjuti pesan yang masuk dari website.",
        },
        { t: "h3", id: "s5-1", text: "5.1 Dasbor (ringkasan)" },
        {
          t: "p",
          text: "**Lokasi:** `/id/admin`. Dasbor menampilkan kartu ringkasan setiap kelompok konten dan inbox, plus tanggal pembaruan. Isi kartu menyesuaikan hak akses akun Anda.",
        },
        { t: "figure", code: "GBR-5.1", caption: "Dasbor ringkasan", url: "/id/admin" },
        { t: "h3", id: "s5-2", text: "5.2 Analitik Pengunjung (Umami)" },
        {
          t: "p",
          text: "**Lokasi:** `/id/admin/visitor-analytics`. Menampilkan trafik situs publik yang diukur oleh **Umami**, tertanam langsung di dashboard. Tombol **Buka di Umami** membuka dasbor Umami penuh di tab baru.",
        },
        {
          t: "p",
          text: "Yang biasa dibaca: jumlah pengunjung & tampilan halaman, halaman terpopuler, sumber rujukan (referrer), perangkat, dan negara/kota. Gunakan rentang tanggal untuk membandingkan periode.",
        },
        {
          t: "callout",
          kind: "note",
          title: "Bila tampil “Belum dikonfigurasi”",
          body: ["Berarti kredensial Umami belum diisi. Ini tugas teknis — lihat [7.1](#s7-1)."],
        },
        {
          t: "figure",
          code: "GBR-5.2",
          caption: "Analitik pengunjung",
          url: "/id/admin/visitor-analytics",
        },
        { t: "h3", id: "s5-3", text: "5.3 Inbox Inquiry" },
        {
          t: "p",
          text: "**Lokasi:** `/id/admin/inquiries`. Berisi kiriman dari form **Trading, Manufaktur, EPC, Teknologi,** dan **Kontak**. Menu ini menampilkan badge jumlah belum dibaca.",
        },
        { t: "h4", text: "Tab penyaring" },
        {
          t: "p",
          text: "Semua · Belum dibaca · Baru · Dibaca · Diproses · Selesai · Diarsipkan. Ada pula kotak cari (perusahaan, nama, email).",
        },
        { t: "h4", text: "Menindaklanjuti sebuah inquiry" },
        {
          t: "steps",
          items: [
            "Klik sebuah baris untuk membuka **detail** (isi pesan + info pengirim & sumber form).",
            "Perbarui **status** sesuai progres: Baru → Diproses → Selesai (atau Diarsipkan).",
            "Tandai **dibaca / belum dibaca** sesuai kebutuhan.",
            "Klik **Balas via email** untuk membalas lewat aplikasi email Anda.",
          ],
        },
        {
          t: "callout",
          kind: "tip",
          title: "Baca ≠ Status",
          body: [
            "“Belum dibaca/Dibaca” hanya penanda apakah Anda sudah membuka pesan. “Status” (Baru/Diproses/Selesai/Diarsipkan) adalah alur tindak lanjut yang terpisah.",
          ],
        },
        {
          t: "figure",
          code: "GBR-5.3",
          caption: "Inbox Inquiry & tab",
          url: "/id/admin/inquiries",
        },
        { t: "figure", code: "GBR-5.4", caption: "Detail inquiry, ubah status, & balas email" },
        { t: "h3", id: "s5-4", text: "5.4 Lamaran Kerja" },
        {
          t: "p",
          text: "**Lokasi:** `/id/admin/applications`. Berisi lamaran dari form karir (metode “Form di website ini”), lengkap dengan CV. Alur status (pipeline rekrutmen): **Baru → Direview → Shortlist → Ditolak / Diterima**.",
        },
        {
          t: "p",
          text: "Buka sebuah lamaran untuk melihat detail & klik **Unduh CV** untuk mengambil berkas pelamar.",
        },
        {
          t: "figure",
          code: "GBR-5.5",
          caption: "Inbox Lamaran Kerja & pipeline",
          url: "/id/admin/applications",
        },
        { t: "h3", id: "s5-5", text: "5.5 Download Laporan (lead)" },
        {
          t: "p",
          text: "**Lokasi:** `/id/admin/report-downloads`. Menangkap **lead** ketika pengunjung melihat atau mengunduh PDF laporan investor. Terdapat dua bagian:",
        },
        {
          t: "ul",
          items: [
            "**Lihat lead tertangkap** — daftar lead (nama, perusahaan, email, laporan) dengan penanda aksi Lihat atau Download. Bisa difilter per jenis laporan (Tahunan/Keuangan) dan dicari.",
            "**Pengaturan form** — aktif/nonaktifkan gate: mewajibkan pengunjung mengisi data sebelum melihat/mengunduh. Empat field inti selalu dikumpulkan; field lain bisa ditambah/dihapus.",
          ],
        },
        {
          t: "figure",
          code: "GBR-5.6",
          caption: "Lead download laporan",
          url: "/id/admin/report-downloads",
        },
        { t: "figure", code: "GBR-5.7", caption: "Pengaturan form gate download/lihat" },
        {
          t: "callout",
          kind: "note",
          title: "Notifikasi",
          body: [
            "Inquiry & lamaran baru dapat memicu notifikasi email otomatis (via layanan Resend), dan badge belum dibaca di sidebar diperbarui secara langsung tanpa perlu me-refresh.",
          ],
        },
      ],
    },
    {
      no: "6",
      id: "bab6",
      title: "Manajemen Pengguna & Hak Akses (RBAC)",
      blocks: [
        {
          t: "p",
          text: "**Lokasi:** `/id/admin/users`. **Hanya Super Admin** yang dapat membuka menu ini.",
        },
        { t: "h3", id: "s6-1", text: "6.1 Peran: Super Admin, Editor, Viewer" },
        {
          t: "table",
          head: ["Peran", "Hak"],
          rows: [
            ["**Super Admin**", "Akses penuh ke semua section, plus mengelola pengguna."],
            [
              "**Editor**",
              "Hanya bisa mengubah section yang dicentang pada “Akses section”. Dasbor selalu tersedia.",
            ],
            ["**Viewer**", "Hanya baca (tidak bisa mengubah apa pun)."],
          ],
        },
        {
          t: "callout",
          kind: "tip",
          title: "Akses section (scope)",
          body: [
            "Untuk Editor, centang section mana yang boleh dibuka & diubah (mis. hanya Newsroom & Siaran Pers). Ini membuat pembagian tugas rapi — mis. tim humas hanya mengurus publikasi, tim HR hanya mengurus karir & lamaran.",
          ],
        },
        { t: "h3", id: "s6-2", text: "6.2 Menambah & menyunting pengguna" },
        {
          t: "steps",
          items: [
            "Klik **Tambah** pengguna, isi nama, email, kata sandi, dan pilih peran.",
            "Jika peran **Editor**, centang section yang boleh diaksesnya.",
            "Klik **Simpan**.",
          ],
        },
        {
          t: "p",
          text: "**Menonaktifkan (hapus):** akun dinonaktifkan & disembunyikan, dan emailnya bebas dipakai lagi. Perubahan peran/nonaktif langsung berlaku pada permintaan berikutnya pengguna tersebut.",
        },
        {
          t: "callout",
          kind: "warn",
          title: "Pengaman",
          body: [
            "Anda tidak bisa menghapus, menonaktifkan, atau menurunkan peran **akun sendiri**. Super Admin aktif terakhir tidak boleh diturunkan — angkat Super Admin lain lebih dulu.",
          ],
        },
        { t: "figure", code: "GBR-6.1", caption: "Daftar pengguna", url: "/id/admin/users" },
        { t: "figure", code: "GBR-6.2", caption: "Form pengguna: peran & akses section" },
        { t: "h3", id: "s6-3", text: "6.3 Reset & ganti kata sandi" },
        {
          t: "ul",
          items: [
            "**Reset kata sandi (untuk orang lain)** — Super Admin menetapkan kata sandi baru untuk pengguna. Pengguna tidak diberi notifikasi otomatis, jadi sampaikan langsung.",
            "**Ganti kata sandi (akun sendiri)** — lewat menu akun di sidebar; masukkan kata sandi saat ini + kata sandi baru.",
          ],
        },
        {
          t: "callout",
          kind: "note",
          title: "Aturan kata sandi",
          body: ["Minimal **12 karakter**. Konfirmasi harus cocok."],
        },
        { t: "figure", code: "GBR-6.3", caption: "Dialog reset / ganti kata sandi" },
      ],
    },
    {
      no: "7",
      id: "bab7",
      title: "Lampiran Teknis & Operasional",
      blocks: [
        {
          t: "callout",
          kind: "warn",
          title: "Untuk pengelola sistem / IT",
          body: [
            "Bagian ini bersifat teknis dan umumnya tidak diperlukan editor konten sehari-hari. Perubahan di sini biasanya butuh akses server/hosting.",
          ],
        },
        { t: "h3", id: "s7-1", text: "7.1 Konfigurasi Analitik (Umami)" },
        {
          t: "p",
          text: "Agar halaman [Analitik Pengunjung](#s5-2) menampilkan data, isi variabel lingkungan berikut lalu deploy ulang: `NEXT_PUBLIC_UMAMI_WEBSITE_ID` dan `NEXT_PUBLIC_UMAMI_SHARE_URL`.",
        },
        { t: "h3", id: "s7-2", text: "7.2 Variabel lingkungan (.env) & deploy" },
        {
          t: "ul",
          items: [
            "Seluruh variabel didokumentasikan di berkas `.env.example` (MongoDB URI, kunci Resend, kredensial GCS, Umami, dll.). Salin ke `.env.local` untuk lokal.",
            "Aplikasi memvalidasi variabel saat boot — bila ada yang kurang/salah, aplikasi gagal start dengan pesan jelas.",
            "**Build:** `pnpm build`. **Hosting:** GCP (Compute Engine / Cloud Run) — lihat README repo.",
          ],
        },
        { t: "h3", id: "s7-3", text: "7.3 Cadangan data & pemulihan" },
        {
          t: "ul",
          items: [
            "Semua konten & pesan tersimpan di **MongoDB**; berkas (gambar/PDF/CV) di **Google Cloud Storage**.",
            "Jadwalkan cadangan berkala database (mis. `mongodump`) dan pastikan bucket GCS memiliki kebijakan retensi. Simpan salinan kredensial secara aman.",
          ],
        },
        { t: "h3", id: "s7-4", text: "7.4 Pemecahan masalah umum (FAQ)" },
        {
          t: "table",
          head: ["Gejala", "Kemungkinan & solusi"],
          rows: [
            [
              "Perubahan tidak tampil di publik",
              "Pastikan sudah **Simpan**; cek status halaman bukan Disembunyikan/Segera Hadir; segarkan halaman publik.",
            ],
            [
              "Versi Inggris kosong",
              "Field EN belum diisi — lengkapi versi EN (lihat [3.1](#s3-1)).",
            ],
            [
              "Tidak bisa menyeret untuk mengurutkan",
              "Hapus pencarian/filter, pilih Urutan manual (lihat [3.5](#s3-5)).",
            ],
            ["Analitik kosong / “Belum dikonfigurasi”", "Isi variabel Umami (lihat [7.1](#s7-1))."],
            [
              "Menu tertentu tidak muncul",
              "Hak akses akun terbatas; minta Super Admin menyesuaikan (Bab 6).",
            ],
            [
              "Ter-logout tiba-tiba",
              "Sesi berakhir atau akun dinonaktifkan; login ulang / hubungi Super Admin.",
            ],
          ],
        },
      ],
    },
  ],
  screenshotChecklist: [
    { code: "GBR-2.1", location: "/id/admin/login", frame: "Form login", chapter: "2.1" },
    { code: "GBR-2.2", location: "/id/admin", frame: "Dasbor + sidebar penuh", chapter: "2.2" },
    {
      code: "GBR-2.3",
      location: "menu akun (sidebar)",
      frame: "Pengalih bahasa, tema, keluar",
      chapter: "2.3",
    },
    { code: "GBR-3.1", location: "form mana pun", frame: "Field ID/EN", chapter: "3.1" },
    { code: "GBR-3.2", location: "editor teks kaya", frame: "Toolbar pemformatan", chapter: "3.2" },
    { code: "GBR-3.3", location: "dialog unggah", frame: "Crop & kompres gambar", chapter: "3.3" },
    {
      code: "GBR-3.4",
      location: "Statistik / Jangkauan",
      frame: "Pemilih ikon & titik peta",
      chapter: "3.4",
    },
    {
      code: "GBR-3.6",
      location: "halaman berstatus",
      frame: "Status & mode section",
      chapter: "3.6",
    },
    {
      code: "GBR-3.7",
      location: "form mana pun",
      frame: "Bar Simpan + Lihat publik",
      chapter: "3.7",
    },
    {
      code: "GBR-3.8",
      location: "halaman daftar",
      frame: "Cari / filter / urut / kartu-tabel",
      chapter: "3.8",
    },
    { code: "GBR-4.1.1", location: "/id/admin/landing", frame: "Deretan tab", chapter: "4.1" },
    { code: "GBR-4.1.2", location: "landing · tab Hero", frame: "Form hero", chapter: "4.1" },
    {
      code: "GBR-4.1.3",
      location: "landing · Statistik & Solusi",
      frame: "Kartu angka & solusi",
      chapter: "4.1",
    },
    { code: "GBR-4.1.4", location: "landing · Jangkauan", frame: "Pemilih peta", chapter: "4.1" },
    { code: "GBR-4.1.5", location: "/id", frame: "Homepage hasil", chapter: "4.1" },
    {
      code: "GBR-4.2.1",
      location: "/id/admin/about/leadership",
      frame: "Kartu Direksi/Komisaris",
      chapter: "4.2",
    },
    {
      code: "GBR-4.2.2",
      location: "/id/admin/about/history",
      frame: "Timeline milestone",
      chapter: "4.2",
    },
    {
      code: "GBR-4.2.3",
      location: "about · Kredensial & Bisnis",
      frame: "Editor kredensial/afiliasi",
      chapter: "4.2",
    },
    { code: "GBR-4.2.4", location: "/id/about/leadership", frame: "Hasil publik", chapter: "4.2" },
    {
      code: "GBR-4.3.1",
      location: "/id/admin/solutions",
      frame: "Overview status",
      chapter: "4.3",
    },
    {
      code: "GBR-4.3.2",
      location: "/id/admin/solutions/trading/products",
      frame: "Katalog produk + WhatsApp",
      chapter: "4.3",
    },
    {
      code: "GBR-4.3.3",
      location: "/id/solutions/trading/products",
      frame: "Hasil publik",
      chapter: "4.3",
    },
    {
      code: "GBR-4.4.1",
      location: "/id/admin/investor-relations/stocks",
      frame: "Tabel pemegang saham",
      chapter: "4.4",
    },
    {
      code: "GBR-4.4.2",
      location: "/id/admin/investor-relations/reports",
      frame: "Unggah PDF + thumbnail",
      chapter: "4.4",
    },
    {
      code: "GBR-4.4.3",
      location: "IR · editor artikel",
      frame: "Judul, slug, isi",
      chapter: "4.4",
    },
    {
      code: "GBR-4.4.4",
      location: "/id/investor-relations/reports",
      frame: "Hasil publik",
      chapter: "4.4",
    },
    {
      code: "GBR-4.5.1",
      location: "/id/admin/contact · Info Kontak",
      frame: "Alamat, jam, email, sosial",
      chapter: "4.5",
    },
    {
      code: "GBR-4.5.2",
      location: "/id/admin/contact/careers",
      frame: "Lowongan & metode lamar",
      chapter: "4.5",
    },
    { code: "GBR-4.5.3", location: "Form Builder", frame: "Menyusun field", chapter: "4.5" },
    { code: "GBR-4.5.4", location: "/id/contact", frame: "Hasil publik", chapter: "4.5" },
    { code: "GBR-5.1", location: "/id/admin", frame: "Kartu ringkasan", chapter: "5.1" },
    {
      code: "GBR-5.2",
      location: "/id/admin/visitor-analytics",
      frame: "Umami embed",
      chapter: "5.2",
    },
    { code: "GBR-5.3", location: "/id/admin/inquiries", frame: "Daftar + tab", chapter: "5.3" },
    {
      code: "GBR-5.4",
      location: "inquiry · detail",
      frame: "Ubah status + balas email",
      chapter: "5.3",
    },
    {
      code: "GBR-5.5",
      location: "/id/admin/applications",
      frame: "Pipeline + unduh CV",
      chapter: "5.4",
    },
    {
      code: "GBR-5.6",
      location: "/id/admin/report-downloads",
      frame: "Daftar lead (Lihat/Download)",
      chapter: "5.5",
    },
    {
      code: "GBR-5.7",
      location: "report-downloads · Pengaturan",
      frame: "Form gate",
      chapter: "5.5",
    },
    { code: "GBR-6.1", location: "/id/admin/users", frame: "Daftar pengguna", chapter: "6.2" },
    { code: "GBR-6.2", location: "users · form", frame: "Peran + akses section", chapter: "6.2" },
    {
      code: "GBR-6.3",
      location: "dialog kata sandi",
      frame: "Reset / ganti sandi",
      chapter: "6.3",
    },
  ],
};
