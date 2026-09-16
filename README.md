# 📚 Arsip Digital — GitHub Pages (PDF + Markdown + OCR)

Hosting dokumen **gratis 100%** via GitHub Pages. Upload cukup via `git push`.
Fitur: **search kalimat lintas semua file**, viewer PDF dengan find per halaman, viewer Markdown, dan **OCR gambar (Indonesia + Inggris)** — semuanya berjalan di browser, tanpa server.

Dibuat: 17 September 2026.

---

## 1. Demo Lokal (2 menit)

```bash
cd pdf-hosting
python3 -m http.server 8000
# buka http://localhost:8000
```

Coba di kolom search:

- `pembayaran termin kedua`
- `jadwal pemeliharaan server`
- `tanda tangan direktur utama`
- `CNT-2026-09-144`

## 2. Deploy ke GitHub Pages (gratis)

### Opsi A — via GitHub Web (tanpa terminal)

1. Buat repo publik baru, misal `arsip-digital`.
2. Upload semua isi folder `pdf-hosting/` ke repo (drag & drop di github.com).
3. Buka **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Push / tunggu 1–2 menit → situs live di `https://USERNAME.github.io/arsip-digital/`.

Workflow `.github/workflows/pages.yml` otomatis menjalankan `build-index.py` setiap push, jadi index search selalu fresh.

### Opsi B — via Terminal

```bash
cd pdf-hosting
git init && git add . && git commit -m "arsip digital v1"
git branch -M main
git remote add origin https://github.com/USERNAME/arsip-digital.git
git push -u origin main
# lalu aktifkan Pages → Source: GitHub Actions di Settings repo
```

## 3. Cara Tambah Dokumen Baru

```bash
# 1. Taruh file ke docs/
cp ~/Dokumen/kontrak-baru.pdf docs/
cp ~/catatan.md docs/

# 2. Rebuild index (WAJIB agar bisa di-search)
pip install pypdf          # sekali saja
python3 scripts/build-index.py

# 3. Push
git add docs manifest.json search-index.json
git commit -m "tambah kontrak-baru"
git push
```

> Tidak perlu edit `index.html` / daftar manual — daftar dokumen dibaca otomatis dari `manifest.json`.

## 4. Cara Kerja Search (arsitektur static)

```
docs/*.pdf, *.md
      │  build-index.py (saat push / via Actions)
      ▼
manifest.json + search-index.json  (di-commit ke repo)
      │  dimuat browser sekali
      ▼
Fuse.js (fuzzy search judul + isi, 100% lokal)
      │  klik hasil
      ▼
PDF.js  → ekstrak teks per halaman → lompat ke halaman + highlight
marked  → render MD → highlight temuan
```

- **Global search** = mencari di `search-index.json` (preview ±20.000 karakter/file).
- **PDF find** = mencari presisi per halaman via `PDF.js getTextContent` saat file dibuka.
- Penanda `[[HALAMAN n]]` di index dipakai untuk tombol "Buka di halaman n".

## 5. OCR — Cara Pakai & Batasan Jujur

| Kasus | Cara | Catatan |
|---|---|---|
| Gambar/foto nota (JPG/PNG) | Buka tab OCR (filter ✨) → upload → Jalankan OCR | Model `ind+eng`, pertama kali unduh ~5–10 MB |
| PDF teks asli | Langsung search, tanpa OCR | Cepat & akurat |
| PDF hasil scan | Buka PDF → tombol **OCR halaman ini** | Per halaman, butuh beberapa detik |
| Tulisan tangan / foto blur | — | ❌ Akurasi rendah, ini limit Tesseract |

Jika butuh OCR massal 500 PDF scan sekaligus, itu TIDAK cocok di browser — gunakan script Python `ocrmypdf` / PaddleOCR di laptop sebelum push:

```bash
pip install ocrmypdf
ocrmypdf --language ind+eng scan.pdf searchable.pdf
```

## 6. Limit & Catatan Kritis (baca sebelum skala besar)

- **Ukuran repo:** jaga < 500 MB total; GitHub hard-limit 100 MB/file.
- **Index:** `search-index.json` < 5 MB ideal (script otomatis memotong). Di atas 10 MB berat di HP.
- **Bandwidth Pages:** ~100 GB/bulan — cukup untuk arsip internal, bukan untuk file viral.
- **Privasi:** repo publik = dokumen publik. Butuh login/private → arsitektur ini salah, pakai Supabase/Firebase + auth.
- **Skala > 1000 file / search multi-user / analitik:** pindah ke Meilisearch / Typesense / Postgres full-text.

## 7. Struktur Folder

```
pdf-hosting/
├── index.html              # aplikasi utama
├── css/style.css
├── js/app.js               # search + viewer + OCR
├── docs/                   # ← TARUH PDF/MD/GAMBAR DI SINI
│   ├── contoh-kontrak.pdf
│   ├── panduan-penggunaan.md
│   ├── riset-static-search.md
│   └── images/contoh-nota.png
├── scripts/build-index.py  # indexer (Python, dep: pypdf)
├── manifest.json           # generated — jangan edit manual
├── search-index.json       # generated — jangan edit manual
├── .github/workflows/pages.yml
├── .nojekyll
└── README.md
```

## 8. Troubleshooting

- **Search kosong / badge merah:** pastikan buka via `http://localhost:8000` atau URL Pages, bukan `file://`. `fetch()` diblokir di `file://`.
- **PDF.js / OCR gagal:** butuh internet sekali untuk load CDN (cdnjs/jsdelivr). Setelah deploy tetap butuh internet user.
- **PDF tidak bisa di-search:** kemungkinan PDF scan → pakai tombol OCR, atau `ocrmypdf` sebelum push.
- **Index basi:** lupa jalankan `build-index.py` sebelum push. Aktifkan workflow Actions agar otomatis.

---

Selamat mengarsip! 🎉
