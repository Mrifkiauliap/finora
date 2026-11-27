# Implementation Backlog — Finora

**Versi Dokumen**: 1.0.0  
**Struktur**: `EPIC` → `STORY` (`STORY-001`–`STORY-024`) → `TASK` (`TASK-001`–`TASK-048`), ditambah protokol pengelolaan `BUG`.  
**Dokumen Terkait**: [ROADMAP.md](./ROADMAP.md) | [MILESTONES.md](./MILESTONES.md) | [TRACEABILITY.md](../02-requirements/TRACEABILITY.md)

---

## Daftar Epics

| Epic ID | Nama Epic | Fase Roadmap |
|---|---|---|
| **EPIC-01** | Fondasi Aplikasi, Design System, Database & Shell Navigasi | Phase 1 |
| **EPIC-02** | Manajemen Transaksi, Kategori & Dashboard Inti | Phase 2 |
| **EPIC-03** | Pengelolaan Keuangan: Anggaran, Target & Transaksi Berulang | Phase 3 |
| **EPIC-04** | Analitik Keuangan, Insight Lokal & Laporan CSV | Phase 4 |
| **EPIC-05** | Pengaturan, Keamanan, Backup/Restore & PWA Offline | Phase 5 |
| **EPIC-06** | Quality Assurance Menyeluruh, Audit Keamanan & Deployment Vercel | Phase 6 |
| **EPIC-07** | Website Publik Pemasaran, Pemisahan Rute `/app` & SEO | Phase 6 |

---

## Rincian Stories & Tasks

### EPIC-01 — Fondasi Aplikasi, Design System, Database & Shell Navigasi

- **STORY-001: Setup Proyek Next.js Strict & Token Design System** (`P0`, Dep: `OQ-01` selesai)
  - `TASK-001`: Inisialisasi Git (jika belum), scaffold Next.js App Router, TypeScript `strict: true`, ESLint, Vitest + `fake-indexeddb`. *Done*: `typecheck`, `lint`, dan dummy unit test lulus.
  - `TASK-002`: Setup Tailwind CSS & CSS variables tema Dark (`#0B1220`) dan Light (`#F8FAFC`) sesuai [STYLING.md](../04-design/STYLING.md) + `next/font/google` (`Plus Jakarta Sans`, `JetBrains Mono`). *Done*: Font termuat lokal tanpa request CDN saat runtime.
  - `TASK-003`: Instal komponen dasar shadcn/ui (Button, Card, Dialog, Input, Select, Switch, Tabs, Toast) yang disesuaikan token Finora. *Done*: Tombol Primary Dark Mode memakai teks `#0B1220` di atas `#10B981`.
  - `TASK-004`: Implementasi `src/domain/money.ts`, `src/domain/dates.ts`, `src/domain/constants.ts`, dan `src/schemas/commonSchema.ts` beserta unit test lengkap. *Done*: Format IDR, `tabular-nums`, dan `getLocalToday()` teruji lintas TZ.

- **STORY-002: Basis Data `FinoraDB` v1 & Zero-Signup Bootstrap** (`P0`, Dep: `STORY-001`)
  - `TASK-005`: Implementasi `FinoraDatabase` Dexie.js v1 dengan 7 tabel dan indeks persis [DATABASE_SCHEMA.md](../03-architecture/DATABASE_SCHEMA.md) + tipe TypeScript (`src/db/types.ts`). *Done*: Skema terbuka mulus di IndexedDB & `fake-indexeddb`.
  - `TASK-006`: Implementasi `src/db/seed.ts` (13 kategori sistem + `appSettings` default) dan `bootstrapService.initializeApp()`. *Done*: `TC-001` & `TC-002` lulus.
  - `TASK-007`: Buat `DatabaseBootstrapProvider` dan `ErrorFallback` untuk skenario `STORAGE_UNAVAILABLE`. *Done*: Aplikasi terbuka langsung ke `/` tanpa login dan tidak crash bila IndexedDB diblokir.

