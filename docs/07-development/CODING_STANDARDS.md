# Coding Standards & Conventions — Finora

**Versi Dokumen**: 1.0.0  
**Dokumen Terkait**: [AGENT_BRIEF.md](./AGENT_BRIEF.md) | [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | [API_DESIGN.md](../03-architecture/API_DESIGN.md)

---

## 1. Konvensi TypeScript (`strict: true`)

- Wajib mengaktifkan di `tsconfig.json`: `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": false` (opsional, namun `noImplicitAny` dan `strictNullChecks` wajib).
- **Larangan `any` dan Non-Null Assertion (`!`)**: Gunakan `unknown` lalu persempit dengan Zod atau *type guard*; hindari `as Foo` kecuali pada kasus terverifikasi dengan komentar alasan.
- Gunakan `import type` untuk tipe agar bundel klien bersih dari impor tipe runtime.
- Ekspor seluruh tipe entitas dan input DTO dari modul `src/types/` atau diinferensikan langsung dari skema `src/schemas/` (`z.infer<typeof Schema>`).

---

## 2. Konvensi React & Next.js App Router

- **Batas `'use client'`**: Komponen halaman interaktif yang membaca `FinoraDB` ditandai `'use client'`, sementara `layout.tsx`, metadata, `manifest.ts`, dan rute `/offline` dapat dirender statis.
- **Hindari Hydration Mismatch**: Jangan membaca `window`, `localStorage`, atau IndexedDB secara sinkron saat render pertama sebelum mount; gunakan state terinisialisasi aman atau `useLiveQuery` dengan skeleton state yang deterministik.
- **Komponen Kecil & Single-Purpose**: Pisahkan komponen tampilan murni (*presentational*) dari hook akses data. Batasi panjang komponen UI; pecah sub-panel kompleks (misal modal form, filter bar) ke file terpisah.
- **Kepatuhan Aksesibilitas**: Setiap `<input>`, `<select>`, dan tombol ikon wajib memiliki label atau `aria-label` berbahasa Indonesia yang jelas.

---

## 3. Konvensi Penamaan (*Naming Conventions*)

| Artefak | Konvensi | Contoh |
|---|---|---|
| Komponen React & File Komponen | `PascalCase.tsx` | `BudgetProgressCard.tsx`, `CurrencyInput.tsx` |
| Service, Domain, Utility, Schema | `camelCase.ts` | `transactionService.ts`, `financeCalculators.ts`, `transactionSchema.ts` |
| Custom Hooks | `useCamelCase.ts` | `useDashboardSummary.ts`, `useOnlineStatus.ts` |
| Rute Halaman App Router | `kebab-case` (konvensi Next.js) | `src/app/settings/backup/page.tsx` |
| Tipe, Interface, Zod Schema | `PascalCase` | `TransactionRecord`, `CreateTransactionSchema` |
| Konstanta Global | `UPPER_SNAKE_CASE` | `MAX_IDR_AMOUNT`, `MAX_BACKUP_FILE_BYTES`, `SYSTEM_CATEGORIES` |
| Identifier Kode vs Teks UI | Kode: **Bahasa Inggris**; Teks UI & pesan error user: **Bahasa Indonesia** | `createTransaction` → `"Transaksi berhasil disimpan"` |

---

## 4. Manajemen State (*State Management*)

- **Server State Tidak Ada**: Jangan memasang React Query untuk REST API karena tidak ada backend.
- **Source of Truth Reaktif**: Gunakan `useLiveQuery` dari `dexie-react-hooks` untuk membaca data reaktif dari `FinoraDB`.
- **UI State Lokal**: Gunakan `useState` / `useReducer` untuk state form, filter halaman, dan modal terbuka/tertutup.
- **Global App Context Ringan**: Cukup sediakan `AppSettingsProvider` (tema & *privacy masking*), `DatabaseBootstrapProvider` (memastikan `initializeApp()` selesai sekali dan menangkap `STORAGE_UNAVAILABLE`), serta `ToastProvider` (Sonner / shadcn Toast).

---

## 5. Penanganan Error & Validasi

1. **Service Layer Memulangkan `ServiceResult<T>`**: Hindari melempar exception mentah ke komponen UI untuk kegagalan bisnis terduga (`VALIDATION_ERROR`, `NOT_FOUND`, `CHECKSUM_MISMATCH`). Tangkap `DexieError` (khususnya `QuotaExceededError`) dan petakan ke `STORAGE_QUOTA_EXCEEDED`.
2. **Validasi Ganda (UI + Service Boundary)**: UI boleh memberi umpan balik instan per field, tetapi `src/services/*` wajib tetap menjalankan `Schema.safeParse(input)` sebagai gerbang akhir sebelum menyentuh `FinoraDB`.
3. **Sanitasi Error**: Pesan error yang tampil di UI harus informatif bagi pengguna dalam Bahasa Indonesia tanpa menampilkan stack trace atau nama modul internal.

---

## 6. Logging & Kebersihan Produksi

- **DILARANG** menulis `console.log` yang mencetak nominal, catatan transaksi, atau seluruh isi `payload` backup!
- Pada pengembangan lokal, error tak terduga dapat dicatat via wrapper `logger.error(code, safeMessage)` yang hanya mencetak kode error dan pesan non-sensitif (tidak pernah membocorkan data finansial).

---

## 7. Utilitas Keuangan & Tanggal (*Financial & Date Utilities*)

- **Seluruh fungsi uang dan tanggal wajib berasal dari `src/domain/money.ts` dan `src/domain/dates.ts`**:
  ```ts
  // Benar: pakai fungsi domain terpusat
  import { formatIdr, parseIdrDigits } from '@/domain/money';
  import { getLocalToday, getLocalMonth } from '@/domain/dates';
  ```
- **DILARANG** menulis ulang `new Intl.NumberFormat(...)` atau `new Date().toISOString()` di dalam komponen UI secara sporadis.
- Seluruh kalkulasi angka memakai aritmetika integer (`Math.round`, `Math.ceil`, `Math.floor` hanya di langkah akhir rasio/estimasi sesuai rumus `RULE-005`, `RULE-009`, `RULE-018`).
