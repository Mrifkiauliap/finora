# Security Architecture & Hardening — Finora

**Versi Dokumen**: 1.0.0  
**Status**: Baseline Disetujui  
**Dokumen Terkait**: [PRIVACY.md](./PRIVACY.md) | [BACKUP_RESTORE.md](./BACKUP_RESTORE.md) | [PWA_STRATEGY.md](../06-pwa/PWA_STRATEGY.md) | [DEPLOYMENT.md](../09-deployment/DEPLOYMENT.md)

---

## 1. Model Ancaman (*Threat Model*)

Karena Finora berjalan 100% di browser tanpa backend/database terpusat, profil ancamannya berbeda secara fundamental dari aplikasi SaaS tradisional. Tidak ada basis data SQL terpusat atau sesi server yang dapat diretas dari jauh, namun permukaan serangan tetap ada pada runtime browser pengguna dan rantai distribusi kode (*supply chain* & CDN).

| ID Ancaman | Vektor Serangan | Dampak Potensial | Mitigasi Utama |
|---|---|---|---|
| **TH-01** | **Stored/DOM Cross-Site Scripting (XSS)** lewat catatan transaksi, nama kategori, atau file backup impor | Eksekusi skrip jahat yang membaca/memodifikasi seluruh `FinoraDB` | React escaping default, nol penggunaan `dangerouslySetInnerHTML`, validasi Zod ketat, CSP ketat (`SEC-001`, `SEC-002`). |
| **TH-02** | **Malicious Backup JSON** (ukuran raksasa/DoS, prototype pollution `__proto__`, tipe data korup, checksum palsu) | Crash tab browser, polusi prototipe JS, atau kerusakan integritas `FinoraDB` | Batas file `25 MB`, sanitasi kunci prototipe, Zod `.strict()`, verifikasi SHA-256, transaksi atomik Dexie (`SEC-003`–`SEC-005`). |
| **TH-03** | **CSV Formula Injection** lewat kolom `note` atau `categoryName` saat dibuka di Excel/Sheets | Eksekusi rumus/perintah berbahaya di aplikasi spreadsheet pengguna | Prefiks `'` pada sel yang diawali `=`, `+`, `-`, `@`, `\t`, `\r` (`SEC-006`). |
| **TH-04** | **Supply-Chain Compromise** pada dependensi npm atau CDN pihak ketiga | Pencurian data IndexedDB ke domain penyerang | Nol skrip pihak ketiga runtime, `next/font` self-hosted, `connect-src 'self'`, `npm audit`, lockfile pinned (`SEC-008`, `SEC-009`). |
| **TH-05** | **Clickjacking / Embedding Iframe Berbahaya** | Penipuan klik UI (misalnya memicu reset data atau ekspor) | `X-Frame-Options: DENY` dan CSP `frame-ancestors 'none'` (`SEC-007`). |
| **TH-06** | **Akses Lokal Fisik / Ekstensi Browser Berbahaya / Device Sharing** | Pembacaan langsung IndexedDB melalui DevTools atau ekstensi berhak luas | Di luar kendali penuh aplikasi web; dimitigasi sebagian via `PrivacyMaskToggle`, tombol Wipe Data cepat, dan edukasi jujur di bagian Batasan. |

---

## 2. Pencegahan XSS, Validasi Input, dan Safe Rendering

1. **Larangan API Sink Berbahaya (`SEC-001`)**:
   - Dilarang memakai `dangerouslySetInnerHTML`, `eval()`, `new Function()`, `document.write()`, `innerHTML`, atau `javascript:` URI pada href.
   - URL atau atribut dinamis tidak pernah menerima input bebas pengguna (ikon dan warna kategori dipilih dari *whitelist* terkurasi).
2. **Validasi Batas Sistem (`SEC-002`)**:
   - Setiap input formulir dan setiap berkas restore JSON wajib melewati skema **Zod `.strict()`** sebelum diteruskan ke service layer.
   - Angka uang wajib `Number.isSafeInteger`; tanggal wajib cocok regex `YYYY-MM-DD` dan kalender valid; string di-trim dan dibatasi panjangnya (`DATA_DICTIONARY.md`).
