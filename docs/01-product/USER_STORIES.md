# User Stories — Finora

**Versi Dokumen**: 1.0.0  
**Format**: `As a [user], I want [capability], So that [benefit]` dengan Acceptance Criteria `Given / When / Then`.  
**Dokumen Terkait**: [PRD.md](./PRD.md) | [REQUIREMENTS.md](../02-requirements/REQUIREMENTS.md) | [TRACEABILITY.md](../02-requirements/TRACEABILITY.md)

---

## Ringkasan Pengelompokan

- **Dashboard & Onboarding**: `US-001` – `US-002`
- **Transaksi**: `US-003` – `US-006`
- **Kategori**: `US-007` – `US-008`
- **Anggaran Bulanan**: `US-009` – `US-010`
- **Target Keuangan**: `US-011` – `US-012`
- **Transaksi Berulang**: `US-013` – `US-014`
- **Analitik & Laporan**: `US-015` – `US-017`
- **Pengaturan, Privasi, Backup & PWA**: `US-018` – `US-024`

---

## 1. Dashboard & Onboarding

### US-001 — Akses Langsung Tanpa Registrasi
As a **new Finora user**,  
I want **to open the application and immediately start using it without creating an account or logging in**,  
So that **I can record my first transaction right away with zero friction and total privacy**.

- **Acceptance Criteria**:
  - **Given** pengguna mengunjungi Finora untuk pertama kalinya pada browser baru,
  - **When** aplikasi selesai dimuat,
  - **Then** sistem otomatis menginisialisasi basis data lokal `FinoraDB`, mengisi 13 kategori sistem dan pengaturan default, lalu langsung menampilkan halaman Dashboard tanpa layar login atau registrasi.

### US-002 — Melihat Ringkasan Keuangan Bulan Berjalan
As a **daily user**,  
I want **to see my Net Balance, Available Balance, monthly income, monthly expense, savings rate, and budget alerts on the Dashboard**,  
So that **I can understand my current financial health within seconds**.

- **Acceptance Criteria**:
  - **Given** pengguna memiliki transaksi, anggaran aktif, dan target tabungan di IndexedDB,
  - **When** pengguna membuka halaman Dashboard (`/`),
  - **Then** Dashboard menampilkan nilai `NetBalance`, `AvailableBalance`, `TotalIncome(bulan ini)`, `TotalExpense(bulan ini)`, `SavingsRate(bulan ini)` (atau `"—"` jika pemasukan bulan ini 0), daftar kategori anggaran berstatus `warning`/`exceeded`, progres target aktif, dan 5 transaksi terbaru.

---

## 2. Transaksi

### US-003 — Mencatat Transaksi Pemasukan atau Pengeluaran Baru
As a **user**,  
I want **to quickly add a new income or expense transaction with amount in IDR, category, date, payment method, and optional note**,  
So that **my local financial ledger stays accurate and up to date**.

- **Acceptance Criteria**:
  - **Given** pengguna berada di Dashboard atau halaman Transaksi,
  - **When** pengguna membuka formulir tambah transaksi, memilih tipe `expense`, mengisi nominal integer valid `50000`, memilih kategori pengeluaran aktif, memilih tanggal kalender lokal `YYYY-MM-DD`, dan menekan Simpan,
  - **Then** transaksi tersimpan ke tabel `transactions` di IndexedDB, muncul notifikasi sukses singkat, dan seluruh ringkasan saldo/anggaran langsung terhitung ulang.

### US-004 — Mengubah Transaksi yang Sudah Ada
As a **user**,  
I want **to edit the amount, type, category, date, payment method, or note of an existing transaction**,  
So that **I can fix recording mistakes without deleting and re-entering everything**.

- **Acceptance Criteria**:
  - **Given** terdapat transaksi tercatat di halaman `/transactions`,
  - **When** pengguna membuka formulir edit transaksi tersebut, mengubah nominal dari `50000` menjadi `75000`, dan menyimpan,
  - **Then** record transaksi di `FinoraDB` diperbarui beserta timestamp `updatedAt` UTC terbaru, dan seluruh agregasi Dashboard serta Anggaran berubah sesuai selisih nominal baru.

