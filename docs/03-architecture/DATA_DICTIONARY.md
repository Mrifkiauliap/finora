# Data Dictionary — Finora

**Versi Dokumen**: 1.0.0  
**Tujuan**: Mendefinisikan tipe data, rentang validasi, nilai default, constraint, dan kegunaan setiap atribut pada ketujuh tabel `FinoraDB` serta struktur envelope Backup JSON.  
**Dokumen Terkait**: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md) | [BACKUP_RESTORE.md](../05-security/BACKUP_RESTORE.md)

---

## 1. Tabel `transactions`

| Nama Field | Tipe TS / IndexedDB | Wajib | Batasan & Validasi Zod | Default | Tujuan / Keterangan |
|---|---|---|---|---|---|
| `id` | `string` (UUID v4) | Ya (PK) | `z.string().uuid()` | Generated UUID v4 | Identitas unik transaksi |
| `type` | `'income' \| 'expense'` | Ya | `z.enum(['income', 'expense'])` | `'expense'` (di form) | Arah arus kas transaksi |
| `amount` | `number` (integer) | Ya | `z.number().int().safe().min(1).max(999_999_999_999)` | — | Nominal IDR dalam integer positif |
| `categoryId` | `string` | Ya (FK) | `z.string().min(1).max(64)`, ada di `categories` & `cat.type === type` | — | Kategori pengelompokan transaksi |
| `date` | `string` (`YYYY-MM-DD`) | Ya | Regex `^\d{4}-\d{2}-\d{2}$` + kalender Gregorian valid | Hari ini lokal | Tanggal kejadian transaksi lokal |
| `note` | `string` | Ya (boleh `""`) | `z.string().trim().max(500)` | `""` | Catatan/deskripsi singkat transaksi |
| `paymentMethod` | `PaymentMethod` | Ya | `z.enum(['cash', 'bank_transfer', 'e_wallet', 'debit_card', 'credit_card', 'other'])` | `'cash'` | Metode pembayaran untuk filter & laporan |
| `recurringRuleId` | `string \| null` | Ya | `z.string().uuid().nullable()` | `null` | Referensi ke aturan berulang asal (jika otomatis) |
| `recurringOccurrenceDate` | `string \| null` | Ya | `YYYY-MM-DD` valid atau `null`; wajib non-null jika `recurringRuleId !== null` | `null` | Tanggal jadwal asli untuk kunci idempotensi |
| `createdAt` | `string` (ISO UTC) | Ya | `z.string().datetime()` | `new Date().toISOString()` | Timestamp audit pembuatan record |
| `updatedAt` | `string` (ISO UTC) | Ya | `z.string().datetime()` | `new Date().toISOString()` | Timestamp audit pembaruan terakhir |

---

## 2. Tabel `categories`

| Nama Field | Tipe TS / IndexedDB | Wajib | Batasan & Validasi Zod | Default | Tujuan / Keterangan |
|---|---|---|---|---|---|
| `id` | `string` | Ya (PK) | `z.string().min(1).max(64)` (`cat-sys-*` atau UUID v4) | UUID v4 (kustom) | Identitas unik kategori |
| `name` | `string` | Ya | `z.string().trim().min(1).max(50)`; unik case-insensitive per `type` | — | Nama kategori tampilan UI |
| `type` | `'income' \| 'expense'` | Ya | `z.enum(['income', 'expense'])` | — | Jenis arus kas kategori |
| `icon` | `string` | Ya | Kunci ikon dari daftar terkurasi Lucide Icons (1..40 char, alphanumeric/dash) | `'tag'` | Ikon visual kategori pada kartu & daftar |
| `color` | `string` | Ya | Regex `^#[0-9A-Fa-f]{6}$` (diambil dari palet kategori terkurasi) | `'#10B981'` | Warna badge/grafik kategori |
| `isSystem` | `boolean` | Ya | `z.boolean()` | `false` (kustom) | Menandai 13 kategori bawaan sistem |
| `isArchived` | `boolean` | Ya | `z.boolean()`; selalu `false` untuk 2 kategori fallback `Lainnya` | `false` | Menyembunyikan kategori dari form baru tanpa menghapus histori |
| `sortOrder` | `number` (integer) | Ya | `z.number().int().min(0).max(10_000)` | Urutan berikutnya | Urutan tampilan kategori di daftar |
| `createdAt` | `string` (ISO UTC) | Ya | `z.string().datetime()` | Now UTC | Audit pembuatan |
| `updatedAt` | `string` (ISO UTC) | Ya | `z.string().datetime()` | Now UTC | Audit pembaruan |

---

## 3. Tabel `budgets`