- **STORY-003: Shell Navigasi Responsif & Komponen Shared Keuangan** (`P0`, Dep: `STORY-001`)
  - `TASK-008`: Bangun `AppShell`, `AppSidebar` (desktop), `MobileBottomNav` (mobile + Menu Sheet), `TopHeader`, `ThemeToggle`, dan `PrivacyMaskToggle`. *Done*: 0 overflow horizontal di `360px` dan `1280px`.
  - `TASK-009`: Bangun komponen shared `MoneyText`, `CurrencyInput`, `CategoryBadge`, `ConfirmDialog`, `TypedConfirmDialog`, dan `EmptyState`. *Done*: Component test lulus + fokus keyboard & ARIA terpenuhi.

- **STORY-004: Kontrak Error & Utilitas Service Layer** (`P0`, Dep: `STORY-002`)
  - `TASK-010`: Implementasi `src/services/errors.ts` (`ServiceResult<T>`, pemetaan `QuotaExceededError`) dan wrapper helper validasi Zod `.strict()`. *Done*: Error mapping teruji di unit/integration test.

---

### EPIC-02 — Manajemen Transaksi, Kategori & Dashboard Inti

- **STORY-005: CRUD Transaksi Lengkap** (`P0`, Dep: `EPIC-01`)
  - `TASK-011`: Implementasi `transactionService` (`create`, `update`, `delete`, `getById`) + `transactionSchema.ts` (`RULE-001`, `RULE-006`, `RULE-007`). *Done*: `TC-005` s.d. `TC-009` service test lulus.
  - `TASK-012`: Bangun `TransactionForm` & rute `/transactions/new` (serta quick modal/sheet). *Done*: Validasi error tampil di bawah input dan mendukung "Simpan & Tambah Lagi".
  - `TASK-013`: Bangun rute `/transactions/[id]/edit` dan integrasi `ConfirmDialog` hapus transaksi. *Done*: Ganti tipe mereset kategori; batal hapus tidak memodifikasi DB.

- **STORY-006: Daftar, Pencarian & Filter Multi-Kriteria Transaksi** (`P0`, Dep: `STORY-005`)
  - `TASK-014`: Implementasi `transactionService.queryTransactions(filter)` beserta kalkulasi subtotal irisan filter. *Done*: `TC-010` & `TC-011` lulus.
  - `TASK-015`: Bangun halaman `/transactions` (`TransactionTable` desktop, `TransactionListItem` mobile, search debounce, filter sheet/bar, paginasi). *Done*: Loading, empty (0 data vs 0 filter match), dan error states lengkap.

- **STORY-007: Dashboard Ringkasan Keuangan** (`P0`, Dep: `STORY-005`)
  - `TASK-016`: Implementasi `financeCalculators.ts`, `dashboardService.getDashboardSummary()`, dan halaman Dashboard `/` (KPI cards, `SavingsRate` null→`"—"`, 5 transaksi terbaru, mini chart slot). *Done*: `TC-003` & `TC-004` lulus.

- **STORY-008: Manajemen Kategori & Penghapusan Aman** (`P0`, Dep: `STORY-005`)
  - `TASK-017`: Implementasi `categoryService` (list, create, update, archive) dengan validasi keunikan nama case-insensitive per tipe & proteksi fallback `Lainnya`. *Done*: `TC-012` & `TC-013` lulus.
  - `TASK-018`: Implementasi `deleteCategoryWithStrategy` (reassignment atomik lintas 3 tabel + resolusi bentrok budget) & halaman `/categories`. *Done*: `TC-014` lulus tanpa orphan record.

---

### EPIC-03 — Pengelolaan Keuangan: Anggaran, Target & Transaksi Berulang

