# Page Specifications — Finora

**Versi Dokumen**: 1.1.0  
**Cakupan**: Spesifikasi lengkap 11 halaman inti aplikasi (`/app/*`), 4 halaman publik (`/` – `/privacy`), dan 1 halaman fallback offline PWA (`/offline`).  
**Dokumen Terkait**: [LANDING_PAGE.md](./LANDING_PAGE.md) | [PUBLIC_ROUTES.md](./PUBLIC_ROUTES.md) | [LAYOUTS.md](./LAYOUTS.md) | [COMPONENTS.md](./COMPONENTS.md) | [API_DESIGN.md](../03-architecture/API_DESIGN.md) | [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md)

---

## Daftar Rute Kanonik

### A. Rute Website Publik (Tanpa IndexedDB — lihat [LANDING_PAGE.md](./LANDING_PAGE.md) & [PUBLIC_ROUTES.md](./PUBLIC_ROUTES.md))
- `/` — Landing Page
- `/features` — Product Features
- `/about` — About Finora
- `/privacy` — Privacy Policy

### B. Rute Aplikasi Keuangan (`/app/*`)
1. `/app` — Dashboard
2. `/app/transactions` — Transactions
3. `/app/transactions/new` & `/app/transactions/[id]/edit` — Add / Edit Transaction
4. `/app/categories` — Categories
5. `/app/budgets` — Budgets
6. `/app/goals` — Financial Goals
7. `/app/recurring` — Recurring Transactions
8. `/app/analytics` — Analytics
9. `/app/reports` — Reports
10. `/app/settings` — Settings
11. `/app/settings/backup` — Backup & Restore
12. `/offline` — Offline Fallback (PWA)

---

## 1. Dashboard (`/app`)

- **Tujuan**: Memberikan ringkasan kesehatan keuangan instan (saldo tersedia, arus kas bulan berjalan, peringatan anggaran, progres target, dan aktivitas terbaru).
- **Tata Letak**: Mengikuti Grid 12 kolom desktop dan stack prioritas mobile pada [LAYOUTS.md](./LAYOUTS.md). Menyertakan pemilih cepat bulan berjalan di sudut kanan atas (default bulan lokal aktif).
- **Komponen**: `KpiSummaryCard` (Saldo Tersedia & Saldo Bersih, Pemasukan, Pengeluaran, Rasio Tabungan), `ChartContainerCard` (BarChart 6 bulan Recharts), `BudgetProgressCard` ringkas, `GoalProgressCard` ringkas, `TransactionListItem` (5 terbaru), plus banner pengingat backup (`FR-023`) bila memenuhi syarat.
- **Dependensi Data**: `dashboardService.getDashboardSummary(currentMonth)` + `bootstrapService.initializeApp()` (mematerialisasi transaksi berulang jatuh tempo saat mount awal).
- **Interaksi Pengguna**:
  - Klik **"+ Catat Transaksi"** membuka form tambah transaksi.
  - Klik item transaksi mengarah ke edit transaksi.
  - Klik kategori peringatan anggaran menuju `/budgets`.
  - Toggle `PrivacyMaskToggle` menyamarkan seluruh nominal secara instan.
- **Loading State**: Skeleton grid mempertahankan tinggi tetap untuk 4 kartu KPI, blok chart `260px`, dan 5 baris daftar (mencegah CLS).
- **Empty State**: Ketika 0 transaksi tercatat, tampil kartu sambutan ramah *"Mulai Catat Keuanganmu — 100% Lokal & Privat"* dengan CTA **"+ Catat Transaksi Pertama"** dan tautan sekunder **Impor Backup JSON**.
- **Error State**: Jika IndexedDB gagal diakses, tampil `ErrorFallback` dengan penjelasan izin penyimpanan browser dan tombol Muat Ulang.
- **Perilaku Responsif**: 4 KPI bertumpuk menjadi 1 Hero + 2 kartu bersebelahan di mobile; chart menyembunyikan label sumbu Y penuh atau menyingkat `"jt"`/`"rb"` pada layar sempit.

---