### US-005 — Menghapus Transaksi dengan Perlindungan Konfirmasi
As a **user**,  
I want **to delete an unwanted or duplicate transaction after confirming the action**,  
So that **my financial records remain clean without accidental data loss**.

- **Acceptance Criteria**:
  - **Given** pengguna memilih aksi hapus pada satu transaksi,
  - **When** dialog konfirmasi muncul dan pengguna menekan tombol konfirmasi hapus,
  - **Then** transaksi dihapus dari IndexedDB, dan seluruh saldo serta realisasi anggaran terkait segera disesuaikan.
  - **When** pengguna menekan batal pada dialog konfirmasi,
  - **Then** transaksi tetap utuh tanpa perubahan apa pun.

### US-006 — Mencari dan Menyaring Daftar Transaksi
As a **user with growing transaction history**,  
I want **to search transactions by note/category and filter them by date range, type, category, and payment method**,  
So that **I can easily find specific past expenses or verify monthly spending**.

- **Acceptance Criteria**:
  - **Given** pengguna memiliki puluhan atau ratusan transaksi di halaman `/transactions`,
  - **When** pengguna mengetik kata kunci `"kopi"`, memilih tipe `expense`, dan memilih rentang tanggal bulan ini,
  - **Then** daftar hanya menampilkan transaksi pengeluaran di rentang tersebut yang catatan atau nama kategorinya cocok (case-insensitive), disertai total subtotal pemasukan/pengeluaran untuk hasil filter aktif.

---

## 3. Kategori

### US-007 — Menambah dan Mengubah Kategori Kustom
As a **user with personal spending habits**,  
I want **to create and customize my own income or expense categories with a name, icon, and color**,  
So that **my transaction classification matches my real lifestyle**.

- **Acceptance Criteria**:
  - **Given** pengguna berada di halaman `/categories`,
  - **When** pengguna menambahkan kategori baru bertipe `expense` bernama `"Hobi & Buku"` (belum ada di tipe yang sama) dengan ikon dan warna valid,
  - **Then** kategori tersimpan di tabel `categories` dan langsung tersedia di dropdown formulir transaksi pengeluaran.
  - **When** pengguna memasukkan nama yang sama (case-insensitive setelah trim) dalam tipe yang sama,
  - **Then** sistem menolak penyimpanan dan menampilkan pesan validasi di bawah field nama.

### US-008 — Mengarsipkan atau Menghapus Kategori Secara Aman
As a **user cleaning up unused categories**,  
I want **to archive a category or reassign its transactions before deleting it**,  
So that **my historical transactions never lose their category reference**.

- **Acceptance Criteria**:
  - **Given** kategori kustom `"Langganan Lama"` masih memiliki 5 transaksi historis,
  - **When** pengguna memilih menghapus kategori tersebut,
  - **Then** sistem mencegah penghapusan langsung dan meminta pengguna memilih untuk **Arsipkan** (`isArchived = true`) atau **Pindahkan ke kategori lain** bertipe sama (`reassignment`) sebelum record kategori dihapus secara atomik.

---

## 4. Anggaran Bulanan

### US-009 — Menetapkan dan Menyalin Anggaran Bulanan
As a **budget-conscious user**,  
I want **to set a monthly spending limit for each expense category and optionally copy last month's budgets**,  
So that **I can plan my monthly spending limits quickly without repetitive setup**.

- **Acceptance Criteria**:
  - **Given** pengguna berada di halaman `/budgets` untuk bulan `2026-11`,
  - **When** pengguna menetapkan batas `Rp 1.500.000` dan ambang peringatan `80%` untuk kategori `Makanan & Minuman`,
  - **Then** anggaran tersimpan dengan kunci unik `(categoryId, '2026-11')` dan langsung menghitung realisasi dari transaksi pengeluaran bulan `2026-11`.
  - **When** pengguna menekan tombol "Salin dari Bulan Lalu" dan terdapat budget di `2026-10` yang belum ada di `2026-11`,
  - **Then** anggaran tersebut disalin ke `2026-11` tanpa menimpa anggaran yang sudah dibuat sebelumnya.

