# Reusable UI Components Specification — Finora

**Versi Dokumen**: 1.0.0  
**Basis**: `shadcn/ui` (Radix Primitives) + Tailwind CSS + Lucide Icons  
**Dokumen Terkait**: [STYLING.md](./STYLING.md) | [LAYOUTS.md](./LAYOUTS.md) | [PAGE_SPECIFICATIONS.md](./PAGE_SPECIFICATIONS.md)

---

## 1. Komponen Fondasi & Primitif Keuangan

### 1.1 `MoneyText`
- **Tanggung Jawab**: Memformat dan merender nominal IDR secara konsisten dengan `tabular-nums`, tanda semantik opsional (`+`/`-`), dan dukungan *Privacy Masking* (`showBalancesMasked`).
- **Props**:
  - `amount: number` (integer IDR)
  - `variant?: 'neutral' | 'income' | 'expense' | 'balance'`
  - `showSign?: boolean` (default `false`; `true` untuk baris transaksi)
  - `masked?: boolean` (default mengikuti `appSettings.showBalancesMasked`)
  - `size?: 'sm' | 'md' | 'lg' | 'hero'`
- **Varian & States**: `normal`, `masked` (menampilkan `"Rp •••••••"` dengan `aria-label="Nominal disembunyikan"`), `negative` (warna danger text & tanda `-`).
- **Aksesibilitas**: Memakai `<span className="tabular-nums">`; ketika `variant='income'|'expense'`, tanda `+` atau `-` tetap dirender agar tidak hanya bergantung warna.

### 1.2 `CurrencyInput`
- **Tanggung Jawab**: Input nominal Rupiah yang ramah pengguna seluler: menerima ketikan digit, menampilkan pemisah ribuan `.` secara real-time, namun meneruskan nilai integer murni ke form/Zod.
- **Props**:
  - `id: string`, `label: string`, `value: number | null`, `onChange: (val: number | null) => void`, `error?: string`, `max?: number`, `disabled?: boolean`
- **States**: `default`, `focus` (ring emerald), `error` (border merah + pesan error di bawah), `disabled`.
- **Aksesibilitas & Interaksi**: `inputMode="numeric"`, prefix `"Rp"` non-interaktif (`aria-hidden`), `aria-invalid={!!error}`, `aria-describedby` menunjuk ID elemen error. Menolak karakter non-digit dan mencegah paste teks desimal/negatif korup.

### 1.3 `KpiSummaryCard`
- **Tanggung Jawab**: Kartu metrik utama di Dashboard dan Laporan.
- **Props**: `title: string`, `amount?: number`, `formattedValue?: string`, `subtitle?: string`, `trend?: { valuePct: number | null; direction: 'up' | 'down' | 'neutral'; label: string }`, `icon: LucideIcon`, `tone?: 'default' | 'accent' | 'warning' | 'danger'`, `loading?: boolean`.
- **States**: `loading` (skeleton shimmer), `populated`, `masked`, `empty` (`"—"`).
- **Aksesibilitas**: Kontras heading/angka minimal AA; elemen ikon dekoratif diberi `aria-hidden="true"`.

### 1.4 `CategoryBadge`
- **Tanggung Jawab**: Menampilkan ikon kategori berlatar warna lembut + nama kategori (+ penanda `"Diarsipkan"` jika `isArchived === true`).
- **Props**: `name: string`, `icon: string`, `color: string`, `isArchived?: boolean`, `size?: 'sm' | 'md'`.
- **States**: `active`, `archived` (opacity label lembut + chip kecil `"Arsip"`).

---

## 2. Komponen Fitur & Domain

### 2.1 `TransactionFormDialog` / `TransactionForm`
- **Tanggung Jawab**: Formulir terpadu untuk tambah dan edit transaksi (`UC-002`, `UC-003`). Pada desktop dapat tampil sebagai modal/halaman, pada mobile sebagai *full-height sheet* atau halaman `/transactions/new`.
- **Props**: `mode: 'create' | 'edit'`, `initialData?: TransactionRecord`, `categories: CategoryRecord[]`, `onSuccess: (tx: TransactionRecord) => void`, `onCancel: () => void`.
- **States**: `idle`, `submitting` (tombol disable + spinner), `validationError` (per field), `submitError`.
- **Interaksi**:
  - Segmented control **Pengeluaran | Pemasukan** di posisi paling atas; mengganti tipe otomatis memfilter dropdown kategori dan mengosongkan pilihan kategori bila tipenya tidak cocok.
  - Tombol cepat tanggal (`Hari Ini`, `Kemarin`) plus date picker standar `YYYY-MM-DD`.
  - Opsi `"Simpan & Catat Lagi"` pada mode `create`.

### 2.2 `TransactionListItem` & `TransactionTable`
- **Tanggung Jawab**: Menampilkan daftar transaksi secara responsif: *card-row* ringkas di mobile, tabel rapi berkolom di desktop.
- **Props**: `transactions: TransactionView[]`, `masked: boolean`, `onEdit: (id: string) => void`, `onDelete: (tx: TransactionView) => void`, `loading?: boolean`.
- **States**: `loading` (5–8 skeleton rows), `empty` (ilustrasi + CTA tambah transaksi), `populated`.
- **Aksesibilitas**: Baris transaksi memiliki tombol aksi berlabel jelas (`aria-label="Ubah transaksi Makanan & Minuman Rp 35.000"`).