- **STORY-009: Pengaturan & Penyalinan Anggaran Bulanan** (`P0`, Dep: `EPIC-02`)
  - `TASK-019`: Implementasi `budgetService` (`upsertBudget`, `deleteBudget`, `copyBudgetsFromPreviousMonth`) dan `budgetSchema.ts`. *Done*: `TC-015` & `TC-016` lulus.
  - `TASK-020`: Bangun form modal anggaran dan pemilih bulan pada halaman `/budgets`. *Done*: Hanya kategori `expense` aktif yang muncul; salin tidak menimpa data eksisting.

- **STORY-010: Evaluasi Realisasi, Ambang Peringatan & Widget Dashboard** (`P0`, Dep: `STORY-009`)
  - `TASK-021`: Implementasi `listMonthlyBudgets`, `BudgetProgressCard` (`safe`/`warning`/`exceeded`), drawer rincian transaksi kategori, dan widget peringatan anggaran di Dashboard `/`. *Done*: `TC-017` & `TC-018` lulus.

- **STORY-011: CRUD Target Keuangan & Estimasi Bulanan** (`P1`, Dep: `EPIC-02`)
  - `TASK-022`: Implementasi `goalService` (create, update, delete atomik dengan `goalContributions`), `calculateGoalMetrics`, dan halaman `/goals`. *Done*: `TC-019` lulus.

- **STORY-012: Kontribusi Earmark Target & Integrasi Available Balance** (`P1`, Dep: `STORY-011`)
  - `TASK-023`: Implementasi `recordGoalContribution` (setor/tarik atomik, auto-complete status, anti-double counting) + modal setor/tarik + riwayat kontribusi + widget target di Dashboard. *Done*: `TC-020` & `TC-021` lulus.

- **STORY-013: Pengaturan Aturan Transaksi Berulang** (`P1`, Dep: `EPIC-02`)
  - `TASK-024`: Implementasi `create/update/toggle/deleteRecurringRule`, `computeNextOccurrenceDate` (*end-of-month clamping*), dan halaman `/recurring`. *Done*: `TC-022` lulus.

- **STORY-014: Materialisasi Lokal Idempoten Transaksi Berulang** (`P1`, Dep: `STORY-013`)
  - `TASK-025`: Implementasi `materializeDueTransactions(today)` dengan cek idempotensi `[recurringRuleId+recurringOccurrenceDate]` dan batas catch-up 366. *Done*: `TC-023` & `TC-024` lulus.
  - `TASK-026`: Integrasikan pemanggilan `materializeDueTransactions` ke `bootstrapService` dan akses `/recurring` beserta banner notifikasi bila ada aturan mencapai batas catch-up. *Done*: Reload berulang tidak membuat duplikat.

---

### EPIC-04 — Analitik Keuangan, Insight Lokal & Laporan CSV

- **STORY-015: Visualisasi Grafik Analitik Recharts** (`P1`, Dep: `EPIC-02`)
  - `TASK-027`: Implementasi `analyticsService.getAnalyticsReport(range)` (deret waktu bulanan, breakdown kategori, perbandingan periode). *Done*: `TC-025` integration test lulus.
  - `TASK-028`: Bangun halaman `/analytics` menggunakan `ChartContainerCard`, `IncomeExpenseChart`, `CategoryDonutChart` (palet kontras terkalibrasi Dark/Light), dan tabel proporsi kategori. *Done*: Tooltip format IDR & hormati `PrivacyMask` + `prefers-reduced-motion`.

- **STORY-016: Generator Insight Keuangan Deterministik** (`P1`, Dep: `STORY-015`)
  - `TASK-029`: Implementasi `insightsEngine.ts` dan komponen `InsightCards` di `/analytics`. *Done*: `TC-026` lulus dengan 0 panggilan jaringan eksternal.

- **STORY-017: Halaman Laporan Siap Cetak & Ekspor CSV Aman** (`P0`, Dep: `EPIC-02`)
  - `TASK-030`: Implementasi `csvFormatter.ts` (UTF-8 BOM + sanitasi anti *CSV formula injection*) dan `exportService.exportTransactionsCsv()`. *Done*: `TC-027` & `TC-028` lulus.
  - `TASK-031`: Bangun halaman `/reports` beserta CSS `@media print` yang menyembunyikan navigasi dan memformat laporan rapi. *Done*: Print preview bersih di desktop.

