# PWA & Service Worker Strategy — Finora

**Versi Dokumen**: 1.0.0  
**Status**: Baseline Disetujui  
**Dokumen Terkait**: [OFFLINE_BEHAVIOR.md](./OFFLINE_BEHAVIOR.md) | [SECURITY.md](../05-security/SECURITY.md) | [ADR-004](../03-architecture/ADR/ADR-004-pwa-service-worker.md)

---

## 1. Tujuan & Persyaratan Dasar PWA

Finora harus memenuhi kriteria penuh Progressive Web Application agar dapat diinstal di perangkat seluler (Android/iOS) dan desktop (Windows/macOS/Linux), terbuka cepat, dan bekerja andal secara luring (`PWA-001` – `PWA-007`).

### Persyaratan HTTPS (`PWA-002`, `PWA-007`)
- Service Worker dan Web Crypto API (`crypto.subtle`) **hanya aktif pada origin aman (`https://`)** atau `http://localhost` / `127.0.0.1` saat pengembangan lokal.
- Deployment produksi Vercel secara otomatis menyediakan sertifikat TLS/HTTPS dan diperkuat header `Strict-Transport-Security`.

---

## 2. Konfigurasi Web App Manifest (`manifest.webmanifest`)

Disediakan melalui `src/app/manifest.ts` (Next.js App Router metadata route) atau `public/manifest.webmanifest`:

```json
{
  "name": "Finora — Your Money, Your Control",
  "short_name": "Finora",
  "description": "Aplikasi manajemen keuangan pribadi local-first dan offline-first yang menjaga penuh privasi Anda.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "lang": "id-ID",
  "background_color": "#0B1220",
  "theme_color": "#0B1220",
  "categories": ["finance", "productivity"],
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Selain manifest, `<head>` aplikasi menyertakan metadata pendukung untuk Apple iOS (`apple-touch-icon` `180×180`, `appleWebApp: { capable: true, title: 'Finora', statusBarStyle: 'black-translucent' }`).

---

## 3. Pemisahan Tegas Empat Kategori Sumber Daya (*Cache Isolation*)

> **Aturan Keamanan Mutlak (`PWA-004`)**: Service Worker **DILARANG KERAS** menyimpan data transaksi, kategori, anggaran, target, pengaturan, atau file ekspor pengguna di dalam `CacheStorage`.

| Kategori Sumber Daya | Contoh | Lokasi Penyimpanan | Kebijakan Cache |
|---|---|---|---|
| **1. Application Assets** | HTML app shell, `/offline`, bundel JS `/_next/static/chunks/*`, CSS | Service Worker `CacheStorage` | Precache saat install + runtime cache terkontrol |
| **2. Static Resources** | `manifest.webmanifest`, ikon PNG/SVG, font self-hosted (`next/font`) | Service Worker `CacheStorage` | `CacheFirst` (aset ber-hash) atau `StaleWhileRevalidate` |
| **3. Local Financial Data** | Transaksi, kategori, anggaran, target, kontribusi, aturan berulang | **IndexedDB (`FinoraDB`) SAJA** | **Tidak pernah disentuh Service Worker** |
| **4. Cached External Resources** | Font CDN eksternal, skrip analitik, API keuangan | **TIDAK ADA di MVP** | Diblokir oleh prinsip Zero-Telemetry & CSP `connect-src 'self'` |

---

## 4. Arsitektur Service Worker & Strategi Cache

- **Implementasi yang Direkomendasikan**: `@serwist/next` (penerus modern `next-pwa` berbasis Workbox) atau Service Worker TypeScript kustom yang dikompilasi ke `public/sw.js`. *(Catatan bundler: saat Phase 1 setup, verifikasi kompatibilitas `@serwist/next` dengan mode build Next.js aktif — Turbopack vs Webpack — dan catat di konfigurasi build).*

| Jenis Permintaan | Pola URL | Strategi Cache | Alasan |
|---|---|---|---|
| **App Precache Shell & `/offline`** | `/`, `/transactions`, `/budgets`, `/goals`, `/recurring`, `/analytics`, `/reports`, `/categories`, `/settings`, `/settings/backup`, `/offline` | Precache saat `install` + **NetworkFirst** (timeout `3 detik`) dengan fallback cache lalu `/offline` | Menjamin HTML terbaru (dan header CSP segar bila memakai nonce middleware) saat online, namun tetap terbuka instan saat offline. |
| **Aset Statis Ber-Hash Imutabel** | `/_next/static/*`, `/_next/static/media/*` (font) | **CacheFirst** (maks 1 tahun, nama cache berversi build) | Nama file mengandung content-hash sehingga tidak pernah basi. |
| **Ikon & Manifest** | `/icons/*`, `/manifest.webmanifest` | **StaleWhileRevalidate** | Memuat cepat dari cache sambil memperbarui di latar belakang bila ikon berubah. |
| **Permintaan Lintas-Origin** | Origin selain `self.location.origin` | **NetworkOnly / Tidak Di-cache** | Mencegah caching sumber daya tak terduga (sejalan dengan CSP `'self'`). |

---

## 5. Siklus Hidup Pembaruan & Invalidasi Cache (*Update Lifecycle*)

1. **Build-Time Revisioning**: Setiap build produksi menghasilkan manifest precache baru dengan hash revisi aset yang diperbarui.
2. **Controlled Activation (Tanpa Force-Reload Mendadak)**:
   - Service Worker baru yang terunduh masuk ke status `waiting` (tidak langsung memanggil `skipWaiting()` secara diam-diam di tengah form transaksi yang sedang diisi pengguna).
   - UI mendeteksi status `waiting` dan memunculkan `SwUpdateBanner`: *"Versi baru Finora tersedia. Muat ulang untuk memperbarui."*
   - Ketika pengguna menekan **"Muat Ulang"**, klien mengirim pesan `{ type: 'SKIP_WAITING' }` ke SW menunggu, kemudian saat `controllerchange` terpicu, halaman memuat ulang dengan bersih.
3. **Cache Invalidation pada Event `activate`**:
   - Service Worker baru menghapus seluruh cache lama yang namanya tidak cocok dengan versi cache aktif (misal `finora-precache-v*` lama), menjaga kuota disk tetap ramping tanpa pernah menyentuh `FinoraDB` (IndexedDB).

---

## 6. Kriteria Installability & Verifikasi

1. Tersaji melalui HTTPS dengan sertifikat valid.
2. `manifest.webmanifest` terhubung di `<head>`, tidak ada error parsing, ikon `192×192` dan `512×512` berstatus HTTP 200.
3. Service Worker aktif mengontrol halaman (`navigator.serviceWorker.controller !== null`) dan memiliki fetch handler yang melayani `/offline` / app shell saat offline.
4. Diuji menggunakan Chrome DevTools → Application → Manifest & Service Workers serta Lighthouse PWA checks (`RELEASE_CHECKLIST.md`).
