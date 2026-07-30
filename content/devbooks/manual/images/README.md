# Gambar Manual Book

Taruh screenshot di folder ini dengan nama sesuai kode di buku, mis. `GBR-2.1.jpg`,
`GBR-4.1.2.jpg` (lihat Lampiran checklist di dalam buku `/devbooks/manual/id`).

- Format: `.jpg` (juga didukung: png, webp).
- Disajikan hanya untuk pengguna yang login lewat route ber-gate
  `/api/dev/asset/manual/images/<kode>.jpg` — folder ini **tidak** di `public/`.
- Setelah menaruh file, commit ke git; gambar otomatis muncul di buku, dan
  kotak placeholder "[ GBR-x.y — belum ada gambar ]" digantikan.
