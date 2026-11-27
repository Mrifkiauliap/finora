# Business Rules & Financial Formulas — Finora

**Versi Dokumen**: 1.0.0  
**Status**: Single Source of Truth (SSOT) untuk seluruh logika domain dan kalkulasi keuangan Finora.  
**Dokumen Terkait**: [REQUIREMENTS.md](./REQUIREMENTS.md) | [DATA_DICTIONARY.md](../03-architecture/DATA_DICTIONARY.md) | [TEST_CASES.md](../08-testing/TEST_CASES.md)

---

## Ringkasan Daftar Aturan (`RULE-001` – `RULE-020`)

| ID | Kategori Aturan | Ringkasan |
|---|---|---|
| `RULE-001` | Mata Uang & Presisi | IDR tunggal, nominal integer aman (`1..999_999_999_999`), format `id-ID` |
| `RULE-002` | Pemasukan & Pengeluaran | Penjumlahan terpisah berdasarkan `type` dalam periode `P` |
| `RULE-003` | Arus Kas Bersih (*Net Cashflow*) | `TotalIncome(P) - TotalExpense(P)` per periode |
| `RULE-004` | Saldo Bersih (*Net Balance*) | Akumulasi seluruh waktu `TotalIncome(all) - TotalExpense(all)` |
| `RULE-005` | Rasio Tabungan (*Savings Rate*) | Persentase tabungan periode; `null` (`"—"`) jika pemasukan = 0 |
| `RULE-006` | Validasi Transaksi | Batasan tipe, nominal positif, kategori cocok tipe, panjang catatan |
| `RULE-007` | Penanganan Metode Pembayaran | Enum tertutup 6 nilai standar tanpa saldo per metode di MVP |
| `RULE-008` | Cakupan & Keunikan Anggaran | Khusus kategori `expense`, 1 budget per `(categoryId, month)` |
| `RULE-009` | Realisasi & Sisa Anggaran | `BudgetSpent`, `BudgetRemaining`, dan `BudgetUtilizationPct` |
| `RULE-010` | Ambang Peringatan Anggaran | Klasifikasi status `safe`, `warning`, `exceeded` berbasis `warningThresholdPct` |
| `RULE-011` | Penyalinan Anggaran Antar-Bulan | Salin selektif dari bulan sebelumnya tanpa menimpa budget eksisting |
| `RULE-012` | Representasi Tanggal Bisnis | String `YYYY-MM-DD` lokal bebas pergeseran zona waktu |
| `RULE-013` | Timestamp Audit Sistem | String ISO 8601 UTC `...Z` untuk `createdAt`, `updatedAt`, `exportedAt` |
| `RULE-014` | Penjadwalan Transaksi Berulang | Frekuensi `daily/weekly/monthly/yearly`, `interval >= 1`, *end-of-month clamping* |
| `RULE-015` | Idempotensi Materialisasi | Kunci unik `(recurringRuleId, recurringOccurrenceDate)` mencegah duplikasi |
| `RULE-016` | Batas Catch-up & Siklus Aturan | Maksimal 366 occurrence per eksekusi; nonaktif/hapus tidak hapus histori |
| `RULE-017` | Prinsip Anti-Double Counting Target | Kontribusi target dicatat di `goalContributions`, BUKAN transaksi `expense` |
| `RULE-018` | Kalkulasi Saldo Tersedia & Target | `AvailableBalance`, `GoalProgressPct`, `RemainingTarget`, `RequiredMonthlySaving` |
| `RULE-019` | Keunikan & Seeding Kategori | Nama unik case-insensitive per tipe; 13 kategori sistem; proteksi fallback `Lainnya` |
| `RULE-020` | Integritas Hapus & Reassign Kategori | Wajib *soft-archive* atau *reassignment* atomik bila masih direferensikan |

---

## 1. Mata Uang, Nominal & Agregasi Dasar