### US-010 — Menerima Peringatan Visual Mendekati dan Melebihi Anggaran
As a **user tracking spending discipline**,  
I want **to see clear visual status indicators (Safe, Warning, Exceeded) when my category spending approaches or exceeds its limit**,  
So that **I can adjust my spending behavior before the month ends**.

- **Acceptance Criteria**:
  - **Given** kategori `Belanja` memiliki `limitAmount = 1000000` dan `warningThresholdPct = 80`,
  - **When** total pengeluaran kategori tersebut di bulan aktif adalah `799000` (`79,9%`), status ditampilkan sebagai `safe` (hijau).
  - **When** total pengeluaran mencapai `800000` (`80,0%`) hingga `1000000` (`100,0%`), status berubah menjadi `warning` (amber).
  - **When** total pengeluaran mencapai `1050000` (`105,0%`), status berubah menjadi `exceeded` (merah) dan menampilkan sisa `-Rp 50.000` (*over-budget*).

---

## 5. Target Keuangan

### US-011 — Membuat Target Keuangan dengan Estimasi Bulanan
As a **goal-oriented saver**,  
I want **to create a financial goal with a target amount and optional deadline**,  
So that **I know how much I need to set aside each month to achieve it on time**.

- **Acceptance Criteria**:
  - **Given** pengguna membuka halaman `/goals`,
  - **When** pengguna membuat target `"Dana Darurat"` dengan `targetAmount = 12000000` dan `deadline = 6 bulan dari sekarang`,
  - **Then** target tersimpan dengan `currentAmount = 0`, `status = 'active'`, dan kartu target menampilkan `RequiredMonthlySaving` yang dihitung sesuai rumus kalender.

### US-012 — Menyetor dan Menarik Alokasi Target Tanpa Mengacaukan Pengeluaran
As a **user managing both spending and savings**,  
I want **to record contributions or withdrawals for a financial goal separately from expense transactions**,  
So that **saving money does not falsely inflate my monthly expenses**.

- **Acceptance Criteria**:
  - **Given** pengguna memiliki `NetBalance = 10000000`, `TotalExpense(bulan ini) = 2000000`, dan target aktif `"Dana Darurat"` ber-`currentAmount = 1000000`,
  - **When** pengguna mencatat setoran kontribusi sebesar `1500000` ke target tersebut,
  - **Then** `goal.currentAmount` bertambah menjadi `2500000`, `AvailableBalance` berkurang `1500000`, sedangkan `TotalExpense(bulan ini)` tetap `2000000`.
  - **When** pengguna mencoba menarik `3000000` (melebihi `currentAmount = 2500000`),
  - **Then** sistem menolak penarikan dengan pesan validasi yang jelas.

---

## 6. Transaksi Berulang

### US-013 — Membuat Aturan Transaksi Berulang
As a **user with regular bills or salary**,  
I want **to define recurring income or expense rules (daily, weekly, monthly, yearly)**,  
So that **I do not have to manually re-enter routine transactions every cycle**.

- **Acceptance Criteria**:
  - **Given** pengguna membuka halaman `/recurring`,
  - **When** pengguna membuat aturan pengeluaran bulanan `"Sewa Kos"` sebesar `1500000` dengan `anchorDay = 31` dan `startDate = 2026-01-31`,
  - **Then** aturan tersimpan aktif, jadwal Februari akan terjepit (*clamped*) ke `2026-02-28`, dan jadwal Maret kembali ke `2026-03-31`.

### US-014 — Materialisasi Lokal Idempoten Saat Membuka Aplikasi
As a **local-first user**,  
I want **due recurring transactions to be generated automatically when I open the app without creating duplicates**,  
So that **my ledger stays accurate even without a background server**.

