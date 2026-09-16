# Riset: Strategi Search Tanpa Server (Static Search)

Dokumen kedua untuk mendemokan **pencarian lintas banyak file**.

## Masalah

GitHub Pages tidak punya database dan tidak punya backend. Jadi bagaimana mencari kalimat di 500 PDF tanpa server?

## Solusi yang Dipakai Aplikasi Ini

1. **Build-time indexing (Python)** — `scripts/build-index.py` mengekstrak teks semua PDF/MD saat kamu push, menghasilkan `search-index.json`.
2. **Client-side fuzzy search (Fuse.js)** — browser memuat index JSON (±1–5 MB) lalu mencari secara lokal, tanpa request ke server.
3. **Deep search per PDF (PDF.js)** — saat PDF dibuka, teks per halaman diekstrak on-demand untuk menemukan nomor halaman yang mengandung kalimat.

## Kalimat Uji Lintas File

- "retensi backup adalah 30 hari" (ada di panduan-penggunaan.md)
- "nomor kontrak CNT-2026-09-144" (ada di contoh-kontrak.pdf)
- "penanggung jawab: Budi Santoso" (ada di PDF + gambar OCR)

## Batasan Jujur (catatan kritis)

- Index JSON dimuat seluruhnya ke RAM browser. Di atas ~10 MB mulai berat di HP kentang.
- PDF.js mengekstrak teks per halaman saat dibuka — PDF 200 halaman butuh beberapa detik pertama kali.
- OCR Tesseract.js (~2 MB WASM + model bahasa ~4 MB) akurat untuk ketikan, lemah untuk tulisan tangan.
- Jika butuh search 5000+ file atau akses privat per-user, arsitektur ini TIDAK cocok — pindah ke Supabase/Meilisearch/Typesense.

## Kesimpulan

Untuk 50–500 dokumen publik, arsitektur static ini adalah titik manis: gratis, cepat, tanpa server, dan mudah di-maintain.