### RULE-001 — Mata Uang Default & Nominal Integer Aman
- **Ketentuan**:
  1. Pada rilis MVP v1.0, seluruh entitas keuangan menggunakan mata uang tunggal **Indonesian Rupiah (`IDR`)** dengan locale tampilan `id-ID`.
  2. Seluruh nominal uang (`transactions.amount`, `budgets.limitAmount`, `financialGoals.targetAmount`, `financialGoals.currentAmount`, `goalContributions.amount`, `recurringTransactions.amount`) wajib berupa **bilangan bulat aman JavaScript** (`Number.isSafeInteger(value)`). Tidak ada angka desimal/sen.
  3. Batas nominal transaksi, anggaran, target, dan aturan berulang positif: `1 <= amount <= 999_999_999_999` (Rp 1 hingga Rp 999.999.999.999).
  4. Nominal `transactions.amount` dan `recurringTransactions.amount` **selalu bernilai positif (`> 0`)**. Tanda minus atau plus pada laporan ditentukan oleh field `type` (`'income'` atau `'expense'`).
  5. Pemformatan tampilan wajib menggunakan:
     ```ts
     new Intl.NumberFormat('id-ID', {
       style: 'currency',
       currency: 'IDR',
       maximumFractionDigits: 0,
     }).format(amount)
     ```
     Nilai negatif (misalnya `NetBalance < 0` atau `BudgetRemaining < 0`) diformat eksplisit dengan tanda minus di depan (`-Rp 50.000`).

### RULE-002 — Kalkulasi Total Pemasukan dan Pengeluaran Periode
Untuk sembarang periode kalender $P = [\text{startDate}, \text{endDate}]$ inklusif (berdasarkan perbandingan string leksikografis `YYYY-MM-DD`):

$$\text{TotalIncome}(P) = \sum \{ t.\text{amount} \mid t \in \text{transactions},\ t.\text{type} = \text{'income'},\ \text{startDate} \le t.\text{date} \le \text{endDate} \}$$

$$\text{TotalExpense}(P) = \sum \{ t.\text{amount} \mid t \in \text{transactions},\ t.\text{type} = \text{'expense'},\ \text{startDate} \le t.\text{date} \le \text{endDate} \}$$

- Apabila himpunan kosong, hasil penjumlahan adalah `0`.

### RULE-003 — Kalkulasi Arus Kas Bersih (*Net Cashflow*)
$$\text{NetCashflow}(P) = \text{TotalIncome}(P) - \text{TotalExpense}(P)$$

- Nilai positif berarti surplus pada periode $P$; nilai negatif berarti defisit pada periode $P$.

### RULE-004 — Kalkulasi Saldo Bersih (*Net Balance*)
$$\text{NetBalance} = \sum \{ t.\text{amount} \mid t.\text{type} = \text{'income'} \} - \sum \{ t.\text{amount} \mid t.\text{type} = \text{'expense'} \}$$

- `NetBalance` dihitung dari **seluruh transaksi sepanjang waktu** (termasuk transaksi bertanggal masa depan jika pengguna mencatatnya secara eksplisit, meskipun *default filter* analitik menggunakan rentang hingga bulan berjalan; transaksi bertanggal masa depan tetap ditandai jelas di daftar).
- `NetBalance` diperbolehkan bernilai negatif apabila pengeluaran yang tercatat lebih besar daripada pemasukan yang tercatat (misal pengguna mulai mencatat pengeluaran sebelum memasukkan saldo awal sebagai transaksi pemasukan).

### RULE-005 — Kalkulasi Rasio Tabungan (*Savings Rate*)
$$\text{SavingsRate}(P) = \begin{cases} \text{null} & \text{jika } \text{TotalIncome}(P) = 0 \\ \text{round}_1\left(\frac{\text{TotalIncome}(P) - \text{TotalExpense}(P)}{\text{TotalIncome}(P)} \times 100\right) & \text{jika } \text{TotalIncome}(P) > 0 \end{cases}$$

- $\text{round}_1(x) = \text{Math.round}(x \times 10) / 10$ (pembulatan 1 angka di belakang koma).
- Ketika $\text{TotalIncome}(P) = 0$, sistem **dilarang** menampilkan `0%`, `NaN`, atau `-Infinity`; antarmuka wajib menampilkan `"—"` dengan keterangan *"Belum ada pemasukan pada periode ini"*.
- Ketika $\text{TotalExpense}(P) > \text{TotalIncome}(P) > 0$, `SavingsRate` bernilai negatif (misal `-25,0%`) untuk menunjukkan defisit secara jujur.

---

## 2. Validasi Transaksi & Metode Pembayaran