---

### EPIC-05 — Pengaturan, Keamanan, Backup/Restore & PWA Offline

- **STORY-018: Pengaturan Aplikasi, Status Storage & Factory Reset** (`P0`, Dep: `EPIC-01`)
  - `TASK-032`: Implementasi `settingsService.getSettings/updateSettings` dan persistensi tema + `showBalancesMasked`. *Done*: `TC-029` lulus.
  - `TASK-033`: Implementasi tampilan info storage (`getStorageHealth`, tombol `navigator.storage.persist()`) di `/settings`. *Done*: Graceful degradation jika API tidak didukung.
  - `TASK-034`: Implementasi `factoryResetDatabase` dengan `TypedConfirmDialog` (`"HAPUS"`). *Done*: `TC-030` lulus.

- **STORY-019: Ekspor Backup JSON & Pengingat Backup** (`P0`, Dep: `EPIC-03`)
  - `TASK-035`: Implementasi `backupService.exportBackupJson()` (envelope v1, canonical JSON, SHA-256 via Web Crypto, update `lastBackupAt`) dan banner pengingat backup (`FR-023`). *Done*: `TC-031` lulus.

- **STORY-020: Validasi Ketat, Pratinjau & Restore Atomik JSON** (`P0`, Dep: `STORY-019`)
  - `TASK-036`: Implementasi 5 gerbang `inspectBackupFile()` (batas 25 MB, strip prototype key, Zod `.strict()`, verifikasi versi & SHA-256). *Done*: `TC-032`, `TC-033`, `TC-035` lulus.
  - `TASK-037`: Bangun halaman `/settings/backup` dengan `BackupDropzone` dan `RestorePreviewPanel` (jumlah record & deteksi konflik ID/budget). *Done*: Pratinjau tampil akurat tanpa menyentuh DB.
  - `TASK-038`: Implementasi `applyRestore()` mode `Replace All` (konfirmasi `"TIMPA"`) dan `Merge` (`skip_existing` / `overwrite_existing`) dalam satu transaksi Dexie atomik. *Done*: `TC-034` lulus termasuk simulasi rollback.

- **STORY-021: Pengerasan Keamanan Aplikasi & HTTP Headers** (`P0`, Dep: `EPIC-01`)
  - `TASK-039`: Audit seluruh kode dari sink XSS berbahaya, verifikasi 0 skrip/font eksternal runtime, dan uji sanitasi catatan/kategori. *Done*: `TC-037` bagian XSS & network isolation lulus.
  - `TASK-040`: Konfigurasi 8 HTTP security headers wajib termasuk kebijakan CSP produksi (tanpa `'unsafe-eval'`) dan verifikasi kompatibilitas dengan Next.js + Service Worker. *Done*: Header terverifikasi pada `next start`.

- **STORY-022: Implementasi PWA, Service Worker & Offline Experience** (`P0`, Dep: `STORY-021`)
  - `TASK-041`: Konfigurasi `manifest.ts`, generate ikon PWA (`192`, `512`, `maskable`, Apple touch icon), implementasi Service Worker (isolasi cache dari data finansial), halaman `/offline`, `OfflineStatusBanner`, dan `SwUpdateBanner`. *Done*: `TC-038` lulus.

- **STORY-023: Optimasi Kinerja & Penanganan Kuota Penyimpanan** (`P1`, Dep: `EPIC-03`)
  - `TASK-042`: Jalankan benchmark 5.000 transaksi (`NFR-001`), optimasi kueri compound index jika melewati 150 ms, serta uji UI untuk `QuotaExceededError`. *Done*: `TC-036` lulus.

---

### EPIC-06 — Quality Assurance Menyeluruh, Audit Keamanan & Deployment Vercel

