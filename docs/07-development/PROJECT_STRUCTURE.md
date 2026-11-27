# Project Structure — Finora

**Versi Dokumen**: 1.0.0  
**Dokumen Terkait**: [CODING_STANDARDS.md](./CODING_STANDARDS.md) | [AGENT_BRIEF.md](./AGENT_BRIEF.md) | [DOCUMENTATION_AUDIT.md](../DOCUMENTATION_AUDIT.md)

---

## 1. Status Repositori Saat Ini & Pertanyaan Terbuka Lokasi App Root

Pada saat fase dokumentasi ini disusun, struktur direktori yang teramati di workspace `d:\Project\3gabut\pelatihan-chat` adalah:
- `/docs/` — Paket dokumentasi lengkap Finora.
- `/README.md`, `/AGENTS.md` — Titik masuk proyek & instruksi agen.
- `/finora/` — Subdirektori yang saat ini sudah memiliki konfigurasi skill `.agents/skills/antislop*` dan `skills-lock.json`.
- `/.agents/`, `/SKILL.md`, `/skills-lock.json` — Konfigurasi skill di root workspace.

> **Open Question (`OQ-01` — Wajib Diputuskan Sebelum `TASK-001`)**:  
> Apakah proyek Next.js (`package.json`, `src/`, `next.config.*`, `public/`) akan diinisialisasi di **root repositori** (`d:\Project\3gabut\pelatihan-chat/`) atau di **dalam subdirektori `/finora/`** (`d:\Project\3gabut\pelatihan-chat/finora/` dengan Root Directory Vercel disetel ke `finora`)?  
> Dokumentasi struktur di bawah merepresentasikan tata letak **di dalam App Root** proyek Next.js mana pun yang dipilih.

---

## 2. Struktur Direktori Aplikasi Next.js Usulan (Di Dalam App Root)