## 2. Transactions (`/transactions`)

- **Tujuan**: Mengelola seluruh riwayat transaksi dengan pencarian, penyaringan multi-kriteria, pengurutan, dan ringkasan subtotal hasil filter.
- **Tata Letak**: Header halaman + Baris Filter & Pencarian + Bar Ringkasan Subtotal Filter + Daftar/Tabel Transaksi + Kontrol Paginasi/Muat Lebih Banyak.
- **Komponen**: Search input, Filter chip/popover (Rentang Tanggal/Preset Bulan, Tipe, Kategori, Metode Pembayaran, Sort), `TransactionTable` (desktop) / `TransactionListItem` (mobile), `ConfirmDialog` hapus transaksi.
- **Dependensi Data**: `transactionService.queryTransactions(filter)` dan `categoryService.listCategories({ includeArchived: true })`.
- **Interaksi Pengguna**:
  - Ketik kata kunci (debounce `200 ms`) memfilter berdasarkan catatan atau nama kategori.
  - Pilih filter memperbarui kueri URL query params (opsional agar state mudah dibagikan di tab sama) atau state komponen dan menghitung ulang subtotal Pemasukan/Pengeluaran/Selisih filter.
  - Aksi Edit membuka `/transactions/[id]/edit` atau modal edit; aksi Hapus membuka `ConfirmDialog`.
- **Loading State**: Skeleton bar filter + 8 baris skeleton tabel.
- **Empty State**: Dibedakan menjadi dua: (a) belum ada transaksi sama sekali → CTA catat pertama; (b) tidak ada hasil cocok dengan filter → pesan *"Tidak ada transaksi yang cocok"* + tombol **Reset Filter**.
- **Error State**: Banner error non-blocking jika rentang tanggal tidak valid (`startDate > endDate`) atau query IndexedDB gagal.
- **Perilaku Responsif**: Pada `< 768px`, panel filter detail dikemas di dalam tombol **Filter (N aktif)** yang membuka Bottom Sheet, sedangkan kotak pencarian tetap tampil langsung di atas daftar.

---

## 3. Add / Edit Transaction (`/transactions/new` & `/transactions/[id]/edit`)

- **Tujuan**: Menyediakan formulir terfokus yang cepat, akurat, dan tahan kesalahan untuk menambah atau menyunting satu transaksi. *(Dapat juga dipanggil sebagai modal/drawer dari Dashboard atau `/transactions`, sementara rute penuh tetap ada untuk akses langsung dan deep-link PWA).*
- **Tata Letak**: Form single-column terpusat (`max-w-xl`) dengan urutan prioritas jari: Tipe → Nominal IDR → Kategori → Tanggal → Metode Pembayaran → Catatan → Tombol Simpan.
- **Komponen**: Segmented toggle `Pengeluaran` / `Pemasukan`, `CurrencyInput`, Category Picker (dengan ikon & warna), Date Input + chip cepat (`Hari Ini`, `Kemarin`), Select Metode Pembayaran, Textarea Catatan (penghitung `0/500`), Submit & Cancel buttons.
- **Dependensi Data**: `categoryService.listCategories({ type, includeArchived: false })` (+ kategori lama transaksi jika sedang edit dan kategori lamanya ternyata berstatus `isArchived`), `transactionService.getTransactionById(id)` (mode edit), `createTransaction` / `updateTransaction`.
- **Interaksi Pengguna**:
  - Mengganti tipe transaksi memfilter ulang daftar kategori dan mereset pilihan kategori bila tipe berbeda.
  - Pada mode `create`, tombol sekunder **"Simpan & Tambah Lagi"** menyimpan lalu mengosongkan nominal & catatan tanpa meninggalkan form.
- **Loading State**: Pada mode edit, skeleton form tampil hingga `getTransactionById` selesai.
- **Empty State**: Jika ID pada `/transactions/[id]/edit` tidak ditemukan di database → tampil pesan *"Transaksi tidak ditemukan"* beserta tombol kembali ke `/transactions`.
- **Error State**: Error validasi Zod ditampilkan persis di bawah field terkait; error storage ditampilkan di alert atas form.
- **Perilaku Responsif**: Pada mobile, tombol simpan menempel mudah dijangkau; `CurrencyInput` memicu keyboard numerik (`inputMode="numeric"`).

