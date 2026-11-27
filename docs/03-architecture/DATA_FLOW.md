# Data Flow Specification — Finora

**Versi Dokumen**: 1.0.0  
**Tujuan**: Mendokumentasikan sembilan alur data utama di dalam runtime klien Finora, lengkap dengan diagram alur dan kontrak validasi/transaksi.  
**Dokumen Terkait**: [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) | [API_DESIGN.md](./API_DESIGN.md) | [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md)

---

## 1. Pembuatan Transaksi (*Transaction Creation*)

```mermaid
sequenceDiagram
    participant U as Pengguna
    participant UI as TransactionForm
    participant SVC as transactionService
    participant Z as Zod Schema
    participant DB as FinoraDB

    U->>UI: Isi tipe, nominal IDR, kategori, tanggal, metode, catatan
    UI->>SVC: createTransaction(input)
    SVC->>Z: parse(CreateTransactionSchema)
    alt Input tidak valid
        Z-->>SVC: ZodError
        SVC-->>UI: Return ValidationError per field
        UI-->>U: Tampilkan pesan error di bawah input
    else Input valid
        SVC->>DB: transaction rw (categories, transactions)
        SVC->>DB: Cek categoryId ada & type cocok & !isArchived
        DB-->>SVC: Kategori valid
        SVC->>DB: transactions.add(record dengan UUID v4 & UTC timestamps)
        DB-->>SVC: Sukses + trigger useLiveQuery
        SVC-->>UI: Return Result Ok(TransactionRecord)
        UI-->>U: Toast sukses & perbarui tampilan
    end
```

---

## 2. Penyuntingan Transaksi (*Transaction Editing*)

```mermaid
sequenceDiagram
    participant U as Pengguna
    participant UI as TransactionForm
    participant SVC as transactionService
    participant DB as FinoraDB

    U->>UI: Ubah field transaksi lalu Simpan
    UI->>SVC: updateTransaction(id, patch)
    SVC->>SVC: Validasi Zod UpdateTransactionSchema
    SVC->>DB: transaction rw (categories, transactions)
    SVC->>DB: Ambil existing = transactions.get(id)
    alt Record tidak ada
        DB-->>SVC: undefined
        SVC-->>UI: NotFoundError
    else Record ada
        SVC->>DB: Verifikasi kategori baru cocok dengan tipe akhir
        Note over SVC: Jika kategori tidak diganti, kategori arsip lama tetap sah
        SVC->>DB: transactions.put(merged dengan createdAt tetap & updatedAt baru)
        DB-->>SVC: Sukses + reactive refresh
        SVC-->>UI: Result Ok(updatedRecord)
    end
```

---

## 3. Penghapusan Transaksi (*Transaction Deletion*)

1. Pengguna menekan tombol **Hapus** pada item transaksi.
2. UI membuka `ConfirmDialog` yang menampilkan nominal, nama kategori, dan tanggal transaksi.
3. Setelah pengguna menekan **Hapus Permanen**, UI memanggil `transactionService.deleteTransaction(id)`.
4. Service memeriksa keberadaan record (mengembalikan `NotFoundError` jika sudah tidak ada) dan mengeksekusi `db.transactions.delete(id)`.
5. `useLiveQuery` secara reaktif memperbarui halaman Transaksi, ringkasan Dashboard, dan realisasi Anggaran bulan terkait.

---

## 4. Agregasi Dashboard (*Dashboard Aggregation*)

```mermaid
flowchart LR
    T["Tabel transactions"] -->|"where type+date"| P["Filter Bulan Berjalan & All-Time"]
    G["Tabel financialGoals"] -->|"sum currentAmount"| A["TotalAllocatedSavings"]
    B["Tabel budgets"] -->|"where month = currentMonth"| E["Evaluasi BudgetStatus"]
    C["Tabel categories"] -->|"Map id ke nama/ikon/warna"| J["Enrich Label"]

    P -->|"RULE-002..005"| KPI["NetBalance, MonthlyIncome, MonthlyExpense, SavingsRate"]
    KPI --> AV["AvailableBalance = NetBalance - TotalAllocatedSavings"]
    A --> AV
    P --> E
    E --> J
    J --> UI["Dashboard UI Cards & Recent 5"]
```

- Seluruh perhitungan agregasi dieksekusi di `dashboardService.getDashboardSummary(currentMonth)` dengan memanggil fungsi murni di `src/domain/calculators.ts`.
- Total transaksi yang dibaca dibatasi dengan indeks `date` untuk periode bulan berjalan dan 6 bulan terakhir (untuk mini chart), sementara `NetBalance` menggunakan indeks `type` atau penjumlahan teroptimasi (`NFR-001`).

---

## 5. Perhitungan Anggaran (*Budget Calculation*)

```mermaid
flowchart TD
    M["Input Bulan Target YYYY-MM"] --> QB["Ambil budgets where month = M"]
    M --> QT["Ambil transactions where type = expense dan date dalam bulan M"]
    QT --> GRP["Kelompokkan dan jumlahkan amount per categoryId"]
    QB --> JOIN["Gabungkan dengan kategori & total spent"]
    GRP --> JOIN
    JOIN --> CALC["Hitung BudgetRemaining, UtilizationPct, BudgetStatus (RULE-009, RULE-010)"]
    CALC --> OUT["Daftar BudgetView terurut: exceeded lalu warning lalu safe"]
```