### RULE-006 — Aturan Validasi Transaksi
1. `type` harus `'income'` atau `'expense'`.
2. `amount` harus integer `1 <= amount <= 999_999_999_999`.
3. `categoryId` wajib merujuk ke record di tabel `categories` yang benar-benar ada dan memiliki `category.type === transaction.type`.
4. Kategori yang sudah diarsipkan (`isArchived === true`) **dilarang** dipilih untuk transaksi baru, tetapi transaksi lama tetap valid saat hanya mengubah catatan/nominal tanpa mengganti kategori (atau pengguna dapat memindahkannya ke kategori aktif lain).
5. `date` wajib berupa tanggal kalender Gregorian yang benar-benar ada dalam format `YYYY-MM-DD` (misal `2026-02-30` wajib ditolak).
6. `note` di-trim spasi ujungnya dan maksimal `500` karakter.

### RULE-007 — Metode Pembayaran (*Payment Method*)
- `paymentMethod` menerima tepat satu dari enam nilai enum: `'cash' | 'bank_transfer' | 'e_wallet' | 'debit_card' | 'credit_card' | 'other'`.
- Label UI Bahasa Indonesia kanonik:
  - `'cash'` → `"Tunai"`
  - `'bank_transfer'` → `"Transfer Bank"`
  - `'e_wallet'` → `"E-Wallet / QRIS"`
  - `'debit_card'` → `"Kartu Debit"`
  - `'credit_card'` → `"Kartu Kredit"`
  - `'other'` → `"Lainnya"`
- Pada MVP, metode pembayaran berfungsi sebagai atribut klasifikasi/filter transaksi, bukan entitas dompet bersaldo terpisah.

---

## 3. Aturan Anggaran Bulanan (*Budgets*)

### RULE-008 — Cakupan dan Keunikan Anggaran
1. Anggaran hanya dapat dibuat untuk kategori dengan `category.type === 'expense'` dan `category.isArchived === false`.
2. Periode anggaran menggunakan format bulan kalender `YYYY-MM` (contoh: `'2026-11'`).
3. Terdapat maksimal **satu** record anggaran untuk setiap pasangan unik `(categoryId, month)`.
4. `limitAmount` wajib integer `1 <= limitAmount <= 999_999_999_999`.
5. `warningThresholdPct` wajib integer dengan rentang `50 <= warningThresholdPct <= 95`, nilai default `80`.

### RULE-009 — Kalkulasi Realisasi, Sisa, dan Utilisasi Anggaran
Untuk kategori pengeluaran $c$ dan bulan $m$ (`YYYY-MM`):

$$\text{BudgetSpent}(c, m) = \sum \{ t.\text{amount} \mid t \in \text{transactions},\ t.\text{type} = \text{'expense'},\ t.\text{categoryId} = c,\ t.\text{date.startsWith}(m) \}$$

$$\text{BudgetRemaining}(c, m) = \text{budget.limitAmount} - \text{BudgetSpent}(c, m)$$

$$\text{BudgetUtilizationPct}(c, m) = \text{round}_1\left(\frac{\text{BudgetSpent}(c, m)}{\text{budget.limitAmount}} \times 100\right)$$

- Nilai `BudgetRemaining < 0` menandakan nominal *over-budget* sebesar $|\text{BudgetRemaining}|$.
- Untuk lebar visual progress bar CSS, nilai persentase dijepit (*clamped*) pada `[0, 100]`, sementara label teks persentase tetap menampilkan angka aktual (misal `115,4%`).

### RULE-010 — Evaluasi Status Ambang Batas Anggaran
Berdasarkan `utilizationPct = BudgetUtilizationPct(c, m)` dan `threshold = budget.warningThresholdPct`:

$$\text{BudgetStatus} = \begin{cases} \text{'safe'} & \text{jika } \text{utilizationPct} < \text{threshold} \\ \text{'warning'} & \text{jika } \text{threshold} \le \text{utilizationPct} \le 100 \\ \text{'exceeded'} & \text{jika } \text{utilizationPct} > 100 \end{cases}$$