### 2.3 `BudgetProgressCard`
- **Tanggung Jawab**: Menampilkan anggaran satu kategori pada bulan terpilih: batas, terpakai, sisa/over-budget, persentase, dan progress bar semantik (`safe`/`warning`/`exceeded`).
- **Props**: `budget: BudgetEvaluationView`, `masked: boolean`, `onEdit: () => void`, `onDelete: () => void`, `onInspectTransactions: () => void`.
- **States**: `safe` (hijau), `warning` (amber + ikon peringatan), `exceeded` (merah + label `"Melebihi Rp X"`).
- **Aksesibilitas**: Memakai elemen `role="progressbar"`, `aria-valuenow`, `aria-valuemin={0}`, `aria-valuemax={100}`, dan teks status eksplisit (bukan warna saja).

### 2.4 `GoalProgressCard`
- **Tanggung Jawab**: Menampilkan kartu target keuangan, progres bar, `currentAmount / targetAmount`, sisa target, badge status, dan estimasi `RequiredMonthlySaving` bila memiliki tenggat.
- **Props**: `goal: GoalView`, `masked: boolean`, `onContribute: (mode: 'deposit' | 'withdraw') => void`, `onEdit: () => void`, `onViewHistory: () => void`, `onDelete: () => void`.
- **States**: `active`, `completed` (badge emerald `"Tercapai"`), `paused`, `overdue` (tenggat terlewat tapi target belum tercapai).

### 2.5 `RecurringRuleCard`
- **Tanggung Jawab**: Menampilkan aturan transaksi berulang, siklus (`Setiap 1 Bulan`), tanggal eksekusi berikutnya (`nextRunDate`), toggle aktif/jeda (`Switch`), dan aksi edit/hapus.
- **Props**: `rule: RecurringRuleView`, `masked: boolean`, `onToggleActive: (id: string, next: boolean) => void`, `onEdit: (id: string) => void`, `onDelete: (id: string) => void`.
- **Aksesibilitas**: Switch memakai `aria-label="Aktifkan transaksi berulang Sewa Kos"`.

### 2.6 `ChartContainerCard`
- **Tanggung Jawab**: Pembungkus seragam untuk seluruh grafik Recharts (`ResponsiveContainer` dengan tinggi eksplisit agar CLS = 0).
- **Props**: `title: string`, `subtitle?: string`, `actions?: ReactNode`, `loading?: boolean`, `isEmpty?: boolean`, `emptyMessage?: string`, `children: ReactNode`.
- **States**: `loading` (blok tinggi tetap mencegah layout shift), `empty` (pesan informatif tanpa grid Recharts kosong), `ready`.

---

## 3. Komponen Sistem, Navigasi & Keamanan Aksi

### 3.1 `AppSidebar` & `MobileBottomNav`
- **Tanggung Jawab**: Navigasi utama antar halaman Finora sesuai [LAYOUTS.md](./LAYOUTS.md).
- **Aksesibilitas**: Elemen `<nav aria-label="Navigasi Utama">`, item aktif memakai `aria-current="page"`.

### 3.2 `PrivacyMaskToggle` & `ThemeToggle`
- **Tanggung Jawab**: Kontrol cepat di header untuk mengaktifkan/mematikan penyamaran nominal dan mengganti tema (`Dark` / `Light` / `System`).
- **Aksesibilitas**: `aria-pressed` untuk toggle masking dan `aria-label` deskriptif.

### 3.3 `ConfirmDialog` & `TypedConfirmDialog`
- **Tanggung Jawab**:
  - `ConfirmDialog`: konfirmasi aksi standar (hapus transaksi, hapus budget, hapus target).
  - `TypedConfirmDialog`: konfirmasi berisiko tinggi (`SEC-010`) yang mewajibkan pengguna mengetik kata kunci tepat (misal `"TIMPA"` untuk Restore Replace All atau `"HAPUS"` untuk Factory Reset).
- **States**: `open`, `locked` (tombol konfirmasi `disabled` sebelum teks cocok), `processing`.
- **Aksesibilitas**: Radix AlertDialog dengan *focus trap* dan fokus awal aman pada tombol Batal atau input teks (bukan langsung tombol Hapus).

### 3.4 `OfflineStatusBanner` & `SwUpdateBanner`
- **Tanggung Jawab**:
  - `OfflineStatusBanner`: pill/banner halus saat `navigator.onLine === false` ("Mode Offline • Data tetap tersimpan lokal").
  - `SwUpdateBanner`: toast/banner saat versi Service Worker baru menunggu aktivasi dengan tombol **"Muat Ulang"**.
- **Aksesibilitas**: `role="status"` dengan `aria-live="polite"`.

### 3.5 `BackupDropzone` & `RestorePreviewPanel`
- **Tanggung Jawab**: Area unggah berkas `.json` (`<= 25 MB`) dengan dukungan drag-and-drop maupun tombol pilih berkas standar, diikuti panel pratinjau hasil validasi (`BACKUP_RESTORE.md`).
- **States**: `idle`, `validating`, `invalid` (menampilkan alasan spesifik seperti *checksum mismatch* / format salah), `previewReady`.

### 3.6 `EmptyState` & `ErrorFallback`
- **Tanggung Jawab**: Standar tampilan ketika data kosong atau terjadi kegagalan sistem (misal IndexedDB diblokir).
- **Props**: `icon: LucideIcon`, `title: string`, `description: string`, `actionLabel?: string`, `onAction?: () => void`.
