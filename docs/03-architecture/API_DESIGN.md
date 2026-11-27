# Application Service Layer & Interface Design — Finora

**Versi Dokumen**: 1.0.0  
**Status**: Baseline Disetujui  
**Dokumen Terkait**: [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) | [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | [CODING_STANDARDS.md](../07-development/CODING_STANDARDS.md)

---

## 1. Penegasan Arsitektur: Tidak Ada HTTP / REST API

> **Aturan Keras**: Finora **TIDAK memiliki backend server, REST API, GraphQL API, maupun Next.js API Route Handlers (`/api/*`)** untuk data keuangan pengguna ([ADR-005](./ADR/ADR-005-no-backend-architecture.md)).

Seluruh komunikasi antara antarmuka pengguna (React Components / Hooks) dan basis data lokal (`FinoraDB`) dilakukan melalui **Client-Side Service Layer** berupa fungsi-fungsi TypeScript asinkron di dalam direktori `src/services/`. Dokumen ini menetapkan kontrak antarmuka fungsi internal tersebut—**bukan** endpoint HTTP.

---

## 2. Pola Kontrak Hasil Standar (*Service Result Pattern*)

Untuk menjamin penanganan error yang eksplisit dan dapat diprediksi (`NFR-008`), service layer menggunakan tipe hasil terstruktur (`ServiceResult<T>`) atau kelas error domain terstandarisasi (`FinoraDomainError`):

```ts
export type ServiceErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'BUSINESS_RULE_VIOLATION'
  | 'INTEGRITY_ERROR'
  | 'STORAGE_QUOTA_EXCEEDED'
  | 'STORAGE_UNAVAILABLE'
  | 'CHECKSUM_MISMATCH'
  | 'UNSUPPORTED_VERSION';

export interface ServiceError {
  code: ServiceErrorCode;
  message: string; // Pesan aman berbahasa Indonesia untuk pengguna
  fieldErrors?: Record<string, string[]>;
}

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ServiceError };
```

---

## 3. Spesifikasi Modul Service Layer

### 3.1 `bootstrapService` (`src/services/bootstrapService.ts`)
Bertanggung jawab atas inisialisasi kunjungan pertama (`UC-001`) dan sinkronisasi awal saat aplikasi dibuka.

| Fungsi | Parameter | Return | Tanggung Jawab |
|---|---|---|---|
| `initializeApp` | `today?: string` | `Promise<ServiceResult<{ seeded: boolean; recurringGeneratedCount: number }>>` | Membuka `FinoraDB`, melakukan *seeding* 13 kategori sistem + `appSettings` default jika kosong secara idempoten, dan memicu `recurringService.materializeDueTransactions`. |
| `getStorageHealth` | — | `Promise<{ available: boolean; persisted: boolean | null; usageBytes: number | null; quotaBytes: number | null }>` | Menginspeksi ketersediaan IndexedDB dan kuota penyimpanan via StorageManager API secara aman. |

### 3.2 `transactionService` (`src/services/transactionService.ts`)
Mengelola siklus hidup record pada tabel `transactions`.

| Fungsi | Parameter | Return | Tanggung Jawab |
|---|---|---|---|
| `createTransaction` | `input: CreateTransactionInput` | `Promise<ServiceResult<TransactionRecord>>` | Validasi Zod, verifikasi `categoryId` aktif & cocok `type`, buat UUID v4 & timestamps, simpan ke `FinoraDB`. |
| `updateTransaction` | `id: string, input: UpdateTransactionInput` | `Promise<ServiceResult<TransactionRecord>>` | Validasi Zod, verifikasi record ada & kategori kompatibel dengan `type`, perbarui record & `updatedAt`. |
| `deleteTransaction` | `id: string` | `Promise<ServiceResult<{ deletedId: string }>>` | Menghapus transaksi berdasarkan ID. |
| `getTransactionById` | `id: string` | `Promise<ServiceResult<TransactionView>>` | Mengambil satu transaksi beserta detail kategorinya untuk halaman edit. |
| `queryTransactions` | `filter: TransactionFilterInput` | `Promise<ServiceResult<TransactionQueryResult>>` | Filter berdasarkan `startDate`, `endDate`, `type`, `categoryId`, `paymentMethod`, `search`, `sortBy`, `sortDir`, plus hitung `summary` subtotal filter. |

### 3.3 `categoryService` (`src/services/categoryService.ts`)
Mengelola kategori dan menjaga integritas referensial (`RULE-019`, `RULE-020`).

| Fungsi | Parameter | Return | Tanggung Jawab |
|---|---|---|---|
| `listCategories` | `options?: { type?: TransactionType; includeArchived?: boolean }` | `Promise<ServiceResult<CategoryRecord[]>>` | Mengambil daftar kategori terurut `sortOrder ASC, name ASC`. |
| `createCategory` | `input: CreateCategoryInput` | `Promise<ServiceResult<CategoryRecord>>` | Validasi nama unik case-insensitive dalam `type` yang sama, set `isSystem: false`. |
| `updateCategory` | `id: string, input: UpdateCategoryInput` | `Promise<ServiceResult<CategoryRecord>>` | Ubah nama/ikon/warna (melarang perubahan `type` kategori yang sudah dipakai transaksi). |
| `setCategoryArchived` | `id: string, isArchived: boolean` | `Promise<ServiceResult<CategoryRecord>>` | Mengarsipkan/memulihkan kategori (menolak pengarsipan kategori fallback `cat-sys-other-*`). |
| `getCategoryUsage` | `id: string` | `Promise<ServiceResult<{ transactionsCount: number; budgetsCount: number; recurringCount: number }>>` | Menghitung referensi sebelum keputusan penghapusan. |
| `deleteCategoryWithStrategy` | `id: string, strategy: { mode: 'direct' } \| { mode: 'reassign'; targetCategoryId: string; mergeConflictingBudgets: boolean }` | `Promise<ServiceResult<{ reassignedTransactions: number }>>` | Menghapus langsung bila `refs === 0`, atau memindahkan seluruh referensi secara atomik sebelum menghapus (`RULE-020`). |

### 3.4 `budgetService` (`src/services/budgetService.ts`)
Mengelola anggaran bulanan dan evaluasi realisasi (`RULE-008` – `RULE-011`).

| Fungsi | Parameter | Return | Tanggung Jawab |
|---|---|---|---|
| `listMonthlyBudgets` | `month: string` (`YYYY-MM`) | `Promise<ServiceResult<MonthlyBudgetSummary>>` | Menggabungkan `budgets` bulan `month`, transaksi `expense` bulan `month`, dan menghitung `BudgetSpent`, `BudgetRemaining`, `BudgetUtilizationPct`, dan `BudgetStatus`. |
| `upsertBudget` | `input: UpsertBudgetInput` | `Promise<ServiceResult<BudgetRecord>>` | Memvalidasi kategori bertipe `expense`, lalu membuat atau memperbarui batas anggaran pada `(categoryId, month)`. |
| `deleteBudget` | `id: string` | `Promise<ServiceResult<{ deletedId: string }>>` | Menghapus record anggaran (tidak memengaruhi histori transaksi). |
| `copyBudgetsFromPreviousMonth` | `targetMonth: string` | `Promise<ServiceResult<{ copiedCount: number; skippedCount: number }>>` | Menyalin anggaran dari `targetMonth - 1` untuk kategori aktif yang belum memiliki anggaran di `targetMonth`. |

### 3.5 `goalService` (`src/services/goalService.ts`)
Mengelola target tabungan dan kontribusi earmark (`RULE-017`, `RULE-018`).

| Fungsi | Parameter | Return | Tanggung Jawab |
|---|---|---|---|
| `listGoals` | `today?: string` | `Promise<ServiceResult<GoalView[]>>` | Mengambil semua target lengkap dengan `GoalProgressPct`, `RemainingTarget`, dan `RequiredMonthlySaving`. |
| `createGoal` | `input: CreateGoalInput` | `Promise<ServiceResult<FinancialGoalRecord>>` | Membuat target baru dengan `currentAmount = 0`. |
| `updateGoal` | `id: string, input: UpdateGoalInput` | `Promise<ServiceResult<FinancialGoalRecord>>` | Memperbarui detail target dan mengevaluasi ulang `status`. |
| `recordGoalContribution` | `input: GoalContributionInput` | `Promise<ServiceResult<{ goal: FinancialGoalRecord; contribution: GoalContributionRecord }>>` | Transaksi atomik menyisipkan `goalContributions` (`>0` setor / `<0` tarik), memvalidasi `currentAmount + amount >= 0`, dan memperbarui `financialGoals.currentAmount` & `status`. |
| `listGoalContributions` | `goalId: string` | `Promise<ServiceResult<GoalContributionRecord[]>>` | Menampilkan riwayat alokasi dana suatu target. |
| `deleteGoal` | `id: string` | `Promise<ServiceResult<{ deletedId: string }>>` | Menghapus target beserta seluruh `goalContributions` terkait secara atomik. |

### 3.6 `recurringService` (`src/services/recurringService.ts`)
Mengelola aturan transaksi berulang dan materialisasi lokal (`RULE-014` – `RULE-016`).

| Fungsi | Parameter | Return | Tanggung Jawab |
|---|---|---|---|
| `listRecurringRules` | — | `Promise<ServiceResult<RecurringRuleView[]>>` | Mengambil seluruh aturan berulang beserta nama kategori dan estimasi jadwal berikut. |
| `createRecurringRule` | `input: CreateRecurringInput` | `Promise<ServiceResult<RecurringTransactionRecord>>` | Validasi Zod, hitung `anchorDay` dan `nextRunDate` awal, lalu simpan aturan. |
| `updateRecurringRule` | `id: string, input: UpdateRecurringInput` | `Promise<ServiceResult<RecurringTransactionRecord>>` | Memperbarui aturan untuk eksekusi mendatang tanpa mengubah transaksi historis. |
| `toggleRecurringRule` | `id: string, isActive: boolean` | `Promise<ServiceResult<RecurringTransactionRecord>>` | Mengaktifkan atau menjeda aturan. |
| `deleteRecurringRule` | `id: string` | `Promise<ServiceResult<{ deletedId: string }>>` | Menghapus aturan tanpa menghapus transaksi masa lalu. |
| `materializeDueTransactions` | `today?: string` | `Promise<ServiceResult<{ generatedCount: number; cappedRuleIds: string[] }>>` | Mengevaluasi aturan aktif `nextRunDate <= today` secara idempoten dengan batas 366 occurrence per aturan. |

### 3.7 `dashboardService` & `analyticsService` (`src/services/dashboardService.ts`, `src/services/analyticsService.ts`)

| Fungsi | Parameter | Return | Tanggung Jawab |
|---|---|---|---|
| `getDashboardSummary` | `month: string, today?: string` | `Promise<ServiceResult<DashboardSummary>>` | Menghitung KPI utama (`NetBalance`, `AvailableBalance`, `MonthlyIncome`, `MonthlyExpense`, `SavingsRate`), peringatan budget, top active goals, mini cashflow 6 bulan, dan 5 transaksi terbaru. |
| `getAnalyticsReport` | `range: DateRangeInput` | `Promise<ServiceResult<AnalyticsReport>>` | Menghasilkan deret waktu bulanan/harian, rincian pengeluaran per kategori, perbandingan periode sebelumnya, dan insight deterministik lokal. |

### 3.8 `exportService` (`src/services/exportService.ts`)

| Fungsi | Parameter | Return | Tanggung Jawab |
|---|---|---|---|
| `exportTransactionsCsv` | `filter: TransactionFilterInput` | `Promise<ServiceResult<{ filename: string; rowCount: number; blob: Blob }>>` | Mengambil transaksi terfilter, mensterilkan sel dari *CSV formula injection*, membentuk CSV UTF-8 BOM. |

### 3.9 `settingsService` & `backupService` (`src/services/settingsService.ts`, `src/services/backupService.ts`)

| Fungsi | Parameter | Return | Tanggung Jawab |
|---|---|---|---|
| `getSettings` | — | `Promise<ServiceResult<AppSettingsRecord>>` | Membaca record singleton `'default'`. |
| `updateSettings` | `patch: UpdateSettingsInput` | `Promise<ServiceResult<AppSettingsRecord>>` | Memvalidasi dan menyimpan tema, `firstDayOfWeek`, `defaultWarningThresholdPct`, `showBalancesMasked`. |
| `factoryResetDatabase` | `confirmationText: string, options: { reseedDefaultCategories: boolean }` | `Promise<ServiceResult<{ cleared: true }>>` | Memverifikasi konfirmasi `"HAPUS"`, mengosongkan seluruh 7 tabel dalam satu transaksi, opsional re-seed kategori dasar. |
| `exportBackupJson` | — | `Promise<ServiceResult<{ filename: string; blob: Blob; envelopeMeta: BackupMeta }>>` | Membaca 7 tabel, menghitung SHA-256 checksum, memperbarui `lastBackupAt`, mengembalikan JSON siap unduh. |
| `inspectBackupFile` | `file: File` | `Promise<ServiceResult<BackupPreview>>` | Memeriksa ukuran (`<= 25 MB`), parse aman, validasi Zod strict, verifikasi SHA-256, hitung konflik ID & budget. |
| `applyRestore` | `validatedEnvelope: BackupEnvelopeV1, options: RestoreOptions` | `Promise<ServiceResult<RestoreSummary>>` | Menjalankan `Replace All` (butuh `"TIMPA"`) atau `Merge` secara atomik di `FinoraDB`. |

---

## 4. Kontrak Pure Domain Calculators (`src/domain/`)

Fungsi kalkulator murni harus terpisah dari service I/O agar dapat dijalankan langsung pada `vitest` tanpa mocking database:
- `src/domain/money.ts`: `formatIdr(amount)`, `parseIdrInput(raw)`, `assertSafeIdrAmount(n)`.
- `src/domain/dates.ts`: `getLocalToday()`, `getLocalMonth(date)`, `isValidCalendarDate(str)`, `computeNextOccurrenceDate(rule, currentOccDate)`.
- `src/domain/financeCalculators.ts`: `calculateCashflowSummary(txs)`, `calculateNetBalance(txs)`, `calculateAvailableBalance(netBalance, goals)`, `calculateBudgetMetrics(limit, spent, threshold)`, `calculateGoalMetrics(goal, today)`.
- `src/domain/insightsEngine.ts`: `buildDeterministicInsights(input)`.
- `src/domain/csvFormatter.ts`: `sanitizeCsvCell(val)`, `serializeTransactionsToCsv(rows)`.
