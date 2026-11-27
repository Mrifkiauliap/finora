# ADR-003: Pemilihan Next.js App Router dan Hosting di Vercel

**Status**: Accepted  
**Tanggal Keputusan**: 2026-11-27  
**Dokumen Terkait**: [SYSTEM_ARCHITECTURE.md](../SYSTEM_ARCHITECTURE.md) | [DEPLOYMENT.md](../../09-deployment/DEPLOYMENT.md) | [ADR-005](./ADR-005-no-backend-architecture.md)

---

## Context

Finora membutuhkan kerangka kerja frontend modern berbasis React dan TypeScript Strict Mode yang mudah di-deploy melalui GitHub ke platform hosting HTTPS global dengan dukungan optimasi aset, font *self-hosted*, dan konfigurasi HTTP security headers yang kuat.

## Decision

Finora menggunakan **Next.js App Router** (dengan React dan TypeScript Strict Mode) sebagai framework frontend, serta **Vercel** sebagai platform *build* dan *hosting* statis/CDN. Seluruh halaman yang mengakses `FinoraDB` diimplementasikan sebagai komponen klien (`'use client'`) dengan *application shell* pra-render statis yang aman di-cache oleh Service Worker.

## Alternatives

1. **Vite + React Router (SPA Murni)**:
   - *Kelebihan*: Ringan, tidak ada komplikasi SSR/RSC hydration script pada kebijakan CSP.
   - *Alasan Ditolak*: Stack baseline proyek telah menetapkan Next.js App Router, yang menyediakan optimasi `next/font` *self-hosted* bawaan, struktur rute file-system yang rapi untuk 11 halaman + `/offline`, serta integrasi *zero-config* dengan Vercel dan header keamanan per-rute.
2. **Next.js dengan Server-Side Rendering (SSR) Dinamis Berbasis Cookie/Header**:
   - *Alasan Ditolak*: Data pengguna berada di IndexedDB klien, sehingga server tidak memiliki informasi finansial apa pun untuk di-SSR-kan. SSR dinamis per request hanya menambah latensi TTFB dan mengganggu caching offline *application shell*.

## Consequences

- **Positif**:
  - Integrasi CI/CD GitHub → Vercel otomatis (Preview Deployment per PR & Production Deployment di `main`).
  - `next/font/google` mengunduh font (`Plus Jakarta Sans`, `JetBrains Mono`) saat waktu build dan menyajikannya dari origin `'self'`, menghilangkan kebocoran metadata ke Google Fonts saat runtime (`NFR-009`).
  - Konfigurasi header keamanan di `next.config.*` / `vercel.json` mudah diaudit.
- **Negatif / Trade-off**:
  - Next.js App Router menyuntikkan skrip inline hidrasi (`self.__next_f.push`), sehingga penerapan `Content-Security-Policy` ketat tanpa `'unsafe-inline'` menuntut perhatian khusus (perbandingan strategi nonce vs hash/SRI serta interaksi dengan PWA Service Worker didokumentasikan pada [SECURITY.md](../../05-security/SECURITY.md)).
  - Harus menjaga disiplin agar tidak secara tidak sengaja memakai fitur server-side Next.js (Server Actions mutasi DB atau `/api/*`) yang melanggar prinsip *no-backend*.