---

## 4. Categories (`/categories`)

- **Tujuan**: Mengelola daftar kategori pemasukan dan pengeluaran, termasuk pengarsipan aman dan pemindahan referensi sebelum penghapusan.
- **Tata Letak**: Header + Tabs (`Pengeluaran` | `Pemasukan`) + Tombol **"+ Tambah Kategori"** + Daftar Kategori Aktif + Seksi Lipat (*Accordion*) **"Kategori Diarsipkan"**.
- **Komponen**: `CategoryBadge`, Category Form Modal (Nama, Ikon picker dari daftar terkurasi Lucide, Color swatch picker terkurasi), Dialog **Penanganan Kategori Terpakai** (pilihan `Arsipkan` vs `Pindahkan ke Kategori Lain & Hapus`).
- **Dependensi Data**: `categoryService.listCategories({ includeArchived: true })`, `getCategoryUsage`, `createCategory`, `updateCategory`, `setCategoryArchived`, `deleteCategoryWithStrategy`.
- **Interaksi Pengguna**:
  - Kategori sistem fallback (`Lainnya`) menampilkan badge `"Sistem • Dilindungi"` tanpa tombol arsip/hapus.
  - Menekan Hapus pada kategori non-sistem memicu pengecekan referensi; bila `totalRefs > 0`, membuka dialog pemindahan/arsip (`RULE-020`).
- **Loading State**: Skeleton daftar 6 item kartu kategori.
- **Empty State**: Pada seksi "Kategori Diarsipkan" jika 0, tampil keterangan singkat *"Belum ada kategori yang diarsipkan"*.
- **Error State**: Nama duplikat dalam tipe yang sama menampilkan error inline di modal kategori.
- **Perilaku Responsif**: Kartu kategori tersusun grid 2–3 kolom di desktop dan 1 kolom penuh di mobile.

---

## 5. Budgets (`/budgets`)

- **Tujuan**: Menetapkan batas pengeluaran bulanan per kategori dan memantau utilisasi serta sisa anggaran bulan terpilih.
- **Tata Letak**: Header + Pemilih Bulan (`< Bulan Sebelumnya | November 2026 | Bulan Berikutnya >`) + Tombol **"Salin dari Bulan Lalu"** & **"+ Tambah Anggaran"** + Kartu Ringkasan Total Anggaran Bulan Ini + Grid Kartu Anggaran per Kategori.
- **Komponen**: Month Stepper, `KpiSummaryCard` ringkas (Total Dianggarkan, Total Terpakai pada Kategori Beranggaran, Sisa Total), `BudgetProgressCard`, Budget Modal Form (Kategori Pengeluaran aktif yang belum punya budget di bulan itu, `CurrencyInput` batas, Slider/Input `warningThresholdPct` 50–95%), Modal/Drawer Detail Transaksi Kategori.
- **Dependensi Data**: `budgetService.listMonthlyBudgets(month)`, `upsertBudget`, `deleteBudget`, `copyBudgetsFromPreviousMonth`, `transactionService.queryTransactions`.
- **Interaksi Pengguna**:
  - Klik kartu anggaran membuka rincian transaksi pengeluaran kategori tersebut di bulan terpilih.
  - Klik **"Salin dari Bulan Lalu"** menyalin anggaran yang belum ada pada bulan aktif dan memberi toast jumlah yang tersalin vs dilewati.
- **Loading State**: Skeleton ringkasan 3 kolom + 4 skeleton `BudgetProgressCard`.
- **Empty State**: Jika belum ada anggaran pada bulan terpilih → tampil ajakan menetapkan anggaran pertama + tombol **"Salin dari Bulan Lalu"** (jika bulan lalu punya data) dan **"+ Tambah Anggaran"**.
- **Error State**: Error validasi di modal form bila batas `<= 0` atau ambang di luar `50..95`.
- **Perilaku Responsif**: Grid kartu anggaran 1 kolom (mobile), 2 kolom (tablet/desktop).