3. **Keamanan Dependensi (`SEC-009`)**:
   - Commit dan pertahankan `package-lock.json` (atau lockfile paket manajer yang disepakati).
   - Jalankan `npm audit --omit=dev` sebelum rilis produksi; tidak boleh ada kerentanan *critical* tanpa mitigasi terverifikasi.

---

## 3. Keamanan Penyimpanan Browser & Validasi File Backup

- **Penyimpanan Browser**: IndexedDB diisolasi per *origin* oleh *Same-Origin Policy* browser. Namun, IndexedDB **tidak terenkripsi secara default** oleh kunci rahasia pengguna di MVP. Oleh karena itu, Finora **tidak mengklaim** tahan terhadap penyerang yang sudah memiliki akses fisik penuh ke sistem operasi/profil browser pengguna atau ekstensi browser berbahaya.
- **Validasi File Backup (`SEC-003` – `SEC-005`)**:
  - Tolak file non-`.json` dan ukuran `> 25 MB` sebelum parsing.
  - Gunakan parser aman yang membuang kunci `__proto__`, `constructor`, `prototype` serta validasi Zod `.strict()`.
  - Hitung ulang SHA-256 `payload` dan tolak apabila tidak identik dengan `checksum.value` (rinci di [BACKUP_RESTORE.md](./BACKUP_RESTORE.md)).

---

## 4. Delapan HTTP Security Headers Wajib (`SEC-007`)

Deployment produksi di Vercel wajib mengirimkan delapan header berikut pada seluruh respons dokumen dan aset relevan:

