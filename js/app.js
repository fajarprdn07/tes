/* Arsip Digital — app.js
 * Static: manifest.json + search-index.json -> Fuse.js global search
 * PDF: PDF.js render + find per halaman + highlight textLayer + OCR halaman
 * MD: marked.js render + find highlight
 * OCR: Tesseract.js
 */
(function () {
"use strict";

if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

const $ = (id) => document.getElementById(id);
const state = {
  manifest: [], index: [], fuse: null,
  filter: "all", currentDoc: null,
  pdfDoc: null, pdfPage: 1, pdfScale: 1.4, pdfRendering: false,
  pageTexts: [], findMatches: [], findIdx: -1, findQuery: "",
  ocrImage: null,
};

const TYPE_LABEL = { pdf: "PDF", md: "MD", image: "GAMBAR" };
const fmtSize = (b) => b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB";
const esc = (s) => (s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function showView(id) {
  ["view-welcome", "view-results", "view-pdf", "view-md", "view-ocr"].forEach((v) => $(v).classList.add("hidden"));
  $(id).classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------- LOAD ----------
async function init() {
  try {
    const [m, s] = await Promise.all([
      fetch("manifest.json").then((r) => r.json()),
      fetch("search-index.json").then((r) => r.json()).catch(() => []),
    ]);
    state.manifest = m; state.index = s.length ? s : m.map((d) => ({ ...d, content: d.title }));
    initFuse();
    renderList();
    $("indexBadge").textContent = `✓ Index siap — ${m.length} dokumen`;
    $("indexBadge").className = "badge ok";
    $("docCount").textContent = `(${m.length})`;
    const pdfs = m.filter((d) => d.type === "pdf").length, mds = m.filter((d) => d.type === "md").length;
    $("welcomeStats").textContent = `Terindex: ${m.length} dokumen (${pdfs} PDF, ${mds} Markdown, ${m.length - pdfs - mds} gambar). Index ${(JSON.stringify(state.index).length / 1024).toFixed(1)} KB dimuat lokal di browser.`;
  } catch (e) {
    $("indexBadge").textContent = "✗ Gagal memuat manifest.json — jalankan server lokal / deploy dulu";
    console.error(e);
  }
  bindEvents();
}

function initFuse() {
  if (!window.Fuse) { state.fuse = null; return; }
  state.fuse = new Fuse(state.index, {
    keys: [{ name: "title", weight: 0.35 }, { name: "content", weight: 0.65 }],
    includeMatches: true, includeScore: true,
    threshold: 0.45, ignoreLocation: true, minMatchCharLength: 3,
  });
}

// ---------- SIDEBAR ----------
function renderList() {
  const box = $("docList"); box.innerHTML = "";
  const docs = state.manifest.filter((d) => state.filter === "all" || d.type === state.filter);
  if (!docs.length) { box.innerHTML = '<p class="muted small">Tidak ada dokumen.</p>'; return; }
  docs.forEach((d) => {
    const el = document.createElement("div");
    el.className = "doc" + (state.currentDoc && state.currentDoc.id === d.id ? " active" : "");
    el.innerHTML = `<div class="t"><span class="tag ${d.type}">${TYPE_LABEL[d.type] || d.type}</span>${esc(d.title)}</div>
      <div class="m">${esc(d.file)} &bull; ${fmtSize(d.size)}${d.pages ? " &bull; " + d.pages + " hal" : ""}</div>`;
    el.onclick = () => openDoc(d);
    box.appendChild(el);
  });
}

// ---------- GLOBAL SEARCH ----------
function snippetAround(content, query, radius = 130) {
  const lc = content.toLowerCase(), q = query.toLowerCase().trim();
  let pos = lc.indexOf(q);
  if (pos < 0) { // coba kata pertama yang ketemu (fuzzy fallback)
    for (const w of q.split(/\s+/).filter((w) => w.length > 2)) { pos = lc.indexOf(w); if (pos >= 0) break; }
  }
  if (pos < 0) return { html: esc(content.slice(0, 220)) + "…", page: null };
  const start = Math.max(0, pos - radius), end = Math.min(content.length, pos + q.length + radius);
  let snip = content.slice(start, end);
  // deteksi halaman terakhir sebelum match
  let page = null;
  const before = content.slice(0, pos);
  const m = before.match(/\[\[HALAMAN (\d+)\]\]/g);
  if (m) { const last = m[m.length - 1].match(/(\d+)/); page = last ? +last[1] : null; }
  snip = snip.replace(/\[\[HALAMAN \d+\]\]/g, " ");
  // highlight semua kata query
  q.split(/\s+/).filter((w) => w.length > 2).forEach((w) => {
    snip = snip.replace(new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi"), "<mark>$1</mark>");
  });
  return { html: (start > 0 ? "…" : "") + snip + (end < content.length ? "…" : ""), page };
}

function doGlobalSearch(q) {
  q = (q || "").trim();
  if (q.length < 2) { showView("view-welcome"); return; }
  let results = [];
  if (state.fuse) {
    results = state.fuse.search(q).slice(0, 30).map((r) => ({ doc: r.item, score: r.score }));
  } else {
    const lc = q.toLowerCase();
    results = state.index.filter((d) => (d.title + " " + d.content).toLowerCase().includes(lc)).slice(0, 30).map((d) => ({ doc: d }));
  }
  $("resTitle").textContent = `Hasil untuk "${q}"`;
  $("resMeta").textContent = `${results.length} dokumen cocok (klik Buka untuk lompat ke lokasi).`;
  const box = $("resList"); box.innerHTML = "";
  if (!results.length) {
    box.innerHTML = `<p class="muted">Tidak ketemu. Tips: coba kata lebih pendek / ejaan lain. Untuk PDF scan, teks belum ada sebelum di-OCR.</p>`;
  }
  results.forEach(({ doc }) => {
    const man = state.manifest.find((d) => d.id === doc.id) || doc;
    const { html, page } = snippetAround(doc.content || "", q);
    const el = document.createElement("div");
    el.className = "result";
    el.innerHTML = `<div class="rh"><span class="tag ${man.type}">${TYPE_LABEL[man.type] || ""}</span>
      <span class="rt">${esc(doc.title)}</span></div>
      <div class="m small muted">${esc(man.file || "")}${page ? ` &bull; <span class="pg">→ halaman ${page}</span>` : ""}</div>
      <div class="snip">${html}</div>`;
    const b = document.createElement("button");
    b.textContent = page ? `Buka di halaman ${page}` : "Buka dokumen";
    b.onclick = () => openDoc(man, { query: q, page: page || 1 });
    el.appendChild(b);
    box.appendChild(el);
  });
  showView("view-results");
}

// ---------- ROUTER ----------
function openDoc(d, opts = {}) {
  state.currentDoc = d; renderList();
  document.querySelectorAll(".filters button").forEach((b) => b.classList.toggle("active", b.dataset.f === "all" || b.dataset.f === d.type));
  if (d.type === "pdf") openPdf(d, opts);
  else if (d.type === "md") openMd(d, opts);
  else openImageAsOcr(d);
}

// ---------- PDF ----------
async function openPdf(d, opts = {}) {
  if (!window.pdfjsLib) {
    alert("PDF.js gagal dimuat (butuh internet untuk CDN). File tetap bisa diunduh: " + d.path);
    return;
  }
  showView("view-pdf");
  $("pdfTitle").textContent = "📕 " + d.title;
  $("pdfMeta").textContent = `${d.file} • ${fmtSize(d.size)}`;
  $("pdfFind").value = opts.query || ""; $("pdfFindStat").textContent = ""; $("pdfFindPages").innerHTML = "";
  state.pageTexts = []; state.findMatches = []; state.findIdx = -1; state.findQuery = "";
  state.pdfPage = opts.page || 1;
  try {
    state.pdfDoc = await pdfjsLib.getDocument(d.path).promise;
    $("pdfPageCount").textContent = state.pdfDoc.numPages;
    $("pdfPageNum").max = state.pdfDoc.numPages;
    await renderPdfPage();
    // pre-extract untuk find (async, tidak blokir render)
    extractAllPageTexts().then(() => { if (opts.query) pdfFind(opts.query); });
  } catch (e) {
    console.error(e);
    $("pdfMeta").textContent = "Gagal memuat PDF: " + e.message;
  }
}

async function renderPdfPage() {
  if (!state.pdfDoc || state.pdfRendering) return;
  state.pdfRendering = true;
  const page = await state.pdfDoc.getPage(state.pdfPage);
  const viewport = page.getViewport({ scale: state.pdfScale });
  const canvas = $("pdfCanvas"), ctx = canvas.getContext("2d");
  canvas.width = viewport.width; canvas.height = viewport.height;
  await page.render({ canvasContext: ctx, viewport }).promise;
  // text layer (seleksi + highlight)
  const tLayer = $("textLayer");
  tLayer.innerHTML = ""; tLayer.style.width = viewport.width + "px"; tLayer.style.height = viewport.height + "px";
  try {
    const tc = await page.getTextContent();
    await pdfjsLib.renderTextLayer({ textContent: tc, container: tLayer, viewport, textDivs: [] }).promise;
    if (state.findQuery) highlightTextLayer(state.findQuery);
  } catch (e) { console.warn("textLayer:", e); }
  $("pdfPageNum").value = state.pdfPage;
  state.pdfRendering = false;
}

async function extractAllPageTexts() {
  const n = state.pdfDoc.numPages;
  state.pageTexts = new Array(n + 1).fill("");
  for (let i = 1; i <= n; i++) {
    try {
      const pg = await state.pdfDoc.getPage(i);
      const tc = await pg.getTextContent();
      state.pageTexts[i] = tc.items.map((it) => it.str).join(" ");
    } catch (e) { state.pageTexts[i] = ""; }
  }
}

function pdfFind(q) {
  q = (q || "").trim(); state.findQuery = q;
  state.findMatches = []; state.findIdx = -1;
  if (q.length < 2) { $("pdfFindStat").textContent = ""; $("pdfFindPages").innerHTML = ""; highlightTextLayer(""); return; }
  const lc = q.toLowerCase();
  for (let i = 1; i < state.pageTexts.length; i++) {
    if ((state.pageTexts[i] || "").toLowerCase().includes(lc)) state.findMatches.push(i);
  }
  if (!state.findMatches.length) {
    $("pdfFindStat").textContent = "0 cocok";
    $("pdfFindPages").innerHTML = `<span class="muted">Tidak ditemukan. Jika ini PDF scan, klik <b>OCR halaman ini</b>.</span>`;
    return;
  }
  $("pdfFindStat").textContent = `${state.findMatches.length} hal cocok`;
  $("pdfFindPages").innerHTML = "Ditemukan di halaman: " + state.findMatches.map(
    (p) => `<button class="chip" data-p="${p}" style="margin:2px">hal ${p}</button>`).join("");
  $("pdfFindPages").querySelectorAll("button").forEach((b) => b.onclick = () => gotoPdfPage(+b.dataset.p));
  // lompat ke match pertama/terdekat
  const target = state.findMatches.includes(state.pdfPage) ? state.pdfPage : state.findMatches[0];
  gotoPdfPage(target);
}

async function gotoPdfPage(p) {
  if (!state.pdfDoc) return;
  p = Math.max(1, Math.min(state.pdfDoc.numPages, p));
  state.pdfPage = p; await renderPdfPage();
}

function highlightTextLayer(q) {
  const layer = $("textLayer");
  layer.querySelectorAll("mark").forEach((m) => { m.replaceWith(document.createTextNode(m.textContent)); });
  layer.normalize();
  if (!q || q.length < 2) return;
  const words = q.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const spans = layer.querySelectorAll("span");
  spans.forEach((sp) => {
    let html = esc(sp.textContent);
    words.forEach((w) => {
      html = html.replace(new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi"), "<mark>$1</mark>");
    });
    if (html !== esc(sp.textContent)) sp.innerHTML = html;
  });
}

function stepPdfFind(dir) {
  if (!state.findMatches.length) return;
  let i = state.findMatches.indexOf(state.pdfPage);
  i = i < 0 ? (dir > 0 ? 0 : state.findMatches.length - 1) : (i + dir + state.findMatches.length) % state.findMatches.length;
  gotoPdfPage(state.findMatches[i]);
}

// OCR satu halaman PDF
async function ocrCurrentPdfPage() {
  if (!state.pdfDoc) return;
  if (!window.Tesseract) { alert("Tesseract.js gagal dimuat (butuh internet untuk CDN)."); return; }
  const p = state.pdfPage;
  $("modal").classList.remove("hidden");
  $("mPage").textContent = "halaman " + p;
  $("mText").textContent = "…"; $("mStatus").textContent = "Merender halaman…"; $("mProg").style.width = "5%";
  try {
    const page = await state.pdfDoc.getPage(p);
    const vp = page.getViewport({ scale: 2.5 });
    const c = document.createElement("canvas"); c.width = vp.width; c.height = vp.height;
    await page.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
    $("mStatus").textContent = "Menjalankan OCR (ind+eng)…";
    const res = await Tesseract.recognize(c, "ind+eng", {
      logger: (m) => { if (m.status === "recognizing text") { $("mProg").style.width = Math.round(m.progress * 100) + "%"; $("mStatus").textContent = `OCR… ${Math.round(m.progress * 100)}%`; } },
    });
    $("mProg").style.width = "100%";
    $("mStatus").textContent = `Selesai (confidence ${Math.round(res.data.confidence)}%).`;
    $("mText").textContent = res.data.text.trim() || "(tidak ada teks terbaca)";
  } catch (e) { $("mStatus").textContent = "Gagal: " + e.message; }
}

// ---------- MARKDOWN ----------
let mdRaw = "";
async function openMd(d, opts = {}) {
  showView("view-md");
  $("mdTitle").textContent = "📝 " + d.title;
  $("mdMeta").textContent = `${d.file} • ${fmtSize(d.size)}`;
  $("mdFind").value = opts.query || ""; $("mdFindStat").textContent = "";
  try {
    mdRaw = await (await fetch(d.path)).text();
    const html = window.marked ? marked.parse(mdRaw) : "<pre>" + esc(mdRaw) + "</pre>";
    $("mdContent").innerHTML = html;
    if (opts.query) mdFind(opts.query);
  } catch (e) { $("mdContent").innerHTML = "<p>Gagal memuat: " + esc(e.message) + "</p>"; }
}

function mdFind(q) {
  q = (q || "").trim();
  const box = $("mdContent");
  box.querySelectorAll("mark").forEach((m) => { m.replaceWith(document.createTextNode(m.textContent)); });
  box.normalize();
  if (q.length < 2) { $("mdFindStat").textContent = ""; return; }
  const words = q.split(/\s+/).filter((w) => w.length > 2);
  let count = 0;
  const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((n) => {
    if (["SCRIPT", "STYLE"].includes(n.parentNode.tagName)) return;
    let html = esc(n.textContent), hit = false;
    words.forEach((w) => {
      const re = new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
      if (re.test(n.textContent)) { hit = true; count++; }
      html = html.replace(re, "<mark>$1</mark>");
    });
    if (hit) { const sp = document.createElement("span"); sp.innerHTML = html; n.replaceWith(sp); }
  });
  $("mdFindStat").textContent = count ? `${count} kecocokan ditandai.` : "Tidak ditemukan.";
  const first = box.querySelector("mark");
  if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ---------- OCR GAMBAR ----------
function openImageAsOcr(d) {
  showView("view-ocr");
  setOcrImage(d.path);
}

async function setOcrImage(src) {
  const img = $("ocrPreview");
  img.src = src; img.classList.remove("hidden");
  state.ocrImage = src;
  $("ocrStatus").textContent = "Gambar siap. Klik Jalankan OCR.";
  $("ocrResult").value = "";
}

async function runOcr() {
  if (!state.ocrImage) { alert("Pilih gambar dulu."); return; }
  if (!window.Tesseract) { alert("Tesseract.js gagal dimuat (butuh internet untuk CDN)."); return; }
  const lang = $("ocrLang").value;
  $("ocrProgWrap").classList.remove("hidden");
  $("ocrStatus").textContent = "Memuat model OCR… (pertama kali ~5–10 MB)";
  try {
    const res = await Tesseract.recognize(state.ocrImage, lang, {
      logger: (m) => {
        if (m.status === "recognizing text") {
          $("ocrProg").style.width = Math.round(m.progress * 100) + "%";
          $("ocrStatus").textContent = `OCR berjalan… ${Math.round(m.progress * 100)}%`;
        } else { $("ocrStatus").textContent = m.status + "…"; }
      },
    });
    $("ocrProg").style.width = "100%";
    $("ocrStatus").textContent = `Selesai (confidence ${Math.round(res.data.confidence)}%).`;
    $("ocrResult").value = (res.data.text || "").trim() || "(tidak ada teks terbaca)";
  } catch (e) { $("ocrStatus").textContent = "Gagal: " + e.message; }
}

function download(filename, text) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// ---------- EVENTS ----------
function bindEvents() {
  document.querySelectorAll(".filters button").forEach((b) => b.onclick = () => {
    if (b.dataset.f === "ocr") { showView("view-ocr"); return; }
    state.filter = b.dataset.f;
    document.querySelectorAll(".filters button").forEach((x) => x.classList.remove("active"));
    b.classList.add("active"); renderList();
  });

  let t;
  $("globalSearch").addEventListener("input", (e) => { clearTimeout(t); t = setTimeout(() => doGlobalSearch(e.target.value), 250); });
  $("btnSearch").onclick = () => doGlobalSearch($("globalSearch").value);
  $("globalSearch").addEventListener("keydown", (e) => { if (e.key === "Enter") doGlobalSearch(e.target.value); });
  document.querySelectorAll("#testChips .chip").forEach((c) => c.onclick = () => { $("globalSearch").value = c.textContent; doGlobalSearch(c.textContent); });
  $("btnBackWelcome").onclick = () => showView("view-welcome");

  // PDF
  $("pdfPrev").onclick = () => gotoPdfPage(state.pdfPage - 1);
  $("pdfNext").onclick = () => gotoPdfPage(state.pdfPage + 1);
  $("pdfPageNum").onchange = (e) => gotoPdfPage(+e.target.value);
  $("pdfZoomIn").onclick = () => { state.pdfScale = Math.min(3, state.pdfScale + 0.2); renderPdfPage(); };
  $("pdfZoomOut").onclick = () => { state.pdfScale = Math.max(0.6, state.pdfScale - 0.2); renderPdfPage(); };
  let pt;
  $("pdfFind").addEventListener("input", (e) => { clearTimeout(pt); pt = setTimeout(() => pdfFind(e.target.value), 300); });
  $("pdfFindNext").onclick = () => stepPdfFind(1);
  $("pdfFindPrev").onclick = () => stepPdfFind(-1);
  $("btnOcrPage").onclick = ocrCurrentPdfPage;
  $("btnPdfDl").onclick = () => { if (state.currentDoc) { const a = document.createElement("a"); a.href = state.currentDoc.path; a.download = state.currentDoc.file; a.click(); } };

  // MD
  $("btnMdFind").onclick = () => mdFind($("mdFind").value);
  $("mdFind").addEventListener("keydown", (e) => { if (e.key === "Enter") mdFind(e.target.value); });
  $("btnMdDl").onclick = () => { if (state.currentDoc) download(state.currentDoc.file, mdRaw); };

  // OCR
  $("ocrDrop").onclick = (e) => { if (e.target.id !== "btnOcrSample") $("ocrFile").click(); };
  $("ocrFile").onchange = (e) => { const f = e.target.files[0]; if (f) setOcrImage(URL.createObjectURL(f)); };
  $("ocrDrop").ondragover = (e) => e.preventDefault();
  $("ocrDrop").ondrop = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setOcrImage(URL.createObjectURL(f)); };
  $("btnOcrSample").onclick = (e) => { e.stopPropagation(); setOcrImage("docs/images/contoh-nota.png"); };
  $("btnOcrRun").onclick = runOcr;
  $("btnOcrCopy").onclick = () => { $("ocrResult").select(); document.execCommand("copy"); };
  $("btnOcrDl").onclick = () => download("hasil-ocr.txt", $("ocrResult").value);
  $("ocrFind").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase(), txt = $("ocrResult");
    const i = txt.value.toLowerCase().indexOf(q);
    if (q.length > 1 && i >= 0) { txt.focus(); txt.setSelectionRange(i, i + q.length); }
  });

  // Modal
  $("btnModalClose").onclick = () => $("modal").classList.add("hidden");
  $("modal").onclick = (e) => { if (e.target.id === "modal") $("modal").classList.add("hidden"); };
  $("btnModalCopy").onclick = () => navigator.clipboard.writeText($("mText").textContent).then(() => alert("Tersalin!"));
}

document.addEventListener("DOMContentLoaded", init);
})();
