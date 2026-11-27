# Public Landing Page Specification — Finora

**Versi Dokumen**: 1.0.0  
**Rute**: `/` (`src/app/(public)/page.tsx`)  
**Dokumen Terkait**: [STYLING.md](./STYLING.md) | [PUBLIC_ROUTES.md](./PUBLIC_ROUTES.md) | [SEO.md](../09-deployment/SEO.md)

---

## 1. Tujuan & Prinsip Landing Page

Halaman Landing Finora di `/` berfungsi sebagai gerbang perkenalan produk yang profesional, cepat, dan terindeks SEO sebelum pengguna masuk ke aplikasi keuangan pribadi di `/app`.

### Aturan Keras Halaman Publik
1. **Tanpa Ketergantungan IndexedDB**: Halaman `/` tidak boleh mengimpor Dexie.js, memanggil `initializeApp()`, maupun membaca catatan transaksi lokal pengguna (`NFR-011`).
2. **Pratinjau Statis**: Komponen `DashboardPreviewMockup` hanya memakai data ilustrasi statis (`Rp 8.500.000`, `Rp 3.240.000`, `Rp 14.260.000`) berlabel **"Pratinjau Ilustrasi"**.
3. **Nol Registrasi / Login**: Tidak ada tombol "Sign Up" atau "Login"; tombol aksi utama langsung mengarahkan pengguna ke `/app` dengan label **"Open My Finance"**.

---

## 2. Identitas Visual & Kalibrasi Estetika

Mengikuti [STYLING.md](./STYLING.md) dengan sentuhan editorial fintech berdasar referensi desain gelap-emerald:
- **Kanvas & Permukaan**: `#0B1220` (canvas), `#111C2E` (surface), `#17243A` (elevated card), border `#263449`.
- **Aksen Utama & Kontras**: Tombol primer pill `#10B981` dengan teks `#0B1220` (`7.38:1` AAA).
- **Tipografi Editorial Hero**: Judul `<h1>` menggabungkan `Plus Jakarta Sans` (bold) dengan aksen `Instrument Serif` italic (`--font-editorial-serif`) untuk penekanan kata kunci.
- **Atmosfer Latar**: Radial glow emerald sangat lembut (`.hero-emerald-glow`) di belakang Hero; bebas gradien pelangi atau efek dekorasi berlebih.

---

## 3. Struktur Wajib 13 Seksi Landing Page (`/`)

| Urutan | Nama Seksi | Isi & Persyaratan Utama |
|---|---|---|
| 1 | **Navigation Bar** | `PublicNavbar`: Logo Finora kiri, floating pill nav tengah (`Beranda`, `Fitur`, `Tentang`, `Privasi`), tombol pill `"Open My Finance"` (`→ /app`) di kanan, plus menu mobile responsif. |
| 2 | **Hero Section** | Badge status (*Local-First • Offline-First • Zero Signup*), `<h1>` tunggal, dan ringkasan nilai produk dalam Bahasa Indonesia. |
| 3 | **Primary CTA** | Tombol `"Open My Finance"` menuju `/app`. |
| 4 | **Secondary CTA** | Tombol `"Explore Features"` menuju `/features`. |
| 5 | **Product Dashboard Preview & Trust Pillars** | `DashboardPreviewMockup` (frame utama + kartu mengambang kurva SVG emerald) + strip 4 pilar teknis nyata (*100% IndexedDB Lokal*, *Zero Backend & Login*, *Offline-First PWA*, *Backup SHA-256*). |
| 6 | **Problem & Solution** | Perbandingan dua kolom: hambatan aplikasi berbasis server vs solusi local-first Finora. |
| 7 | **Core Features Showcase** | 6 kartu fitur inti (Arus Kas IDR, Anggaran, Target Anti-Double Counting, Berulang, Analitik & CSV, Backup JSON SHA-256). |
| 8 | **Privacy-First Architecture** | Penjelasan zero backend, zero telemetry, privacy mask, validasi Zod, kontrol hapus data, serta tautan ke `/privacy`. |
| 9 | **Offline-First PWA** | Penjelasan Service Worker, isolasi cache dari IndexedDB, dan operasional penuh saat offline. |
| 10 | **How It Works** | 3 langkah bernomor (`01` Buka `/app` → `02` Catat & Anggarkan → `03` Evaluasi & Backup Mandiri). |
| 11 | **FAQ Section** | `FaqAccordion` interaktif aksesibel (`aria-expanded`) menjawab 6 pertanyaan umum privasi, offline, dan backup. |
| 12 | **Final CTA** | Kartu ajakan penutup beraksen emerald menuju `/app` dan `/features`. |
| 13 | **Footer** | `PublicFooter` berisi tautan navigasi publik, pintasan `/app`, dan ringkasan komitmen zero-server. |

---

## 4. Responsivitas & Aksesibilitas

- Seluruh 13 seksi teruji tanpa horizontal overflow pada lebar `360px` hingga `1440px`.
- Tepat satu `<h1>` pada halaman `/`, diikuti hierarki `<h2>` dan `<h3>` yang runtut.
- FAQ accordion dan navigasi mobile dapat dioperasikan penuh menggunakan keyboard.