| No | Header | Nilai Wajib / Konfigurasi Baseline | Tujuan Keamanan |
|---|---|---|---|
| 1 | `Content-Security-Policy` | Lihat kebijakan & catatan kompatibilitas pada Bagian 5 di bawah | Membatasi sumber skrip, gaya, font, worker, koneksi, dan framing. |
| 2 | `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Memaksa koneksi HTTPS dan mencegah downgrade attack. |
| 3 | `X-Content-Type-Options` | `nosniff` | Mencegah MIME-type sniffing oleh browser. |
| 4 | `Referrer-Policy` | `no-referrer` | Memastikan tidak ada metadata referrer URL yang bocor keluar. |
| 5 | `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()` | Menutup akses API perangkat keras/sensor yang tidak dibutuhkan Finora. |
| 6 | `X-Frame-Options` | `DENY` | Mencegah aplikasi dimuat dalam `<iframe>` (clickjacking). |
| 7 | `Cross-Origin-Opener-Policy` | `same-origin` | Mengisolasi *browsing context group* dari tab lintas-origin. |
| 8 | `Cross-Origin-Resource-Policy` | `same-origin` | Mencegah sumber daya aplikasi di-embed/dibaca oleh origin lain. |

---

## 5. Content Security Policy (CSP) & Kompatibilitas Next.js App Router + PWA

### 5.1 Kebijakan CSP Target (Produksi)
```text
default-src 'self';
script-src 'self' 'nonce-{RANDOM_PER_REQUEST}';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self';
connect-src 'self';
worker-src 'self';
manifest-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
```

> **Peringatan Penting — Jangan Melemahkan CSP dengan `'unsafe-eval'`**: `'unsafe-eval'` **DILARANG** muncul di produksi (`next build`). Pada mode pengembangan lokal (`next dev`), Next.js membutuhkan `'unsafe-eval'` untuk React Fast Refresh/source maps; pembatasan ketat diterapkan untuk build produksi.

### 5.2 Analisis Kompatibilitas CSP dengan Next.js App Router & Service Worker PWA
Dokumentasi ini secara jujur mencatat konflik teknis yang sering terjadi antara **CSP ketat** dan **Next.js + PWA**:

1. **Masalah Inline Hydration Script Next.js**:
   Next.js App Router menyuntikkan skrip inline hidrasi (`self.__next_f.push(...)`) serta skrip inisialisasi tema anti-FOUC ke dalam HTML. Jika `script-src 'self'` diterapkan polos tanpa `'nonce-...'` atau `'sha256-...'`, browser akan memblokir skrip hidrasi tersebut.
2. **Konflik Nonce Dinamis vs Precaching Service Worker**:
   - Pola **Nonce per-request** melalui `middleware.ts` mewajibkan setiap permintaan HTML melewati Edge/Node middleware Vercel agar header `CSP` dan atribut `nonce="..."` di HTML selalu sinkron dan segar.
   - **Risiko PWA**: Jika Service Worker menyajikan dokumen HTML yang sudah di-cache sebelumnya (`CacheFirst` atau offline fallback) bersama header CSP lama/baru yang berbeda, atau jika halaman di-export statis murni tanpa middleware dinamis, nonce dapat mengalami *mismatch* sehingga skrip terblokir!
3. **Dua Pendekatan yang Sah & Aman (Tanpa `'unsafe-eval'`)**:
   - **Opsi A — Middleware Nonce + Dokumen HTML `NetworkFirst` pada SW**:
     Middleware Next.js menyuntikkan nonce acak tiap request HTML (`Cache-Control: private, no-store` untuk middleware dinamis atau `NetworkFirst` di SW sehingga HTML + header CSP selalu berpasangan dari respons yang sama dalam cache SW). Kekurangannya: memerlukan fungsi Edge Middleware pada Vercel untuk rute halaman.
   - **Opsi B — Subresource Integrity (SRI) / Hash-based CSP (`experimental.sri` atau static hash) tanpa Middleware**:
     Menggunakan hash SHA-256 untuk skrip inline deterministik + `'self'` untuk berkas JS eksternal sehingga 100% halaman tetap statis murni (*Static Site Generation*) dan aman di-precache oleh Service Worker tanpa ketergantungan nonce per-request. Namun, inline hydration payload Next.js yang berubah-ubah membuat hash manual rapuh jika tidak diotomatisasi saat build.
   - **Keputusan Sebelum Phase 1/5 (*Open Decision*)**: Tim pengembang harus memverifikasi di prototipe build Next.js + Serwist versi terpilih pada Phase 1/5 apakah **Opsi A (Middleware Nonce + NetworkFirst HTML cache pasangan header+body)** berjalan mulus saat offline di Chromium/Safari, atau menggunakan **Opsi B (SRI hash build-time)** jika static-only dipilih. **Yang mutlak dilarang**: menambahkan `'unsafe-eval'` atau `'unsafe-inline'` pada `script-src` di produksi hanya agar build cepat jalan.

### 5.3 Penanganan `style-src` dan Recharts
- Tailwind CSS menghasilkan berkas CSS statis (`'self'`), sedangkan komponen grafik **Recharts** dan beberapa primitive Radix dapat menyuntikkan `style="..."` inline untuk posisi koordinat SVG/popover. Oleh sebab itu, `style-src 'self' 'unsafe-inline'` didokumentasikan sebagai trade-off terkontrol untuk styling dinamis komponen chart/UI (tanpa mengizinkan `script-src 'unsafe-inline'`).

---

## 6. Batasan Keamanan (*Security Limitations*)

1. **Tidak Ada Enkripsi At-Rest di MVP**: Data dalam `FinoraDB` dan file ekspor JSON berada dalam bentuk teks terstruktur standar (bukan terenkripsi kata sandi).
2. **Kepercayaan Lingkungan Browser**: Jika perangkat terinfeksi malware atau pengguna memasang ekstensi browser berbahaya dengan izin `host_permissions` pada origin aplikasi, tidak ada aplikasi web murni yang dapat mencegah ekstensi tersebut membaca DOM atau IndexedDB.
3. **Pengelolaan Konteks Aman**: Web Crypto (`crypto.subtle`) hanya tersedia di *Secure Context* (`https://` atau `localhost`). Pengujian via IP LAN `http://192.168.x.x` tanpa HTTPS akan gagal menghitung checksum SHA-256.