---

## 6. Financial Goals (`/goals`)

- **Tujuan**: Mengelola target tabungan beserta setoran/penarikan dana alokasi (*earmark*) terpisah dari pengeluaran riil, serta memantau saldo tersedia.
- **Tata Letak**: Header + Banner Info Singkat (*"Dana yang disisihkan ke target mengurangi Saldo Tersedia tanpa dihitung sebagai pengeluaran"*) + Kartu Ringkasan (`Total Dana Teralokasi`, `Saldo Tersedia`, `Target Aktif`) + Grid Kartu Target + Filter Status (`Semua` | `Aktif` | `Tercapai` | `Dijeda`).
- **Komponen**: `GoalProgressCard`, Goal Form Modal, Contribution Modal (tab `Setor Alokasi` / `Tarik Alokasi`, `CurrencyInput`, tanggal, catatan), Drawer Riwayat Kontribusi per Target, `ConfirmDialog` hapus target.
- **Dependensi Data**: `goalService.listGoals()`, `dashboardService` (untuk menampilkan `AvailableBalance` terkini), `recordGoalContribution`, `listGoalContributions`, `deleteGoal`.
- **Interaksi Pengguna**:
  - Setor/Tarik dana langsung memperbarui `currentAmount`, progress bar, status otomatis `'completed'`/`'active'`, dan `AvailableBalance`.
  - Melihat riwayat kontribusi menampilkan kronologi setoran/penarikan target tersebut.
- **Loading State**: Skeleton 3 kartu ringkasan + 3 kartu target.
- **Empty State**: *"Belum ada target keuangan"* + CTA **"+ Buat Target Pertama"**.
- **Error State**: Menolak penarikan melebihi `currentAmount` dengan pesan jelas di bawah input nominal.
- **Perilaku Responsif**: Grid 1 kolom (mobile), 2 kolom (tablet), 3 kolom (desktop).

---

## 7. Recurring Transactions (`/recurring`)

- **Tujuan**: Mengatur jadwal otomatis lokal untuk pemasukan/pengeluaran rutin dan memantau tanggal eksekusi berikutnya.
- **Tata Letak**: Header + Tombol **"+ Tambah Jadwal Berulang"** + Filter (`Semua` | `Aktif` | `Dijeda`) + Daftar Kartu Aturan Berulang.
- **Komponen**: `RecurringRuleCard`, Recurring Rule Modal (Tipe, `CurrencyInput`, Kategori, Metode, Frekuensi, Interval, `startDate`, `endDate` opsional, Catatan, plus **Pratinjau 3 Jadwal Berikutnya**), `ConfirmDialog` hapus aturan.
- **Dependensi Data**: `recurringService.listRecurringRules()`, `materializeDueTransactions()` (dijalankan saat membuka halaman jika ada yang jatuh tempo), `createRule`, `updateRule`, `toggleRule`, `deleteRule`.
- **Interaksi Pengguna**:
  - Switch aktif/jeda langsung mengaktifkan atau menghentikan eksekusi mendatang.
  - Menghapus aturan menampilkan catatan penegasan bahwa transaksi masa lalu yang sudah terbuat **tidak akan terhapus**.
- **Loading State**: Skeleton 4 kartu aturan.
- **Empty State**: *"Belum ada transaksi berulang"* dengan contoh penggunaan (Gaji bulanan, Sewa kos, Langganan internet) + CTA **"+ Buat Aturan Berulang"**.
- **Error State**: Validasi `endDate < startDate`, `interval < 1`, serta banner informasi bila ada aturan yang mencapai batas catch-up 366 occurrence (`RULE-016`).
- **Perilaku Responsif**: 1 kolom (mobile), 2 kolom (tablet/desktop).

---

## 8. Analytics (`/analytics`)