- **Acceptance Criteria**:
  - **Given** terdapat aturan aktif dengan `nextRunDate <= today`,
  - **When** pengguna membuka aplikasi atau menyegarkan halaman berkali-kali pada hari yang sama,
  - **Then** sistem membuat transaksi jatuh tempo tepat satu kali untuk setiap pasangan `(recurringRuleId, recurringOccurrenceDate)` dan memperbarui `nextRunDate` serta `lastGeneratedDate` secara atomik.

---

## 7. Analitik & Laporan

### US-015 — Melihat Grafik Tren dan Komposisi Kategori
As a **user evaluating spending habits**,  
I want **to explore interactive charts of income vs expense trends and expense breakdown by category**,  
So that **I can spot my biggest spending categories and monthly cashflow patterns**.

- **Acceptance Criteria**:
  - **Given** pengguna memiliki transaksi lintas beberapa bulan dan kategori,
  - **When** pengguna membuka halaman `/analytics` dan memilih rentang `6 Bulan Terakhir`,
  - **Then** sistem merender grafik batang/garis Pemasukan vs Pengeluaran per bulan serta grafik Donut komposisi kategori pengeluaran beserta tabel persentasenya.

### US-016 — Membaca Insight Keuangan Berbasis Aturan Lokal
As a **user seeking actionable clarity**,  
I want **to see deterministic, locally computed financial insights (such as top spending category and month-over-month spending change)**,  
So that **I get helpful takeaways without sending my data to external AI servers**.

- **Acceptance Criteria**:
  - **Given** pengguna memiliki data transaksi bulan ini dan bulan lalu di IndexedDB,
  - **When** halaman `/analytics` dimuat,
  - **Then** sistem menampilkan kartu ringkasan insight yang dihitung 100% secara deterministik di perangkat (misal persentase kenaikan/penurunan pengeluaran dibanding bulan lalu dan kategori terbesar) tanpa panggilan jaringan eksternal.

### US-017 — Mengekspor Laporan Transaksi ke Format CSV
As a **user needing external record-keeping**,  
I want **to export filtered transactions and summary reports as a CSV file**,  
So that **I can open or archive them in spreadsheet applications like Excel or Google Sheets**.

- **Acceptance Criteria**:
  - **Given** pengguna berada di halaman `/reports` dengan filter rentang tanggal terpilih,
  - **When** pengguna menekan tombol **Ekspor CSV**,
  - **Then** browser mengunduh berkas `.csv` ber-encoding UTF-8 BOM yang memuat kolom tanggal, tipe, kategori, metode pembayaran, catatan (terlindung dari *CSV formula injection*), dan nominal, sesuai hasil filter aktif.

---

## 8. Pengaturan, Privasi, Backup & PWA

### US-018 — Mengganti Tema Gelap dan Terang
As a **user working in various lighting environments**,  
I want **to switch between Dark Mode (default), Light Mode, and System theme preference**,  
So that **the interface remains comfortable to read day and night**.

- **Acceptance Criteria**:
  - **Given** pengguna membuka halaman `/settings` atau menekan tombol cepat tema,
  - **When** pengguna memilih `Light`,
  - **Then** antarmuka langsung beralih ke palet Light Mode yang memenuhi kontras WCAG 2.1 AA, dan preferensi tersimpan di `appSettings` sehingga bertahan setelah muat ulang halaman.

### US-019 — Menyamarkan Nominal Saldo di Tempat Umum (*Privacy Mask*)
As a **privacy-conscious user in public spaces**,  
I want **to toggle balance and amount masking with one click**,  
So that **people nearby cannot glance at my financial numbers on screen**.

- **Acceptance Criteria**:
  - **Given** `showBalancesMasked = false`,
  - **When** pengguna menekan ikon mata (*Privacy Toggle*) pada header atau pengaturan,
  - **Then** seluruh nominal sensitif pada Dashboard dan kartu ringkasan disamarkan menjadi placeholder seperti `Rp •••••••` dan statusnya tersimpan di `appSettings`.

