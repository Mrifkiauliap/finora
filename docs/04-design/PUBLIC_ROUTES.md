# Public Routes & Application Separation — Finora

**Versi Dokumen**: 1.0.0  
**Dokumen Terkait**: [LANDING_PAGE.md](./LANDING_PAGE.md) | [PAGE_SPECIFICATIONS.md](./PAGE_SPECIFICATIONS.md) | [SEO.md](../09-deployment/SEO.md)

---

## 1. Peta Pemisahan Rute Publik vs Aplikasi Keuangan

Finora memisahkan secara tegas antara **Website Publik Pemasaran** (tanpa akses database lokal) dan **Aplikasi Keuangan Pribadi** (menggunakan `FinoraDB` lokal di `/app/*`) di dalam satu deployment Next.js dan Vercel:

| Kelompok | Rute URL | Layout Pembungkus | Akses IndexedDB (`FinoraDB`) | Diindeks SEO (`robots.txt`) |
|---|---|---|---|---|
| **Publik** | `/` | `src/app/(public)/layout.tsx` (`PublicNavbar` + `PublicFooter`) | **Dilarang (0 akses)** | Ya (`allow`) |
| **Publik** | `/features` | `src/app/(public)/layout.tsx` | **Dilarang (0 akses)** | Ya (`allow`) |
| **Publik** | `/about` | `src/app/(public)/layout.tsx` | **Dilarang (0 akses)** | Ya (`allow`) |
| **Publik** | `/privacy` | `src/app/(public)/layout.tsx` | **Dilarang (0 akses)** | Ya (`allow`) |
| **Aplikasi** | `/app` dan seluruh `/app/*` | `src/app/app/layout.tsx` (`AppProviders` + `AppShell`) | **Aktif (`initializeApp()`)** | Tidak (`disallow` + `noindex`) |
| **Sistem PWA** | `/offline` | Minimal standalone | Tidak perlu untuk render dasar | Tidak (`disallow`) |

---

## 2. Daftar Lengkap Rute Aplikasi Keuangan (`/app/*`)

1. `/app` — Dashboard Keuangan
2. `/app/transactions` — Daftar, Cari & Filter Transaksi
3. `/app/transactions/new` — Catat Transaksi Baru
4. `/app/transactions/[id]/edit` — Ubah Transaksi
5. `/app/categories` — Manajemen Kategori
6. `/app/budgets` — Anggaran Bulanan
7. `/app/goals` — Target Keuangan
8. `/app/recurring` — Transaksi Berulang
9. `/app/analytics` — Analitik & Wawasan
10. `/app/reports` — Laporan & Ekspor CSV
11. `/app/settings` — Pengaturan & Zona Bahaya
12. `/app/settings/backup` — Backup & Restore JSON

---

## 3. Perilaku Inisialisasi & PWA

1. **Lazy Bootstrap saat Masuk `/app`**: `AppProviders` (`bootstrapService.initializeApp()`) hanya dipasang di `src/app/app/layout.tsx`. Pengunjung yang sekadar membaca `/`, `/features`, `/about`, atau `/privacy` tidak memicu pembuatan `FinoraDB` di browser mereka.
2. **Navigasi Terpisah**: `PublicNavbar` tidak menampilkan menu anggaran/transaksi pribadi; `AppSidebar` menyediakan ikon globe kecil untuk kembali ke `/` jika pengguna ingin meninjau halaman informasi publik.
3. **Manifest PWA**: `start_url` pada `manifest.ts` diarahkan ke `'/app'` dengan `scope: '/'` agar pengguna yang menginstal aplikasi PWA langsung masuk ke workspace keuangan mereka.
