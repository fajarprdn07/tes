# Panduan Penggunaan Arsip Digital

> Dokumen contoh Markdown — bisa dicari dari kolom search global.

## Cara Upload Dokumen Baru (via GitHub)

1. Copy file PDF / MD kamu ke folder `docs/`
2. Jalankan `python3 scripts/build-index.py` untuk rebuild index search
3. Commit & push:
   ```bash
   git add docs manifest.json search-index.json
   git commit -m "tambah dokumen baru"
   git push
   ```
4. GitHub Actions otomatis deploy ke GitHub Pages dalam 1-2 menit.

## Format yang Didukung

- **PDF teks** — langsung bisa di-search per kalimat dan per halaman.
- **PDF scan** — wajib OCR dulu (buka halamannya → klik "OCR halaman ini").
- **Markdown (.md)** — otomatis di-render jadi HTML rapi + bisa di-search.
- **Gambar (JPG/PNG)** — upload di tab OCR untuk ekstrak teks (Bahasa Indonesia + Inggris).

## Kalimat untuk Testing Search

Coba ketik di kolom pencarian global:

- "pembayaran termin kedua"
- "jadwal pemeliharaan server"
- "tanda tangan direktur utama"
- "prosedur backup database"

## Prosedur Backup Database

Backup database dilakukan setiap hari pukul 02:00 WIB secara otomatis ke penyimpanan sekunder. Retensi backup adalah 30 hari untuk harian dan 12 bulan untuk bulanan. Penanggung jawab backup adalah tim infrastruktur.

## Tips Skala 50–500 File

- Jaga total repo di bawah 500 MB agar push tetap cepat.
- Maksimal 100 MB per file (limit GitHub).
- File `search-index.json` dijaga di bawah 5 MB — script build otomatis memotong preview konten per file.
- Untuk PDF besar hasil scan, kompres dulu (misal via `ghostscript` atau smallpdf) sebelum push.
