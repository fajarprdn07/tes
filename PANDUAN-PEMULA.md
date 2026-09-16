# 🐣 Panduan Pemula: Dari NOL Sampai Website Arsip Online

Untuk kamu yang belum punya apa-apa. Ikuti urut dari Tahap 1 → 7.
Estimasi total: **30–45 menit**. Tanpa install, tanpa coding, tanpa terminal.

---

## Peta Perjalanan (gambaran besar)

| Tahap | Apa yang dilakukan | Waktu |
|---|---|---|
| 1 | Buat akun GitHub (gratis) | 5 mnt |
| 2 | Download file project dari workspace ini | 3 mnt |
| 3 | Buat repository (gudang file) di GitHub | 3 mnt |
| 4 | Upload file project ke repository | 5 mnt |
| 5 | Aktifkan GitHub Pages (hosting gratis) | 5 mnt |
| 6 | Buka website + tur fitur satu per satu | 10 mnt |
| 7 | Upload dokumen PDF/MD milik sendiri | 5 mnt |

**Hasil akhir:** website `https://NAMA-KAMU.github.io/arsip-digital/` berisi arsip PDF + Markdown yang bisa di-search per kalimat + OCR gambar.

---

## Tahap 1 — Buat Akun GitHub

1. Buka **https://github.com** di browser (Chrome disarankan).
2. Klik tombol hijau **Sign up** (pojok kanan atas).
3. Isi email → buat password → buat **username** (nama ini akan jadi bagian alamat website kamu, misal `budiarsip` → `budiarsip.github.io`). Pilih yang pendek & profesional.
4. Ikuti verifikasi (kadang ada puzzle gambar) → klik **Create account**.
5. Buka email kamu → cari email dari GitHub → klik link verifikasi / masukkan kode.
6. Login di github.com. ✅ Sampai sini kamu sudah punya akun.

> 💡 Istilah: **GitHub** = tempat menyimpan file + hosting gratis. **Repository (repo)** = satu folder project di GitHub.

---

## Tahap 2 — Download File Project

1. Di halaman chat ini (Arena), cari panel **workspace / files**.
2. Download file **`pdf-hosting.zip`** (satu file, berisi semuanya).
3. Di laptop kamu, cari file `pdf-hosting.zip` di folder Downloads → **klik kanan → Extract All / Ekstrak Semua** (Windows) atau **dobel-klik** (Mac).
4. Hasilnya ada folder **`pdf-hosting`** berisi: `index.html`, folder `css`, `docs`, `js`, `scripts`, `.github`, dll.
5. Buka folder itu sekali untuk memastikan isinya ada. Jangan ubah apapun dulu.

> ⚠️ Pengguna **Mac**: folder `.github` (titik di depan) disembunyikan Finder. Tekan **Cmd + Shift + Titik (.)** untuk menampilkannya — folder ini PENTING, jangan sampai tidak ikut ter-upload.

---

## Tahap 3 — Buat Repository Baru

1. Login di **github.com**, klik ikon **"+"** (pojok kanan atas) → **New repository**.
2. Isi:
   - **Repository name:** `arsip-digital` (huruf kecil, tanpa spasi)
   - **Public** ✅ (wajib Public agar hosting gratisnya aktif)
   - **JANGAN** centang "Add a README file" (kita sudah punya)
3. Klik hijau **Create repository**.
4. Kamu masuk ke halaman repo kosong. Biarkan terbuka.

---

## Tahap 4 — Upload File Project

1. Di halaman repo kosong, klik link **"uploading an existing file"** (tulisan biru di tengah).
2. Buka folder `pdf-hosting` hasil ekstrak tadi → **blok SEMUA isinya** (Ctrl+A / Cmd+A) → **drag & drop** ke area upload GitHub.
   - Yang harus ikut: `index.html`, `README.md`, `PANDUAN-PEMULA.md`, `manifest.json`, `search-index.json`, `.nojekyll`, folder `css`, `docs`, `js`, `scripts`, **dan `.github`**.