```text
<app-root>/
├── public/
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   ├── icon-512x512.png
│   │   ├── icon-maskable-512x512.png
│   │   └── apple-touch-icon.png
│   └── sw.js                          # Dihasilkan saat build (jika menggunakan @serwist/next / SW compiler)
├── src/
│   ├── app/                           # Next.js App Router (Halaman & Layout)
│   │   ├── layout.tsx                 # Root layout, next/font self-hosted, Providers, Metadata PWA
│   │   ├── manifest.ts                # Web App Manifest dinamis/statis
│   │   ├── globals.css                # Tailwind v4/v3 tokens Dark (#0B1220) & Light (#F8FAFC) + print CSS
│   │   ├── page.tsx                   # Dashboard (/)
│   │   ├── offline/
│   │   │   └── page.tsx               # Offline fallback (/offline)
│   │   ├── transactions/
│   │   │   ├── page.tsx               # Daftar, cari & filter (/transactions)
│   │   │   ├── new/page.tsx           # Tambah transaksi (/transactions/new)
│   │   │   └── [id]/edit/page.tsx     # Edit transaksi (/transactions/[id]/edit)
│   │   ├── categories/page.tsx        # Manajemen kategori (/categories)
│   │   ├── budgets/page.tsx           # Anggaran bulanan (/budgets)
│   │   ├── goals/page.tsx             # Target keuangan (/goals)
│   │   ├── recurring/page.tsx         # Transaksi berulang (/recurring)
│   │   ├── analytics/page.tsx         # Grafik & insight (/analytics)
│   │   ├── reports/page.tsx           # Laporan & ekspor CSV (/reports)
│   │   └── settings/
│   │       ├── page.tsx               # Pengaturan & Zona Bahaya (/settings)
│   │       └── backup/page.tsx        # Backup & Restore JSON (/settings/backup)
│   ├── components/
│   │   ├── ui/                        # Primitif shadcn/ui (Button, Dialog, Input, Select, Switch, dll.)
│   │   ├── layout/                    # AppShell, AppSidebar, MobileBottomNav, TopHeader, Banners
│   │   ├── shared/                    # MoneyText, CurrencyInput, CategoryBadge, ConfirmDialog, EmptyState
│   │   ├── dashboard/                 # KpiSummaryCard, CashflowMiniChart, BudgetAlertsWidget, dll.
│   │   ├── transactions/              # TransactionForm, TransactionTable, TransactionListItem, FilterBar
│   │   ├── budgets/                   # BudgetProgressCard, BudgetFormModal
│   │   ├── goals/                     # GoalProgressCard, GoalFormModal, ContributionModal
│   │   ├── recurring/                 # RecurringRuleCard, RecurringRuleModal
│   │   ├── analytics/                 # IncomeExpenseChart, CategoryDonutChart, InsightCards
│   │   └── backup/                    # BackupDropzone, RestorePreviewPanel
│   ├── db/
│   │   ├── database.ts                # Definisi kelas FinoraDatabase (Dexie v1) & instance singleton
│   │   ├── seed.ts                    # 13 kategori sistem & appSettings default
│   │   └── types.ts                   # Tipe record tabel persis sesuai DATA_DICTIONARY.md
│   ├── domain/
│   │   ├── constants.ts               # Batas IDR, daftar ikon/warna terkurasi, label metode pembayaran
│   │   ├── money.ts                   # Format & parser integer IDR
│   │   ├── dates.ts                   # Helper tanggal lokal YYYY-MM-DD, end-of-month clamping
│   │   ├── financeCalculators.ts      # Rumus RULE-002..005, RULE-009..010, RULE-018
│   │   ├── insightsEngine.ts          # Generator wawasan deterministik lokal
│   │   └── csvFormatter.ts            # Sanitasi anti-injection & serialisasi CSV UTF-8 BOM
│   ├── schemas/
│   │   ├── commonSchema.ts            # DateString, MonthString, SafeIdrAmount, PaymentMethod
│   │   ├── transactionSchema.ts
│   │   ├── categorySchema.ts
│   │   ├── budgetSchema.ts
│   │   ├── goalSchema.ts
│   │   ├── recurringSchema.ts
│   │   ├── settingsSchema.ts
│   │   └── backupSchema.ts            # BackupEnvelopeV1Schema (.strict())
│   ├── services/
│   │   ├── errors.ts                  # ServiceResult<T> & mapper Dexie Error
│   │   ├── bootstrapService.ts
│   │   ├── transactionService.ts
│   │   ├── categoryService.ts
│   │   ├── budgetService.ts
│   │   ├── goalService.ts
│   │   ├── recurringService.ts
│   │   ├── dashboardService.ts
│   │   ├── analyticsService.ts
│   │   ├── exportService.ts
│   │   ├── settingsService.ts
│   │   └── backupService.ts
│   ├── hooks/
│   │   ├── useOnlineStatus.ts
│   │   ├── useSwUpdate.ts
│   │   ├── useAppSettings.ts
│   │   └── usePrivacyMask.ts
│   └── sw.ts                          # Sumber Service Worker (jika memakai Serwist)
├── tests/
│   ├── unit/                          # Pengujian pure domain, Zod schemas, CSV sanitizer, checksum
│   ├── integration/                   # Pengujian service layer + fake-indexeddb
│   ├── components/                    # React Testing Library untuk form, modal, accessibility
│   └── e2e/                           # Playwright specs (offline, PWA, responsive, headers)
├── next.config.ts                     # Konfigurasi Next.js + security headers + wrapper PWA
├── middleware.ts                      # Opsional jika memakai Opsi A CSP Nonce (lihat SECURITY.md)
├── tsconfig.json                      # strict: true
├── package.json
└── vitest.config.ts
```

---

## 3. Aturan Ketergantungan Antar-Direktori (*Dependency Direction*)

```text
app/ & components/  --->  hooks/  --->  services/  --->  domain/ & schemas/ & db/
```

- `domain/` dan `schemas/` adalah modul paling bersih: **tidak boleh** mengimpor dari `db/`, `services/`, `components/`, atau `react`.
- `services/` boleh mengimpor `db/`, `domain/`, dan `schemas/`, namun **tidak boleh** mengimpor `components/` atau `react`.
- `components/` **tidak boleh** mengimpor `db/` langsung untuk mutasi.