| Nama Field | Tipe TS / IndexedDB | Wajib | Batasan & Validasi Zod | Default | Tujuan / Keterangan |
|---|---|---|---|---|---|
| `id` | `string` (UUID v4) | Ya (PK) | `z.string().uuid()` | UUID v4 | Identitas unik anggaran bulanan |
| `categoryId` | `string` | Ya (FK) | `z.string().min(1).max(64)`, harus merujuk kategori bertipe `'expense'` | — | Kategori pengeluaran yang dibatasi |
| `month` | `string` (`YYYY-MM`) | Ya | Regex `^\d{4}-(0[1-9]\|1[0-2])$` | Bulan berjalan | Bulan berlaku anggaran |
| `limitAmount` | `number` (integer) | Ya | `z.number().int().safe().min(1).max(999_999_999_999)` | — | Batas maksimal pengeluaran IDR per bulan |
| `warningThresholdPct` | `number` (integer) | Ya | `z.number().int().min(50).max(95)` | `80` (dari `appSettings`) | Ambang persentase pemicu status `warning` |
| `createdAt` | `string` (ISO UTC) | Ya | `z.string().datetime()` | Now UTC | Audit pembuatan |
| `updatedAt` | `string` (ISO UTC) | Ya | `z.string().datetime()` | Now UTC | Audit pembaruan |

---

## 4. Tabel `financialGoals`

| Nama Field | Tipe TS / IndexedDB | Wajib | Batasan & Validasi Zod | Default | Tujuan / Keterangan |
|---|---|---|---|---|---|
| `id` | `string` (UUID v4) | Ya (PK) | `z.string().uuid()` | UUID v4 | Identitas unik target keuangan |
| `name` | `string` | Ya | `z.string().trim().min(1).max(80)` | — | Nama tujuan tabungan (mis. Dana Darurat) |
| `targetAmount` | `number` (integer) | Ya | `z.number().int().safe().min(1).max(999_999_999_999)` | — | Nominal target akhir IDR |
| `currentAmount` | `number` (integer) | Ya | `z.number().int().safe().min(0).max(999_999_999_999)` | `0` | Total dana teralokasi saat ini (hasil agregasi `goalContributions`) |
| `deadline` | `string \| null` | Ya | `YYYY-MM-DD` valid atau `null` | `null` | Tenggat waktu opsional untuk hitung estimasi bulanan |
| `status` | `GoalStatus` | Ya | `z.enum(['active', 'completed', 'paused'])` | `'active'` | Status siklus hidup target |
| `icon` | `string` | Ya | Kunci ikon terkurasi Lucide | `'target'` | Ikon kartu target |
| `color` | `string` | Ya | Regex `^#[0-9A-Fa-f]{6}$` | `'#10B981'` | Warna aksen kartu target |
| `note` | `string` | Ya (boleh `""`) | `z.string().trim().max(500)` | `""` | Catatan motivasi atau rincian target |
| `createdAt` | `string` (ISO UTC) | Ya | `z.string().datetime()` | Now UTC | Audit pembuatan |
| `updatedAt` | `string` (ISO UTC) | Ya | `z.string().datetime()` | Now UTC | Audit pembaruan |

---

## 5. Tabel `goalContributions`

| Nama Field | Tipe TS / IndexedDB | Wajib | Batasan & Validasi Zod | Default | Tujuan / Keterangan |
|---|---|---|---|---|---|
| `id` | `string` (UUID v4) | Ya (PK) | `z.string().uuid()` | UUID v4 | Identitas unik catatan setoran/penarikan |
| `goalId` | `string` (UUID v4) | Ya (FK) | `z.string().uuid()`, ada di `financialGoals` | — | Target keuangan tujuan alokasi |
| `amount` | `number` (integer) | Ya | `z.number().int().safe().refine(v => v !== 0)` (rentang `±999_999_999_999`) | — | Positif (`> 0`) untuk setoran, negatif (`< 0`) untuk penarikan |
| `date` | `string` (`YYYY-MM-DD`) | Ya | `YYYY-MM-DD` valid | Hari ini lokal | Tanggal setoran/penarikan alokasi |
| `note` | `string` | Ya (boleh `""`) | `z.string().trim().max(250)` | `""` | Catatan sumber alokasi (mis. "Sisihan gaji Nov") |
| `createdAt` | `string` (ISO UTC) | Ya | `z.string().datetime()` | Now UTC | Audit pembuatan |

---

## 6. Tabel `recurringTransactions`