- Catatan batas tepat: pada `utilizationPct === threshold` (misal tepat `80,0%`), status sudah menjadi `'warning'`. Pada `utilizationPct === 100,0%`, status masih `'warning'` (batas tepat terpenuhi); status menjadi `'exceeded'` segera setelah `BudgetSpent > limitAmount` (misal `100,1%` atau perbandingan eksak `BudgetSpent > limitAmount` agar tidak gagal karena pembulatan `round_1`).
- **Aturan Presisi Batas Eksak**: Untuk menghindari kasus di mana `limitAmount = 1_000_000_000` dan `spent = 1_000_000_001` terbulatkan menjadi `100.0%`, evaluasi `'exceeded'` menggunakan kondisi eksak `BudgetSpent(c, m) > limitAmount`, sedangkan `'warning'` menggunakan `(BudgetSpent(c, m) * 100) >= (limitAmount * warningThresholdPct) && BudgetSpent(c, m) <= limitAmount`.

### RULE-011 — Penyalinan Anggaran dari Bulan Sebelumnya
- Aksi "Salin dari Bulan Lalu" pada bulan $m$ membaca seluruh anggaran pada bulan $m - 1$.
- Hanya kategori yang **masih aktif** (`isArchived === false`) dan **belum memiliki record anggaran di bulan $m$** yang disalin.
- Anggaran yang sudah ada di bulan $m$ tidak boleh ditimpa atau dihapus oleh aksi salin ini.

---

## 4. Penanganan Tanggal & Transaksi Berulang

### RULE-012 — Tanggal Kalender Lokal (`YYYY-MM-DD`)
- Seluruh tanggal bisnis (`transactions.date`, `financialGoals.deadline`, `goalContributions.date`, `recurringTransactions.startDate/endDate/nextRunDate/lastGeneratedDate`) disimpan sebagai string `YYYY-MM-DD`.
- Pengambilan tanggal "hari ini" (*today*) wajib memakai fungsi kalender lokal perangkat (`format(new Date(), 'yyyy-MM-dd')` via `date-fns`), **BUKAN** `new Date().toISOString().slice(0, 10)` yang mengonversi ke UTC dan berisiko mundur 1 hari pada pukul 00:00–06:59 WIB (`UTC+7`).

### RULE-013 — Timestamp Audit Sistem (ISO 8601 UTC)
- Field audit `createdAt`, `updatedAt`, `exportedAt`, dan `lastBackupAt` wajib menggunakan `new Date().toISOString()` (`YYYY-MM-DDTHH:mm:ss.sssZ`).

### RULE-014 — Penjadwalan & End-of-Month Clamping Transaksi Berulang
- Frekuensi valid: `'daily' | 'weekly' | 'monthly' | 'yearly'`, dengan `interval` integer `1..365`.
- Pada frekuensi `'monthly'`:
  - Aturan menyimpan `anchorDay` (integer `1..31`, default dari komponen hari `startDate`).
  - Tanggal occurrence ke-$k$ pada bulan target $(Y, M)$ dihitung sebagai:
    $$\text{occurrenceDay} = \min(\text{anchorDay},\ \text{daysInMonth}(Y, M))$$
  - Contoh: `anchorDay = 31`, `startDate = 2026-01-31`, `interval = 1` → Februari `2026-02-28` (bukan 2026-03-03!), Maret `2026-03-31`, April `2026-04-30`, Mei `2026-05-31`.
- Pada frekuensi `'yearly'`:
  - Jika `startDate` adalah `29 Februari` tahun kabisat, pada tahun non-kabisat dijepit ke `28 Februari`, lalu kembali ke `29 Februari` pada tahun kabisat berikutnya.

### RULE-015 — Idempotensi Materialisasi Transaksi Berulang
- Sebelum menyisipkan transaksi hasil aturan berulang untuk tanggal `occDate`, sistem wajib memeriksa indeks `[recurringRuleId+recurringOccurrenceDate]` di tabel `transactions`.
- Jika record dengan pasangan `(rule.id, occDate)` sudah ada, penyisipan dilewati (*skip*) namun pointer `nextRunDate` tetap dimajukan agar aturan tidak macet.
- Penyisipan transaksi + pembaruan `nextRunDate` dan `lastGeneratedDate` dilakukan dalam satu transaksi Dexie `db.transaction('rw', ...)`.

