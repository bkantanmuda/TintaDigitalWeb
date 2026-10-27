# Ringkasan Percakapan — Proyek Website TINTA DIGITAL

Dokumen ini merangkum seluruh diskusi dan pekerjaan pada proyek website
TINTA DIGITAL (tugas mata kuliah Technopreneurship).

---

## 1. Pembuatan Website dari Desain di Folder

**Permintaan:** Buatkan website menggunakan desain yang ada di folder `web`.

**Isi folder awal:**
- `code.html` — satu file jadi (~72 KB, 907 baris): header fixed, hero split,
  2 pilar layanan, DNA T-I-N-T-A, showcase landing page, katalog 6 produk
  printable + filter, 4 portofolio, 3 testimoni, 6 FAQ + accordion, CTA navy,
  footer. Styling via Tailwind CDN + Google Fonts + Material Symbols,
  gambar via URL eksternal.
- `DESIGN.md` — design system: navy `#002C70`, gold `#C2863C`,
  canvas `#FEFDFE`, font Outfit + Plus Jakarta Sans.
- `screen.png` — ternyata logo (pen nib + layar navy/gold), bukan screenshot.

**Keputusan user (via pertanyaan):**
- Struktur: project rapi (`index.html` + css/js terpisah)
- Gambar: tetap pakai URL asli
- Interaktivitas: tambah (hamburger mobile, form pemesanan WA, animasi scroll)
- Kebutuhan: demo lokal saja

**Hasil:**
- `index.html` — rapihan 1:1 dari `code.html`, tag per baris agar mudah dipresentasikan
- `css/style.css` — token `DESIGN.md`, style form, reveal animation, back-to-top
- `js/main.js` — accordion FAQ, filter printable, menu mobile, nav aktif,
  reveal on scroll, form cepat → WhatsApp, back-to-top, tahun otomatis
- `assets/logo.png` — copy dari `screen.png` (favicon + fallback logo)
- Tambahan: section form `#order` (Nama/Kebutuhan/Pesan → `wa.me`),
  semua section diberi `scroll-mt-24` agar anchor tidak tertutup header fixed
- Verifikasi: 21 cek lolos, `node --check js/main.js` bersih

---

## 2. Cara Menjalankan Website

- **Termudah:** klik 2x `index.html` di folder `web`.
- **Rapi (presentasi):** VS Code Live Server, atau `npx serve .` di folder `web`.
- Butuh internet (font, ikon, foto produk memakai URL eksternal).
- Tanpa `npm install` / build — murni static site.

---

## 3. Update Kontak (Gmail + Instagram)

**Permintaan:** pakai `tintadigital69@gmail.com` dan
`https://www.instagram.com/tintadigitalll?...`.

**Perubahan di `index.html`:**
- Ikon amplop: `mailto:halo@tintadigital.id` → `mailto:tintadigital69@gmail.com`
- Teks footer: `info@tintadigital.id` → `tintadigital69@gmail.com` (jadi link `mailto:`)
- Ikon kamera: URL instagram lama → `instagram.com/tintadigitalll` (lengkap + `&amp;`)
- Nomor WhatsApp tidak diubah. Tidak ada sisa kontak lama (cek via grep).

---

## 4. Perubahan Kartu Printable

**Permintaan:** sembunyikan harga; tombol "Unduh PDF" → "Lihat PDF" mengarah ke `Contoh.pdf`.

**Perubahan (6 kartu):**
- Blok harga dihapus (`Rp 45.000` coret, `29.000`, `25.000`, `29.000`,
  `24.000`, `35.000`, `32.000`); footer kartu rata kanan (`justify-end`)
- Tombol: teks "Lihat PDF", ikon `visibility`, `href="Contoh.pdf"` + `target="_blank"`
- File `Contoh.pdf` sudah ada di folder; link memakai ejaan persis (huruf C besar)

---

## 5. Agar Website Bisa Diakses via Link

**Opsi yang dibahas:**
- **Netlify Drop / Vercel / GitHub Pages** — link permanen, online 24 jam
- **Server dari laptop** — bisa, tapi laptop harus menyala + butuh tunnel
  untuk link publik; cocok untuk demo sementara, bukan toko yang selalu buka
- **Skenario demo kelas:** (A) tampilkan via proyektor dari `localhost`,
  (B) satu WiFi buka via IP laptop, (C) tunnel `cloudflared` untuk link publik

**Keputusan:** user pilih **GitHub** (demo cukup di kelas, tapi tetap punya link).

---

## 6. Deploy ke GitHub Pages

- Repo: `https://github.com/bkantanmuda/TintaDigitalWeb` (masih kosong saat dicek)
- Yang di-push: `index.html`, `css/style.css`, `js/main.js`,
  `assets/logo.png`, `Contoh.pdf`, `.gitignore`
- Yang TIDAK ikut: `code.html`, `DESIGN.md`, `screen.png` (didaftar di `.gitignore`)
- Kendala auth: password GitHub ditolak → user membuat Personal Access Token;
  token pertama tertolak saat push (`invalid credentials`, tapi valid di API —
  masalah format header), push berhasil dengan format
  `https://x-access-token:<token>@github.com/...`
- Token tidak disimpan di config; riwayat terminal dibersihkan
- **Langkah manual tersisa (oleh user di browser):**
  repo → Settings → Pages → Deploy from a branch → `main` / `/ (root)` → Save
- **Link hasil:** `https://bkantanmuda.github.io/TintaDigitalWeb/`
- Setelah aktif: rencanakan verifikasi (tampilan, filter, FAQ, Lihat PDF,
  `Contoh.pdf`, kontak baru)
- Saran keamanan: hapus token di GitHub setelah push berhasil

---

*Dibuat otomatis dari riwayat percakapan — 15 Oktober 2026.*