3. Tunggu sampai semua file terdaftar (±4 file contoh + kode).
4. Scroll ke bawah → di kolom "Commit changes" biarkan saja → klik hijau **Commit changes**.
5. Verifikasi: di daftar file repo, pastikan ada folder **`.github`** (klik untuk cek dalamnya ada `workflows/pages.yml`). Kalau tidak ada, lihat **Lampiran A** di bawah.

---

## Tahap 5 — Aktifkan GitHub Pages

1. Di halaman repo, klik tab **Settings** (menu atas, ikon gerigi).
2. Di menu kiri, klik **Pages**.
3. Bagian **"Build and deployment"** → **Source** → pilih **GitHub Actions** (bukan "Deploy from a branch").
4. Tunggu 1–2 menit. Lalu klik tab **Actions** (menu atas repo) → lihat ada proses berjalan (lingkaran kuning) → sampai jadi **centang hijau ✅**.
5. Kalau sudah hijau: kembali ke **Settings → Pages** → di bagian atas muncul alamat website kamu, misal:
   `https://budiarsip.github.io/arsip-digital/` — **klik / catat alamat ini.** 🎉

> ⏳ Kalau belum muncul, tunggu 2–3 menit lalu refresh. Deploy pertama memang agak lama.

---

## Tahap 6 — Tur Fitur (kenalan satu per satu)

Buka alamat website kamu. Mari kenalan dengan setiap bagian layar:

### 6a. Bagian ATAS (header biru) — Pencarian Global 🔍
- **Kotak search besar** + tombol kuning **Cari**: untuk mencari kalimat di **semua dokumen sekaligus**.
- Coba ketik: `pembayaran termin kedua` → tekan Enter.
- Di bawah judul ada **badge hijau "✓ Index siap — 4 dokumen"** = tanda data berhasil dimuat. Kalau masih abu-abu "Memuat index…", tunggu / refresh.

### 6b. Bagian KIRI (sidebar) — Daftar Dokumen 📁
- Tombol filter: **Semua | 📕 PDF | 📝 MD | 🖼️ Gambar | ✨ OCR**.
  - Klik **📕 PDF** → daftar hanya menampilkan PDF. Klik **Semua** untuk kembali.
  - Klik **✨ OCR** → membuka halaman OCR (bukan filter).
- **Kartu dokumen**: tiap kartu ada label warna (merah=PDF, biru=MD, ungu=Gambar), judul, nama file, ukuran. **Klik kartu** untuk membuka.

### 6c. Bagian TENGAH (awal) — Layar Selamat Datang 👋
- Ada 3 kartu penjelasan fitur.
- Ada tombol-tombol **contoh pencarian** (pil biru): `jadwal pemeliharaan server`, dll. **Klik salah satunya** → otomatis mencari. Ini cara termudah mencoba.

### 6d. Hasil Pencarian 🔍
Setelah mencari, muncul daftar hasil. Tiap hasil berisi:
- Judul dokumen + label jenis file.
- **Kotak snippet**: potongan kalimat tempat kata kamu ditemukan, kata yang cocok ditandai **kuning**.
- Kadang ada tulisan **"→ halaman 2"** = artinya kalimat itu ada di halaman 2 PDF.
- Tombol biru **"Buka di halaman 2"** → klik → PDF terbuka langsung di halaman itu + kalimatnya di-highlight kuning.

### 6e. Viewer PDF 📕 (saat membuka PDF)
- **Judul + info file** (nama, ukuran).
- **Bar hitam (toolbar)** berisi tombol-tombol, dari kiri ke kanan:
  1. **◀ ▶** = pindah halaman mundur / maju.
  2. **Kotak angka + "/ 3"** = nomor halaman. Ketik angka → Enter untuk lompat.
  3. **➖ ➕** = zoom kecil / besar.
  4. **Kotak "Cari kalimat di PDF ini…"** = cari di dalam PDF yang sedang dibuka. Hasilnya: tulisan kuning "2 hal cocok" + tombol **hal 1, hal 2** → klik untuk lompat.
  5. **▲ ▼** = pindah ke temuan sebelumnya / berikutnya.
  6. **✨ OCR halaman ini** (biru) = untuk PDF hasil SCAN/foto yang teksnya tidak bisa dicari. Klik → muncul pop-up hasil bacaan teks.
  7. **⬇ Unduh** = download PDF.