### RULE-016 — Batas Catch-Up dan Siklus Hidup Aturan Berulang
- Materialisasi dijalankan secara *opportunistic* saat inisialisasi aplikasi dan setiap kali rute `/` atau `/recurring` dibuka, untuk seluruh aturan dengan `isActive === true` dan `nextRunDate <= today`.
- Jika `endDate !== null` dan `nextRunDate > endDate`, aturan tidak lagi menghasilkan transaksi dan `isActive` otomatis diubah menjadi `false`.
- **Batas Keamanan Catch-Up**: Maksimal **366** transaksi yang dimaterialisasikan per aturan dalam satu kali pemanggilan fungsi agar tidak membekukan thread UI bila pengguna memasukkan `startDate` puluhan tahun lalu. Jika batas tercapai, sistem berhenti di occurrence ke-366 dan memberi informasi ke pengguna.
- Mengedit, menjeda (`isActive = false`), atau menghapus aturan `recurringTransactions` **tidak boleh** mengubah atau menghapus record `transactions` yang sudah terlanjur terbentuk di masa lalu (hanya mengset `recurringRuleId` tetap sebagai teks histori atau null-safe saat ditampilkan).

---

## 5. Target Keuangan (*Financial Goals*) & Anti-Double Counting

### RULE-017 — Prinsip Anti-Double Counting pada Kontribusi Target
- Menyisihkan uang ke target tabungan (misal "Dana Darurat") adalah pemindahan alokasi internal kepemilikan pengguna, **bukan konsumsi/pengeluaran uang**.
- Oleh karena itu, setoran dan penarikan target hanya dicatat di tabel `goalContributions` dan memperbarui `financialGoals.currentAmount`, **tanpa** membuat baris di tabel `transactions`.
- Konsekuensinya:
  - `TotalExpense` tetap mencerminkan pengeluaran riil murni.
  - `NetBalance` tetap mencerminkan total uang kas yang dimiliki pengguna.
  - `AvailableBalance` berkurang sesuai total uang yang telah dikunci ke target.

### RULE-018 — Rumus Saldo Tersedia & Metrik Target Keuangan
1. **Invarian `currentAmount`**:
   $$\text{goal.currentAmount} = \sum \{ g.\text{amount} \mid g \in \text{goalContributions},\ g.\text{goalId} = \text{goal.id} \}$$
   Operasi setor (`delta > 0`) dan tarik (`delta < 0`) wajib dieksekusi dalam transaksi Dexie atomik dan menolak setiap penarikan yang menyebabkan `currentAmount + delta < 0`.
2. **Total Dana Teralokasi & Saldo Tersedia**:
   $$\text{TotalAllocatedSavings} = \sum \{ \text{goal.currentAmount} \mid \text{goal.status} \in \{\text{'active'}, \text{'completed'}\} \}$$
   $$\text{AvailableBalance} = \text{NetBalance} - \text{TotalAllocatedSavings}$$
   *(Target berstatus `'paused'` tetap menghitung `currentAmount`-nya ke `TotalAllocatedSavings` apabila masih menahan dana; **keputusan kanonik MVP**: seluruh `goal.currentAmount > 0` dari target `'active'`, `'completed'`, maupun `'paused'` tetap dihitung sebagai dana teralokasi selama belum ditarik atau target dihapus, agar `AvailableBalance` tidak tiba-tiba menggelembung hanya karena target di-pause).*
   - **Revisi/Penegasan Rumus Eksak**:
     $$\text{TotalAllocatedSavings} = \sum \{ \text{goal.currentAmount} \mid \text{goal} \in \text{financialGoals} \}$$
     *(Selama dana masih tercatat pada `goal.currentAmount`, dana tersebut masih teralokasi).*
3. **Progres & Sisa Target**:
   $$\text{GoalProgressPct} = \min\left(100,\ \text{round}_1\left(\frac{\text{goal.currentAmount}}{\text{goal.targetAmount}} \times 100\right)\right)$$
   $$\text{RemainingTarget} = \max(0,\ \text{goal.targetAmount} - \text{goal.currentAmount})$$