| Nama Field | Tipe TS / IndexedDB | Wajib | Batasan & Validasi Zod | Default | Tujuan / Keterangan |
|---|---|---|---|---|---|
| `id` | `string` (UUID v4) | Ya (PK) | `z.string().uuid()` | UUID v4 | Identitas unik aturan berulang |
| `type` | `'income' \| 'expense'` | Ya | `z.enum(['income', 'expense'])` | `'expense'` | Tipe transaksi yang akan dihasilkan |
| `amount` | `number` (integer) | Ya | `z.number().int().safe().min(1).max(999_999_999_999)` | — | Nominal IDR setiap occurrence |
| `categoryId` | `string` | Ya (FK) | Ada di `categories` & `cat.type === type` | — | Kategori transaksi otomatis |
| `note` | `string` | Ya (boleh `""`) | `z.string().trim().max(500)` | `""` | Catatan bawaan untuk transaksi hasil generasi |
| `paymentMethod` | `PaymentMethod` | Ya | Sama dengan `transactions.paymentMethod` | `'bank_transfer'` | Metode pembayaran transaksi otomatis |
| `frequency` | `RecurringFrequency` | Ya | `z.enum(['daily', 'weekly', 'monthly', 'yearly'])` | `'monthly'` | Siklus perulangan |
| `interval` | `number` (integer) | Ya | `z.number().int().min(1).max(365)` | `1` | Kelipatan siklus (misal `2` untuk 2 mingguan) |
| `anchorDay` | `number \| null` | Ya | `z.number().int().min(1).max(31).nullable()` | Hari dari `startDate` jika `monthly` | Hari jangkar untuk *end-of-month clamping* (`RULE-014`) |
| `startDate` | `string` (`YYYY-MM-DD`) | Ya | `YYYY-MM-DD` valid | Hari ini lokal | Tanggal mulai efektif aturan |
| `endDate` | `string \| null` | Ya | `YYYY-MM-DD` valid `>= startDate` atau `null` | `null` | Batas akhir opsional aturan berulang |
| `nextRunDate` | `string` (`YYYY-MM-DD`) | Ya | `YYYY-MM-DD` valid | Sama dengan `startDate` saat dibuat | Tanggal eksekusi berikutnya |
| `lastGeneratedDate` | `string \| null` | Ya | `YYYY-MM-DD` valid atau `null` | `null` | Tanggal occurrence terakhir yang berhasil dibuat |
| `isActive` | `boolean` | Ya | `z.boolean()` | `true` | Status aktif/jeda aturan |
| `createdAt` | `string` (ISO UTC) | Ya | `z.string().datetime()` | Now UTC | Audit pembuatan |
| `updatedAt` | `string` (ISO UTC) | Ya | `z.string().datetime()` | Now UTC | Audit pembaruan |

---

## 7. Tabel `appSettings`

| Nama Field | Tipe TS / IndexedDB | Wajib | Batasan & Validasi Zod | Default | Tujuan / Keterangan |
|---|---|---|---|---|---|
| `id` | `'default'` | Ya (PK) | `z.literal('default')` | `'default'` | Kunci singleton pengaturan aplikasi |
| `theme` | `'dark' \| 'light' \| 'system'` | Ya | `z.enum(['dark', 'light', 'system'])` | `'dark'` | Preferensi tema antarmuka |
| `currency` | `'IDR'` | Ya | `z.literal('IDR')` | `'IDR'` | Kode mata uang aktif MVP |
| `locale` | `'id-ID'` | Ya | `z.literal('id-ID')` | `'id-ID'` | Locale pemformatan angka dan tanggal |
| `firstDayOfWeek` | `0 \| 1` | Ya | `z.union([z.literal(0), z.literal(1)])` (`0`=Minggu, `1`=Senin) | `1` | Hari awal minggu untuk filter mingguan/kalender |
| `defaultWarningThresholdPct` | `number` (integer) | Ya | `z.number().int().min(50).max(95)` | `80` | Ambang default saat membuat anggaran baru |
| `showBalancesMasked` | `boolean` | Ya | `z.boolean()` | `false` | Status mode privasi penyamaran nominal |
| `lastBackupAt` | `string \| null` | Ya | `z.string().datetime().nullable()` | `null` | Timestamp UTC ekspor JSON terakhir (`FR-023`) |
| `onboardingCompleted` | `boolean` | Ya | `z.boolean()` | `true` (setelah seed) | Menandai inisialisasi awal selesai |
| `schemaMetaVersion` | `number` (integer) | Ya | `z.number().int().min(1)` | `1` | Versi metadata skema aplikasi |
| `updatedAt` | `string` (ISO UTC) | Ya | `z.string().datetime()` | Now UTC | Audit pembaruan pengaturan |

---

## 8. Envelope Backup JSON (`BackupEnvelopeV1`)

Rincian format lengkap berada pada [BACKUP_RESTORE.md](../05-security/BACKUP_RESTORE.md).

| Field Envelope | Tipe | Batasan | Keterangan |
|---|---|---|---|
| `appName` | `'Finora'` | `z.literal('Finora')` | Penanda aplikasi asal |
| `backupFormatVersion` | `1` | `z.literal(1)` | Versi spesifikasi format file backup |
| `dbSchemaVersion` | `number` | `z.number().int().min(1)` (`1` untuk MVP) | Versi skema `FinoraDB` saat diekspor |
| `exportedAt` | `string` | `z.string().datetime()` | Waktu ekspor dalam UTC |
| `checksum` | `{ algorithm: 'SHA-256', value: string }` | `value` tepat 64 karakter hex lowercase | Hash integritas atas serialisasi kanonik `payload` |
| `payload` | `BackupPayloadV1` | Objek `.strict()` berisi array dari ke-7 tabel | Seluruh data pengguna yang dicadangkan |