- **Area abu-abu** = halaman PDF-nya. Teks bisa di-blok (copy-paste) kalau PDF teks asli.

### 6f. Viewer Markdown 📝 (saat membuka .md)
- Isi dokumen tampil rapi (judul, tabel, kode).
- **Kotak "Cari di dokumen ini…"** + tombol **Cari** → temuan ditandai kuning + layar otomatis scroll ke sana.
- **⬇ Unduh .md** = download file mentahnya.

### 6g. Halaman OCR ✨ (klik filter ✨ OCR di sidebar kiri)
- **Kotak biru putus-putus**: klik untuk pilih gambar, atau drag gambar ke sana.
- Tombol **"Gunakan contoh-nota.png"** → coba ini dulu kalau belum punya gambar.
- **Bahasa**: pilih Indonesia + Inggris (bawaan, sudah benar).
- Tombol **▶ Jalankan OCR** → tunggu bar biru 0→100% (pertama kali agak lama karena unduh model ±5–10 MB).
- **Kotak besar** di bawah = hasil teks bacaan. Bisa dicari (kotak "Cari di hasil OCR…"), **📋 Salin**, atau **⬇ .txt** (download).

---

## Tahap 7 — Upload Dokumen Milik Sendiri

1. Di repo GitHub, klik folder **`docs`** → klik **Add file → Upload files**.
2. Drag PDF / .md / gambar kamu ke sana → **Commit changes**.
3. **Tidak perlu edit apapun!** Sistem otomatis (GitHub Actions) membangun ulang index dalam 1–2 menit.
4. Cek tab **Actions** sampai hijau ✅ → refresh website → file kamu muncul di sidebar kiri + bisa di-search.
5. Aturan: maksimal **100 MB per file**, total repo usahakan **< 500 MB**.

> 🗑️ Hapus file contoh? Buka file → klik ikon tempat sampah → Commit. Website ikut terupdate otomatis.

---

## Kalau Ada Masalah 🆘

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| Website 404 | Pages belum aktif / salah Source | Settings → Pages → Source = **GitHub Actions**; tunggu 3 mnt, refresh |
| Actions merah (gagal) | Folder `.github` tidak ter-upload | Lihat Lampiran A |
| Badge "Memuat index…" terus | Buka via `file://` / file belum ter-upload | Wajib buka via alamat `https://...github.io/...`, bukan file lokal |
| PDF tidak bisa di-search | PDF hasil scan (gambar) | Pakai tombol **✨ OCR halaman ini** |
| OCR gagal / loading terus | Internet putus / CDN diblokir | Refresh, coba browser Chrome, pastikan internet lancar |
| File baru tidak muncul | Actions belum selesai | Tunggu centang hijau di tab Actions, lalu refresh website |

---

## Lampiran A — Kalau folder `.github` tidak ikut ter-upload

1. Di repo, klik **Add file → Create new file**.
2. Di kolom nama file ketik persis: `.github/workflows/pages.yml`
3. Copy-paste seluruh isi di bawah ke kotak besar:

```yaml
name: Deploy + Rebuild Index ke GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Rebuild search index
        run: |
          pip install pypdf
          python3 scripts/build-index.py

      - uses: actions/upload-pages-artifact@v3
        with:
          path: .

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

4. Klik **Commit changes** → cek tab Actions sampai hijau.

---

## ✅ Checklist Selesai

- [ ] Akun GitHub jadi + email terverifikasi
- [ ] Repo `arsip-digital` (Public) terisi file project
- [ ] Settings → Pages → Source = GitHub Actions
- [ ] Actions centang hijau + alamat website bisa dibuka
- [ ] Mencoba: search global, buka PDF + find, buka MD, coba OCR contoh
- [ ] Upload 1 dokumen sendiri + muncul di website

Selamat! Kamu resmi punya website arsip digital gratis. 🎉