4. **Estimasi Kebutuhan Tabungan Bulanan** (hanya jika `goal.deadline !== null` dan `RemainingTarget > 0`):
   $$\text{remainingDays} = \max(1,\ \text{differenceInCalendarDays}(\text{goal.deadline},\ \text{today}))$$
   $$\text{remainingMonths} = \max(1,\ \lceil \text{remainingDays} / 30 \rceil)$$
   $$\text{RequiredMonthlySaving} = \lceil \text{RemainingTarget} / \text{remainingMonths} \rceil$$
   Jika `deadline < today` dan `RemainingTarget > 0`, UI tetap menampilkan estimasi dengan `remainingMonths = 1` disertai badge status `"Melewati Tenggat"`.
5. **Status Otomatis Target**: Jika setoran membuat `currentAmount >= targetAmount`, `status` otomatis menjadi `'completed'`. Jika setelah itu dilakukan penarikan sehingga `currentAmount < targetAmount`, `status` otomatis kembali ke `'active'`.

---

## 6. Kategori & Integritas Referensi

### RULE-019 — Keunikan Nama & Seeding Kategori Sistem
1. Nama kategori (1..50 karakter setelah trim) harus unik secara *case-insensitive* (`name.trim().toLowerCase()`) di dalam tipe yang sama (`'income'` atau `'expense'`). Nama yang sama diperbolehkan muncul sekali di `income` dan sekali di `expense` (contoh: `"Lainnya"`).
2. Pada inisialisasi pertama (`UC-001`), sistem menyisipkan tepat **13 kategori sistem** (`isSystem: true`, `isArchived: false`):
   - **Pemasukan (5)**: `Gaji` (`cat-sys-salary`), `Freelance / Proyek` (`cat-sys-freelance`), `Bonus & Hadiah` (`cat-sys-bonus`), `Hasil Investasi` (`cat-sys-investment`), `Lainnya` (`cat-sys-other-income`).
   - **Pengeluaran (8)**: `Makanan & Minuman` (`cat-sys-food`), `Transportasi` (`cat-sys-transport`), `Tagihan & Utilitas` (`cat-sys-bills`), `Belanja` (`cat-sys-shopping`), `Hiburan` (`cat-sys-entertainment`), `Kesehatan` (`cat-sys-health`), `Pendidikan` (`cat-sys-education`), `Lainnya` (`cat-sys-other-expense`).
3. Kategori sistem fallback `cat-sys-other-income` dan `cat-sys-other-expense` bersifat dilindungi: **tidak boleh dihapus dan tidak boleh diarsipkan**. Kategori sistem lainnya boleh diarsipkan (`isArchived = true`) atau diubah ikon/warnanya oleh pengguna, namun tidak dianjurkan dihapus jika masih direferensikan.

### RULE-020 — Penghapusan Kategori Aman (*Archive vs Reassignment*)
Saat pengguna hendak menghapus kategori `C_src`:
1. Sistem menghitung referensi `C_src` di `transactions`, `budgets`, dan `recurringTransactions`.
2. Jika `totalRefs === 0` dan `C_src.id` bukan kategori fallback sistem, kategori dapat langsung dihapus.
3. Jika `totalRefs > 0`, penghapusan langsung **diblokir**. Pengguna wajib memilih:
   - **Opsi A (Soft-Archive)**: Set `C_src.isArchived = true`. Histori tetap utuh; kategori tidak tampil pada pilihan transaksi/budget baru.
   - **Opsi B (Reassignment & Delete)**: Pengguna memilih kategori target `C_dst` yang aktif dan memiliki `C_dst.type === C_src.type` (`C_dst.id !== C_src.id`). Dalam satu transaksi Dexie atomik:
     - Semua `transactions` ber-`categoryId === C_src.id` diubah menjadi `C_dst.id`.
     - Semua `recurringTransactions` ber-`categoryId === C_src.id` diubah menjadi `C_dst.id`.
     - Untuk setiap `budgets` ber-`categoryId === C_src.id` pada bulan `m`: jika `(C_dst.id, m)` belum ada budget, ubah `categoryId` menjadi `C_dst.id`; jika `(C_dst.id, m)` sudah ada budget, gabungkan atau pertahankan sesuai pilihan eksplisit pengguna (default kanonik: pertahankan budget `C_dst` atau jumlahkan `limitAmount` jika dicentang pengguna, lalu hapus record budget `C_src` untuk mencegah pelanggaran indeks unik `&[categoryId+month]`).
     - Hapus record kategori `C_src`.