### US-020 — Mengekspor Cadangan Data Penuh (Backup JSON)
As a **user responsible for my own local data**,  
I want **to export my entire Finora database as a checksum-verified JSON file**,  
So that **I have a safe portable backup before clearing browser storage or switching devices**.

- **Acceptance Criteria**:
  - **Given** pengguna membuka `/settings/backup`,
  - **When** pengguna menekan tombol **Buat Backup JSON**,
  - **Then** aplikasi mengemas seluruh 7 tabel ke dalam format envelope berversi dengan `checksum.algorithm = 'SHA-256'`, mengunduh berkas `.json`, dan memperbarui `appSettings.lastBackupAt`.

### US-021 — Memulihkan Data dari Backup JSON dengan Pratinjau Aman
As a **user restoring data on a new browser or after data loss**,  
I want **to preview a backup file's validity, contents, and conflicts before choosing Replace or Merge**,  
So that **I never corrupt or overwrite my financial records blindly**.

- **Acceptance Criteria**:
  - **Given** pengguna mengunggah berkas `.json` di `/settings/backup`,
  - **When** berkas valid secara skema Zod dan checksum SHA-256 cocok,
  - **Then** sistem menampilkan pratinjau jumlah record per tabel, tanggal backup, dan jumlah konflik ID/budget; pengguna dapat memilih `Merge` atau `Replace All` (dengan konfirmasi eksplisit mengetik kata kunci konfirmasi).
  - **When** checksum tidak cocok atau struktur JSON rusak/melewati batas ukuran,
  - **Then** sistem menolak pemulihan sebelum mengubah satu pun data di IndexedDB dan menampilkan pesan error yang aman.

### US-022 — Menghapus Seluruh Data Lokal Secara Terkendali
As a **user wanting a fresh start or wiping a shared device**,  
I want **to clear all local Finora data with double confirmation**,  
So that **no personal financial trace remains in that browser**.

- **Acceptance Criteria**:
  - **Given** pengguna berada di `/settings`,
  - **When** pengguna memilih **Hapus Semua Data** dan menyelesaikan dialog konfirmasi ganda,
  - **Then** seluruh record pengguna dihapus dari `FinoraDB` (dengan opsi reset ke kondisi awal ber-kategori default kosong atau bersih total sesuai alur [USE_CASES.md](./USE_CASES.md)).

### US-023 — Memasang Finora sebagai Aplikasi (PWA Install)
As a **mobile or desktop user**,  
I want **to install Finora onto my home screen or desktop as a standalone app**,  
So that **I can launch it like a native personal finance app**.

- **Acceptance Criteria**:
  - **Given** pengguna mengakses Finora melalui browser yang mendukung PWA melalui HTTPS,
  - **When** browser memicu event instalasi (`beforeinstallprompt`) atau pengguna menggunakan menu "Add to Home Screen",
  - **Then** Finora terpasang dengan nama, ikon, warna tema `#0B1220`, dan terbuka dalam mode `standalone`.

### US-024 — Menggunakan Finora Penuh Saat Offline
As a **user traveling or experiencing poor signal**,  
I want **to open the installed Finora app and record, edit, view budgets, and export backups completely offline**,  
So that **my financial tracking never depends on internet availability**.

- **Acceptance Criteria**:
  - **Given** pengguna pernah mengunjungi Finora minimal satu kali sehingga Service Worker dan *application shell* telah ter-cache,
  - **When** perangkat memutus seluruh koneksi jaringan (`navigator.onLine === false`) dan pengguna membuka aplikasi serta menambah transaksi baru,
  - **Then** aplikasi tetap termuat, menampilkan indikator status luring yang halus (non-blocking), menyimpan transaksi ke IndexedDB tanpa error, dan menampilkan halaman `/offline` yang informatif jika pengguna mengakses rute yang belum ter-cache.