- **Tujuan**: Membantu pengguna memahami pola arus kas, proporsi pos pengeluaran, dan wawasan keuangan deterministik dari data lokal.
- **Tata Letak**: Header + Pemilih Periode (`Bulan Ini`, `3 Bulan`, `6 Bulan`, `Tahun Ini`, `Kustom`) + Baris Insight Cards + Baris Grafik Utama (Tren Bar/Line & Donut Pengeluaran) + Tabel Rincian Kategori Pengeluaran + Perbandingan Periode Sebelumnya.
- **Komponen**: Period Selector, Insight Cards (ikon + ringkasan berbasis aturan `insightsEngine`), `ChartContainerCard` berisi Recharts `BarChart`/`ComposedChart` (Pemasukan vs Pengeluaran) dan `PieChart` Donut (Top kategori pengeluaran + "Lainnya"), Tabel persentase kategori.
- **Dependensi Data**: `analyticsService.getAnalyticsReport(range)`.
- **Interaksi Pengguna**:
  - Mengganti periode langsung menghitung ulang seluruh grafik, tabel, dan insight.
  - Hover/tap pada batang atau irisan chart menampilkan tooltip nominal IDR lengkap.
- **Loading State**: Skeleton 3 kartu insight + 2 blok chart tinggi tetap `320px`.
- **Empty State**: Jika tidak ada transaksi pada periode terpilih → tampil empty state ramah beserta tombol ubah periode atau catat transaksi.
- **Error State**: Fallback ramah bila rentang tanggal kustom tidak valid.
- **Perilaku Responsif**: Grafik berdampingan (`grid-cols-2`) di desktop dan bertumpuk vertikal di mobile/tablet dengan tinggi chart disesuaikan (`260px` mobile, `320px` desktop).

---

## 9. Reports (`/reports`)

- **Tujuan**: Menyajikan ringkasan laporan keuangan periode tertentu yang siap dicetak (*print-friendly*) dan diekspor ke berkas CSV.
- **Tata Letak**: Header + Toolbar Filter Periode & Tipe + Tombol **"Ekspor CSV"** & **"Cetak Laporan"** (`window.print()`) + Ringkasan Eksekutif Periode + Tabel Rincian per Kategori + Tabel Daftar Transaksi Periode.
- **Komponen**: Filter Bar, Summary Strip (Pemasukan, Pengeluaran, Arus Kas Bersih, Rasio Tabungan), Tabel Agregasi Kategori, Tabel Transaksi, Export Button.
- **Dependensi Data**: `analyticsService.getAnalyticsReport(range)`, `transactionService.queryTransactions(filter)`, `exportService.exportTransactionsCsv(filter)`.
- **Interaksi Pengguna**:
  - Klik **Ekspor CSV** langsung mengunduh berkas `.csv` UTF-8 BOM yang sudah disanitasi dari *CSV formula injection* (`SEC-006`).
  - Klik **Cetak Laporan** memanggil dialog print browser dengan `@media print` CSS (menyembunyikan sidebar/bottom nav/toolbar filter dan memaksa latar putih bersih dengan teks hitam).
- **Loading State**: Skeleton strip ringkasan + skeleton tabel.
- **Empty State**: Jika filter periode kosong, tombol **Ekspor CSV** dan **Cetak** dinonaktifkan dengan pesan informatif.
- **Error State**: Toast error jika pembuatan Blob gagal.
- **Perilaku Responsif**: Toolbar filter melingkar rapi; tabel memiliki tampilan kartu ringkas di mobile atau horizontal wrapper terisolasi khusus di dalam komponen tabel tanpa melebarkan viewport halaman.

---

## 10. Settings (`/settings`)

