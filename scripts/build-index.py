#!/usr/bin/env python3
"""
build-index.py — Generate manifest.json + search-index.json dari folder docs/

Cara pakai:
    pip install pypdf
    python3 scripts/build-index.py

Jalankan setiap kali tambah/hapus/edit file di docs/, lalu commit hasilnya.
Bisa juga otomatis via GitHub Actions (lihat .github/workflows/pages.yml).
"""
import json, os, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
MAX_CHARS_PER_DOC = 20000   # potong konten per file agar index tetap ringan
MAX_TOTAL_CHARS = 2_000_000 # guard: ~2 juta char ≈ 2-4 MB JSON

try:
    from pypdf import PdfReader
    HAS_PYPDF = True
except ImportError:
    HAS_PYPDF = False
    print("WARNING: pypdf tidak terinstall. PDF akan diindex judulnya saja.")
    print("Install: pip install pypdf")

def clean_text(t: str) -> str:
    t = re.sub(r"\s+", " ", t or "").strip()
    return t

def extract_pdf(path: Path):
    """Return (num_pages, text)."""
    if not HAS_PYPDF:
        return 0, ""
    try:
        reader = PdfReader(str(path))
        pages = len(reader.pages)
        chunks = []
        for i, pg in enumerate(reader.pages):
            try:
                txt = pg.extract_text() or ""
            except Exception:
                txt = ""
            if txt.strip():
                # tandai batas halaman agar snippet bisa tahu halaman berapa
                chunks.append(f"\n[[HALAMAN {i+1}]]\n{txt}")
        return pages, clean_text(" ".join(chunks))[:MAX_CHARS_PER_DOC * 2]
    except Exception as e:
        print(f"  ! gagal baca PDF {path.name}: {e}")
        return 0, ""

def extract_md(path: Path) -> str:
    try:
        raw = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return ""
    # buang sintaks markdown agar search lebih bersih, tapi simpan teksnya
    raw = re.sub(r"```.*?```", " ", raw, flags=re.DOTALL)
    raw = re.sub(r"[#>*_`\[\]()!-]", " ", raw)
    return clean_text(raw)[:MAX_CHARS_PER_DOC]

def main():
    if not DOCS.exists():
        print(f"Folder docs/ tidak ditemukan di {DOCS}")
        sys.exit(1)

    files = sorted([p for p in DOCS.rglob("*") if p.is_file()
                    and p.suffix.lower() in (".pdf", ".md", ".markdown", ".png", ".jpg", ".jpeg", ".webp")])

    manifest = []
    index = []
    total_chars = 0

    print(f"Memproses {len(files)} file dari docs/ ...")
    for p in files:
        rel = p.relative_to(ROOT).as_posix()
        stat = p.stat()
        ext = p.suffix.lower()
        ftype = "pdf" if ext == ".pdf" else ("md" if ext in (".md", ".markdown") else "image")
        title = p.stem.replace("-", " ").replace("_", " ").title()

        content, pages, excerpt = "", 0, ""
        if ftype == "pdf":
            pages, content = extract_pdf(p)
        elif ftype == "md":
            content = extract_md(p)
        else:
            content = f"Gambar {p.name}. Gunakan fitur OCR untuk mengekstrak teks."

        # excerpt = 300 char pertama
        excerpt = content[:300]

        # budget guard
        if total_chars + len(content) > MAX_TOTAL_CHARS:
            print(f"  ! budget index habis, {p.name} hanya judul.")
            content = excerpt

        total_chars += len(content)

        manifest.append({
            "id": rel,
            "title": title,
            "file": p.name,
            "path": rel,
            "type": ftype,
            "size": stat.st_size,
            "pages": pages,
        })
        index.append({
            "id": rel,
            "title": title,
            "type": ftype,
            "path": rel,
            "pages": pages,
            "content": content,
        })
        print(f"  + {rel} ({ftype}, {stat.st_size//1024} KB, {len(content)} char)")

    (ROOT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
    (ROOT / "search-index.json").write_text(json.dumps(index, ensure_ascii=False), encoding="utf-8")

    idx_size = (ROOT / "search-index.json").stat().st_size
    print(f"\nSelesai. {len(manifest)} dokumen.")
    print(f"  manifest.json + search-index.json ({idx_size//1024} KB)")
    if idx_size > 5 * 1024 * 1024:
        print("  PERINGATAN: index > 5 MB, akan berat di HP. Pertimbangkan split per kategori.")
    else:
        print("  Index OK (< 5 MB). Siap commit & push.")

if __name__ == "__main__":
    main()
