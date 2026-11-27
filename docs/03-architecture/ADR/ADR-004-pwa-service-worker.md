# ADR-004: Strategi PWA dan Service Worker untuk Pengalaman Offline-First

**Status**: Accepted  
**Tanggal Keputusan**: 2026-11-27  
**Dokumen Terkait**: [PWA_STRATEGY.md](../../06-pwa/PWA_STRATEGY.md) | [OFFLINE_BEHAVIOR.md](../../06-pwa/OFFLINE_BEHAVIOR.md) | [SECURITY.md](../../05-security/SECURITY.md)

---

## Context

Salah satu tujuan bisnis inti Finora (`BR-010`) adalah keandalan pencatatan keuangan saat perangkat pengguna tidak terhubung ke internet serta kemampuan instalasi di layar beranda ponsel maupun desktop. Tanpa Service Worker dan Web App Manifest, memuat ulang halaman saat luring akan gagal total meski data IndexedDB sebenarnya ada di perangkat.

## Decision

Finora menerapkan **Progressive Web Application (PWA)** penuh dengan:
1. `manifest.webmanifest` lengkap (`display: standalone`, ikon `192`, `512`, `maskable`, tema `#0B1220`).
2. **Service Worker** (direkomendasikan berbasis **Serwist / `@serwist/next`** atau skrip SW TypeScript khusus jika konflik bundler Next.js muncul) untuk mem-precache *application shell*, rute fallback `/offline`, serta aset statis (`/_next/static/*`, font self-hosted, ikon).
3. Pemisahan tegas: Service Worker **hanya** menyimpan aset aplikasi di `CacheStorage` dan **dilarang** menyimpan data keuangan pengguna (`PWA-004`).

## Alternatives

1. **Web App Biasa Tanpa Service Worker (Hanya IndexedDB)**:
   - *Alasan Ditolak*: Jika tab ditutup atau di-refresh saat offline, browser gagal memuat HTML/JS dari server sehingga aplikasi tidak dapat dibuka sama sekali.
2. **Service Worker dengan `skipWaiting()` Otomatis Tanpa Konfirmasi**:
   - *Alasan Ditolak*: Mengganti SW aktif secara paksa di tengah sesi tab terbuka berisiko menyebabkan ketidakcocokan chunk JS lama dan HTML baru (*chunk load error*). Finora memilih alur pembaruan terkontrol dengan banner ajakan muat ulang (`PWA-002`).

## Consequences

- **Positif**:
  - Aplikasi dapat diinstal ke ponsel/desktop dan terbuka instan dalam mode *offline* setelah kunjungan awal.
  - Navigasi dokumen yang gagal saat offline terarah rapi ke `/offline`.
- **Negatif / Trade-off**:
  - Pengembang wajib memverifikasi strategi build SW (misal kebutuhan `--webpack` vs Turbopack pada `@serwist/next` sesuai versi Next.js saat implementasi) serta memastikan strategi CSP kompatibel dengan HTML yang di-cache oleh Service Worker.
  - Kunjungan *pertama kali* ketika perangkat benar-benar offline sejak awal tetap tidak dapat mengunduh aplikasi (keterbatasan standar web).