- **Tujuan**: Mengelola preferensi tampilan, privasi, parameter default anggaran, informasi penyimpanan browser, serta penghapusan data lokal.
- **Tata Letak**: Kontainer terpusat (`max-w-3xl`) berisi kartu-kartu seksi berurutan: Tampilan & Tema, Privasi & Keamanan Lokal, Preferensi Keuangan, Status Penyimpanan & Backup Cepat, serta Zona Bahaya (*Danger Zone*).
- **Komponen**: Theme Selector (`Gelap` / `Terang` / `Ikuti Sistem`), Switch `Sembunyikan Nominal Secara Default`, Select `Hari Awal Minggu` (`Senin`/`Minggu`), Input `Ambang Peringatan Anggaran Default (%)`, Kartu Info Storage (`usage / quota`, status `Persisted`), Tautan ke `/settings/backup`, `TypedConfirmDialog` untuk Reset Data (`"HAPUS"`).
- **Dependensi Data**: `settingsService.getSettings()`, `updateSettings()`, `factoryResetDatabase()`, `bootstrapService.getStorageHealth()`.
- **Interaksi Pengguna**:
  - Perubahan preferensi langsung disimpan dan diterapkan secara reaktif.
  - Tombol **"Minta Penyimpanan Persisten"** (jika browser mendukung `navigator.storage.persist()`) menampilkan status hasilnya.
  - Aksi **"Hapus Semua Data"** di Zona Bahaya mewajibkan mengetik `"HAPUS"` dan memilih apakah ingin tetap menyiapkan kategori default kosong.
- **Loading State**: Skeleton seksi pengaturan.
- **Empty State**: Tidak berlaku (selalu ada record `'default'`).
- **Error State**: Pesan validasi bila ambang default di luar `50..95`.
- **Perilaku Responsif**: Label dan kontrol bertumpuk vertikal di mobile dan sejajar horizontal di desktop.

---

## 11. Backup & Restore (`/settings/backup`)

- **Tujuan**: Memungkinkan pencadangan penuh seluruh basis data lokal ke berkas JSON berversi dan pemulihan aman berpratinjau.
- **Tata Letak**: Kontainer terpusat (`max-w-3xl`) terbagi menjadi 2 kartu utama: **Ekspor Cadangan Data (Backup)** dan **Pulihkan Data (Restore)**, plus kartu catatan privasi berkas backup.
- **Komponen**: Info `lastBackupAt` & jumlah data saat ini, Tombol **"Unduh Backup JSON"**, `BackupDropzone`, `RestorePreviewPanel`, Pemilih Mode (`Merge` vs `Replace All`), `TypedConfirmDialog` (`"TIMPA"` untuk Replace All).
- **Dependensi Data**: `backupService.exportBackupJson()`, `inspectBackupFile(file)`, `applyRestore(envelope, options)`.
- **Interaksi Pengguna**:
  - Unduh JSON langsung menghasilkan file `finora-backup-YYYY-MM-DD-HHmm.json` dan memperbarui waktu backup terakhir.
  - Mengunggah JSON menjalankan inspeksi penuh terlebih dahulu sebelum tombol eksekusi restore muncul.
- **Loading State**: Indikator proses saat menghitung SHA-256 dan menulis transaksi atomik saat restore berkas besar.
- **Empty State**: Jika database kosong (0 transaksi), pengguna tetap bisa mengekspor pengaturan/kategori atau langsung mengunggah file backup di area Restore.
- **Error State**: Penolakan eksplisit jika file `> 25 MB`, bukan JSON, gagal skema Zod, versi tidak didukung, atau checksum SHA-256 tidak cocok.
- **Perilaku Responsif**: Dropzone menyesuaikan lebar penuh di mobile dengan tombol pilih file besar (`>= 48px`).

---

## 12. Offline Fallback (`/offline`)

- **Tujuan**: Menyediakan halaman cadangan ramah yang disajikan Service Worker ketika pengguna dalam keadaan offline menavigasi rute yang belum ada di cache browser.
- **Tata Letak**: Kartu terpusat vertikal pada latar `--bg-canvas`.
- **Komponen**: Ikon Wi-Fi terputus, judul *"Anda Sedang Offline"*, penjelasan bahwa halaman tersebut belum tersimpan di cache offline namun data keuangan lokal di perangkat tetap aman, tombol **"Coba Muat Ulang"**, dan tombol **"Kembali ke Dashboard (`/`)"**.
- **Dependensi Data**: Tidak ada (halaman statis murni di-precache oleh Service Worker).
- **Perilaku Responsif**: Sempurna pada seluruh ukuran layar dari `360px` ke atas.
