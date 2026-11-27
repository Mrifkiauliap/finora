# SEO, Metadata & Crawl Control — Finora

**Versi Dokumen**: 1.0.0  
**Dokumen Terkait**: [LANDING_PAGE.md](../04-design/LANDING_PAGE.md) | [PUBLIC_ROUTES.md](../04-design/PUBLIC_ROUTES.md) | [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 1. Strategi SEO & Privasi Metadata

Tujuan SEO Finora adalah membuat halaman publik pemasaran mudah ditemukan mesin pencari sekaligus **menjamin 100% rute aplikasi keuangan (`/app/*`) tidak pernah diindeks** dan tidak ada data pribadi yang terekspos di metadata.

---

## 2. Metadata per Rute

| Rute | `title` | Fokus `description` | `canonical` | `robots` |
|---|---|---|---|---|
| `/` | `Finora — Manajemen Keuangan Pribadi Local-First & Offline-First` | Ringkasan pencatatan IDR, anggaran, target, offline & nol login | `/` | `index, follow` |
| `/features` | `Fitur Lengkap \| Finora` | Penjabaran 9 modul fitur utama Finora | `/features` | `index, follow` |
| `/about` | `Tentang Finora \| Finora` | Visi, 9 prinsip inti, dan target pengguna | `/about` | `index, follow` |
| `/privacy` | `Kebijakan Privasi \| Finora` | Penyimpanan IndexedDB lokal, zero telemetry & batasan | `/privacy` | `index, follow` |
| `/app/*` | `Dashboard Keuangan \| Finora App` | — | — | `noindex, nofollow` |

---

## 3. Implementasi Teknis di Next.js

1. **Open Graph & Twitter Cards (`src/app/layout.tsx`)**:
   - Menggunakan gambar statis `public/og-image.png` (`1200×630`) yang dirender ke domain produksi via `metadataBase` (`NEXT_PUBLIC_SITE_URL` atau fallback `https://finora.vercel.app`).
2. **Favicon & Apple Icon**:
   - `src/app/icon.png` + `/icons/icon-192x192.png`, `/icons/icon-512x512.png`, `/icons/apple-touch-icon.png`.
3. **Sitemap (`src/app/sitemap.ts`)**:
   - Hanya mendaftarkan 4 URL publik: `/`, `/features`, `/about`, `/privacy`.
4. **Robots.txt (`src/app/robots.ts`)**:
   - `allow: ['/', '/features', '/about', '/privacy']`
   - `disallow: ['/app/', '/offline']`
   - Mengarah ke `${SITE_URL}/sitemap.xml`.
5. **Konfigurasi Environment Vercel**:
   - Disarankan mengisi `NEXT_PUBLIC_SITE_URL` dengan URL domain produksi final di Vercel agar `canonical`, `sitemap.xml`, dan `og:image` menunjuk ke domain aktual.