- **STORY-024: Verifikasi Akhir, Audit Produksi & Deployment** (`P0`, Dep: `EPIC-05`)
  - `TASK-043`: Jalankan full suite Vitest (unit, integration, component) + cek `tsc --noEmit` & ESLint bersih. *Done*: 0 error, 0 skipped tests.
  - `TASK-044`: Jalankan E2E Playwright untuk alur kritis, responsivitas `360px`/`1280px`, keyboard navigation, serta verifikasi nol traffic jaringan eksternal. *Done*: `TC-039` lulus.
  - `TASK-045`: Jalankan `npm audit --omit=dev` dan siapkan proyek GitHub → Vercel Preview Deployment. *Done*: Preview aktif dan 8 headers terverifikasi.
  - `TASK-046`: Jalankan Lighthouse audit pada Preview/Production URL (Performance `>= 90`, Accessibility `>= 95`, Best Practices `>= 95`, PWA installable). *Done*: `TC-040` lulus.
  - `TASK-047`: Uji lintas browser (Chromium + Firefox/WebKit) untuk fitur inti, CSV download, dan JSON Backup/Restore. *Done*: Lulus tanpa regresi fatal.
  - `TASK-048`: Merge ke `main`, verifikasi seluruh poin pasca-rilis [RELEASE_CHECKLIST.md](../09-deployment/RELEASE_CHECKLIST.md), dan tag `v1.0.0`. *Done*: Finora MVP v1.0.0 live di Vercel.

---

### EPIC-07 — Website Publik Pemasaran, Pemisahan Rute `/app` & SEO

- **STORY-025: Pemisahan Rute `/app/*` & Navigasi Website Publik** (`P0`, Dep: `EPIC-05`)
  - `TASK-049`: Pindahkan seluruh rute aplikasi keuangan ke `src/app/app/*` dengan `src/app/app/layout.tsx` (`AppProviders` + `AppShell`), perbarui `manifest.ts` (`start_url: '/app'`) dan `sw.js`, serta pastikan halaman publik tidak mengimpor Dexie. *Done*: `TC-042` lulus.
  - `TASK-050`: Bangun `PublicNavbar`, `PublicFooter`, `DashboardPreviewMockup` (statis), `FaqAccordion`, serta halaman `/` (13 seksi), `/features`, `/about`, dan `/privacy`. *Done*: `TC-041` & `TC-044` lulus.

- **STORY-026: SEO, Open Graph, Sitemap & Robots.txt** (`P0`, Dep: `STORY-025`)
  - `TASK-051`: Tambahkan `Instrument_Serif` + `Plus_Jakarta_Sans` + `JetBrains_Mono` self-hosted, metadata Open Graph & canonical per halaman publik, dan generate `public/og-image.png` + `src/app/icon.png`. *Done*: Meta tag terverifikasi pada build produksi.
  - `TASK-052`: Implementasikan `src/app/sitemap.ts` (hanya rute publik) dan `src/app/robots.ts` (`disallow: ['/app/', '/offline']`). *Done*: `TC-043` lulus.
  - `TASK-053`: Perbarui paket dokumentasi (`LANDING_PAGE.md`, `PUBLIC_ROUTES.md`, `SEO.md`, dan pembaruan dokumen terkait) serta validasi silang. *Done*: 0 broken links & 0 untraced IDs.

---

## Protokol Pencatatan `BUG` Selama Implementasi

Apabila ditemukan cacat (*defect*) selama pengembangan atau pengujian, catat dengan format ID `BUG-XXX`:
- **ID**: `BUG-XXX`
- **Judul & Severitas**: (`Critical` / `High` / `Medium` / `Low`)
- **Referensi Terkait**: `TC-XXX` atau `FR-XXX` / `RULE-XXX` yang dilanggar
- **Langkah Reproduksi & Bukti**: Kondisi awal, aksi, hasil aktual vs hasil yang diharapkan
- **Kriteria Selesai**: Perbaikan + *regression test* otomatis wajib ditambahkan sebelum status ditutup.