- Jika terdapat pengeluaran pada kategori yang **tidak memiliki** anggaran di bulan `M`, pengeluaran tersebut tetap dihitung pada total pengeluaran Dashboard/Analytics, tetapi tidak dimunculkan sebagai pelanggaran anggaran di `/budgets` (tersedia daftar kategori belum dianggarkan sebagai saran opsional).

---

## 6. Wawasan Keuangan (*Financial Insights*)

1. `analyticsService.getAnalyticsOverview(range)` membaca transaksi dalam rentang periode terpilih dan periode pembanding sebelumnya (misalnya bulan lalu).
2. `insightsEngine.generateInsights(currentData, previousData, budgets, goals)` mengevaluasi aturan deterministik lokal berikut secara berurutan:
   - **Perubahan Pengeluaran MoM**: membandingkan `TotalExpense(M)` vs `TotalExpense(M-1)` (menghitung delta persen jika `M-1 > 0`).
   - **Kategori Pengeluaran Terbesar**: kategori dengan proporsi tertinggi terhadap `TotalExpense(M)`.
   - **Kesehatan Rasio Tabungan**: klasifikasi berbasis `SavingsRate(M)` (`>= 20%` sehat, `0..19.9%` tipis, `< 0%` defisit, `null` belum ada pemasukan).
   - **Peringatan Anggaran Kritis**: jumlah kategori berstatus `'exceeded'` dan `'warning'` bulan berjalan.
   - **Progres Target Terdekat**: target aktif dengan persentase tertinggi atau yang memiliki tenggat terdekat.
3. Seluruh teks wawasan dirakit di klien dari templat terstruktur Bahasa Indonesia tanpa memanggil API LLM eksternal.

---

## 7. Ekspor Backup JSON (*Backup Flow*)

```mermaid
sequenceDiagram
    participant U as Pengguna
    participant UI as BackupPage
    participant SVC as backupService
    participant DB as FinoraDB
    participant WC as Web Crypto API

    U->>UI: Klik Buat Backup JSON
    UI->>SVC: exportBackupJson()
    SVC->>DB: transaction r (semua 7 tabel)
    DB-->>SVC: Snapshot konsisten seluruh tabel
    SVC->>SVC: Susun BackupPayloadV1 & canonical JSON stringify
    SVC->>WC: crypto.subtle.digest SHA-256 atas UTF-8 bytes payload
    WC-->>SVC: Hex digest 64 char
    SVC->>SVC: Bungkus BackupEnvelopeV1 (version, exportedAt, checksum, payload)
    SVC->>DB: Update appSettings.lastBackupAt = exportedAt
    SVC-->>UI: Blob JSON + nama file finora-backup-YYYY-MM-DD-HHmm.json
    UI-->>U: Browser mengunduh file lokal
```

---

## 8. Pemulihan Backup JSON (*Restore Flow*)

```mermaid
flowchart TD
    F["Pilih File .json"] --> SIZE{"Ukuran <= 25 MB & ekstensi .json?"}
    SIZE -- Tidak --> ERR1["Tolak: File terlalu besar atau format salah"]
    SIZE -- Ya --> PARSE["JSON.parse + Strip Prototype Keys + Zod Strict Validation"]
    PARSE -- Gagal --> ERR2["Tolak: Struktur JSON tidak valid"]
    PARSE -- Lolos --> VER{"backupFormatVersion <= 1 & SHA-256 Checksum Cocok?"}
    VER -- Tidak --> ERR3["Tolak: Versi tidak didukung atau Checksum korup"]
    VER -- Ya --> PREV["Tampilkan Restore Preview: Jumlah Record, Rentang Tanggal, Konflik"]
    PREV --> MODE{"Pilih Mode Restore"}
    MODE -- "Replace All" --> CONF["Ketik TIMPA"]
    CONF --> TX_REP["Dexie rw Transaction: clear 7 tabel lalu bulkAdd seluruh payload"]
    MODE -- "Merge" --> STRAT["Pilih Strategi Bentrok: Skip atau Overwrite"]
    STRAT --> TX_MRG["Dexie rw Transaction: merge ID & selesaikan unik categoryId+month"]
    TX_REP --> DONE["Revalidate UI + Toast Sukses"]
    TX_MRG --> DONE
```

---

## 9. Ekspor Laporan CSV (*CSV Export Flow*)

1. Pengguna memilih rentang tanggal dan filter pada halaman `/reports`, lalu menekan **Ekspor CSV**.
2. `exportService.buildTransactionsCsv(transactions, categoryMap)` memetakan setiap record menjadi baris dengan urutan kolom tetap:
   `Tanggal,Tipe,Kategori,Metode Pembayaran,Catatan,Nominal (IDR)`.
3. Setiap nilai string (`Kategori`, `Catatan`) melewati `sanitizeCsvCell(value)`:
   - Jika karakter pertama adalah `=`, `+`, `-`, `@`, `\t`, atau `\r`, tambahkan prefiks `'` (`SEC-006`).
   - Bungkus dengan tanda kutip ganda `"` dan gandakan kutip ganda di dalamnya (`""`) sesuai RFC 4180.
4. Gabungkan baris dengan `\r\n`, awali dengan UTF-8 BOM (`\uFEFF`) agar Microsoft Excel di Windows Indonesia membaca karakter dan pemisah kolom dengan benar.
5. Buat `Blob` bertipe `text/csv;charset=utf-8` dan picu unduhan lokal `finora-laporan-YYYY-MM-DD.csv` tanpa komunikasi jaringan.
