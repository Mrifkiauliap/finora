# Agent Implementation Brief — Finora

**Versi Dokumen**: 1.0.0  
**Audiens**: AI Coding Agents dan Tim Pengembang yang akan mengimplementasikan Finora.  
**Dokumen Wajib Terkait**: [CODING_STANDARDS.md](./CODING_STANDARDS.md) | [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md) | [STYLING.md](../04-design/STYLING.md) | [ROADMAP.md](../10-planning/ROADMAP.md)

---

## 1. Konteks Produk & Misi Implementasi

Anda akan mengimplementasikan **Finora** (*Your Money, Your Control*), aplikasi manajemen keuangan pribadi berbasis web dan PWA dengan arsitektur **Local-First**, **Offline-First**, dan **Privacy-First** untuk pengguna Indonesia (bahasa UI: Bahasa Indonesia, mata uang default: `IDR`).

Seluruh keputusan produk, rumus keuangan, skema database, palet desain, kebutuhan keamanan, dan backlog tugas sudah dikunci di dalam direktori `/docs`. Tugas Anda adalah **mengikuti spesifikasi tersebut dengan setia**, bukan mengarang ulang arsitektur di tengah implementasi.

---

## 2. Batasan Arsitektur Keras (*Non-Negotiable Constraints*)

1. **DILARANG Membuat Backend / API Data Pengguna**: Tidak ada `/api/*` untuk CRUD transaksi, tidak ada database server (PostgreSQL/Supabase/Firebase), tidak ada autentikasi/login, dan tidak ada cloud sync.
2. **DILARANG Mengirim Data Keuangan ke Luar Browser**: Nol skrip analitik (GA, Mixpanel, Sentry dengan payload data), nol CDN font eksternal (wajib `next/font/google` self-hosted).
3. **Satu Sumber Data Runtime**: Seluruh data pengguna disimpan di IndexedDB (`FinoraDB` v1) melalui **Dexie.js** dan divalidasi dengan **Zod `.strict()`**.
4. **Satu Sumber Rumus Keuangan**: Seluruh angka `NetBalance`, `AvailableBalance`, `SavingsRate`, `BudgetStatus`, `GoalProgressPct`, dan *end-of-month clamping* wajib mengikuti [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md) (`RULE-001` s.d. `RULE-020`).
5. **Anti-Double Counting**: Kontribusi ke `financialGoals` ditulis di `goalContributions`, **JANGAN PERNAH** membuat baris di `transactions` untuk alokasi tabungan.

---

## 3. Stack Teknologi Terkunci

- **Framework**: Next.js (App Router), React, TypeScript (`strict: true`).
- **UI & Styling**: Tailwind CSS, shadcn/ui (Radix Primitives), Lucide Icons.
- **Database & Validasi**: IndexedDB, Dexie.js (`dexie`, `dexie-react-hooks`), Zod.
- **Visualisasi & Utilitas**: Recharts, `date-fns`, `Intl.NumberFormat('id-ID')`.
- **PWA & Hosting**: Web App Manifest, Service Worker (`@serwist/next` atau TypeScript SW tervalidasi), GitHub, Vercel.
- **Pengujian (Usulan Baseline)**: Vitest + `fake-indexeddb` + React Testing Library (+ Playwright untuk verifikasi E2E/offline opsional).

---

## 4. Tanggung Jawab Coding & Urutan Implementasi

Ikuti urutan fase di [ROADMAP.md](../10-planning/ROADMAP.md) dan daftar tugas di [BACKLOG.md](../10-planning/BACKLOG.md):

1. **Phase 1 — Foundation & Setup**: Konfirmasi lokasi root proyek Next.js (`OQ-01` di [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)), setup TypeScript strict, Tailwind tokens Dark/Light dari [STYLING.md](../04-design/STYLING.md), `FinoraDB` Dexie v1, Zod schemas, `bootstrapService` (13 kategori sistem + `appSettings`), dan layout shell responsif.
2. **Phase 2 — Core Transactions & Categories**: `transactionService`, `categoryService` (termasuk arsip & reassignment atomik), `CurrencyInput`, halaman Dashboard `/` dasar, `/transactions`, `/transactions/new`, `/transactions/[id]/edit`, dan `/categories`.
3. **Phase 3 — Financial Management**: `budgetService` + `/budgets`, `goalService` + `/goals`, `recurringService` (idempoten + end-of-month clamping + max 366 catch-up) + `/recurring`.
4. **Phase 4 — Analytics & Reports**: `analyticsService`, `insightsEngine`, `exportService` (CSV UTF-8 BOM + anti-CSV-injection), halaman `/analytics` (Recharts) & `/reports` (print CSS).
5. **Phase 5 — Security, Backup, PWA & Testing**: `backupService` (JSON v1 + SHA-256 + Zod strict + Preview + Replace/Merge), `/settings`, `/settings/backup`, 8 HTTP security headers + CSP, Service Worker & `/offline`, serta seluruh unit/integration/component tests.
6. **Phase 6 — Production & Deployment**: Build produksi, audit Lighthouse, verifikasi header Vercel, dan eksekusi [RELEASE_CHECKLIST.md](../09-deployment/RELEASE_CHECKLIST.md).

---

## 5. Pola yang Dilarang (*Prohibited Implementation Patterns*)

- **DILARANG** memakai `float` atau tipe mata uang berkoma untuk nominal IDR (`1000.50`).
- **DILARANG** memakai `new Date().toISOString().slice(0, 10)` untuk tanggal transaksi lokal (`RULE-012`).
- **DILARANG** memanggil `db.transactions.add(...)` langsung dari komponen React; wajib lewat `src/services/*`.
- **DILARANG** memakai `dangerouslySetInnerHTML`, `eval`, `new Function`, atau `'unsafe-eval'` pada CSP produksi.
- **DILARANG** menaruh teks putih `#FFFFFF` di atas tombol hijau `#10B981` pada Dark Mode (gunakan `#0B1220` sesuai [STYLING.md](../04-design/STYLING.md)).
- **DILARANG** men-cache data transaksi/finansial ke dalam `CacheStorage` Service Worker (`PWA-004`).
- **DILARANG** mengimpor Dexie, `FinoraDB`, atau `AppProviders` di halaman publik (`/`, `/features`, `/about`, `/privacy`) maupun menyingkap data pengguna di metadata SEO (`NFR-011`). Seluruh aplikasi keuangan berada di bawah `/app/*`.
- **DILARANG** meninggalkan placeholder `TODO` pada jalur produksi atau meloloskan test dengan melemahkan assertion.

---

## 6. Definition of Done (DoD) per Fitur / Tugas

Sebuah `STORY` / `TASK` hanya dianggap selesai (*Done*) apabila:
1. Memenuhi seluruh kriteria penerimaan pada `REQUIREMENTS.md` dan `TEST_CASES.md` terkait.
2. `tsc --noEmit` dan ESLint lulus tanpa error (`NFR-007`).
3. Unit test domain & integration test `fake-indexeddb` untuk fitur terkait ditulis dan lulus.
4. Diuji secara visual di Dark Mode dan Light Mode pada viewport mobile (`360px`) serta desktop (`1280px+`) termasuk *loading*, *empty*, dan *error states*.
5. Tidak memperkenalkan permintaan jaringan eksternal atau pelanggaran CSP.
