# Use Cases — Finora

**Versi Dokumen**: 1.0.0  
**Tujuan**: Mendokumentasikan skenario interaksi sistem secara rinci meliputi aktor, prasyarat, alur utama, alur alternatif, skenario error, dan kondisi akhir (*postconditions*).  
**Dokumen Terkait**: [USER_STORIES.md](./USER_STORIES.md) | [DATA_FLOW.md](../03-architecture/DATA_FLOW.md) | [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md)

---

## Daftar Use Case

| ID | Nama Use Case | Prioritas | Referensi User Story |
|---|---|---|---|
| **UC-001** | Inisialisasi Kunjungan Pertama (*First-Run Bootstrap*) | P0 | `US-001` |
| **UC-002** | Tambah Transaksi Baru | P0 | `US-003` |
| **UC-003** | Ubah & Hapus Transaksi | P0 | `US-004`, `US-005` |
| **UC-004** | Pencarian & Filter Multi-Kriteria Transaksi | P0 | `US-006` |
| **UC-005** | Kelola Kategori & Penghapusan Aman (*Reassign/Archive*) | P0 | `US-007`, `US-008` |
| **UC-006** | Tetapkan & Evaluasi Anggaran Bulanan | P0 | `US-009`, `US-010` |
| **UC-007** | Kelola Target Keuangan & Kontribusi Earmark | P1 | `US-011`, `US-012` |
| **UC-008** | Buat Aturan & Materialisasi Transaksi Berulang | P1 | `US-013`, `US-014` |
| **UC-009** | Eksplorasi Analitik & Ekspor Laporan CSV | P0/P1 | `US-015`, `US-016`, `US-017` |
| **UC-010** | Ekspor Backup JSON | P0 | `US-020` |
| **UC-011** | Pratinjau & Restore Backup JSON | P0 | `US-021` |
| **UC-012** | Operasional Offline & Penanganan Kegagalan Storage | P0 | `US-022`, `US-024` |

---

## UC-001 — Inisialisasi Kunjungan Pertama (*First-Run Bootstrap*)

- **Aktor**: Pengguna Baru, Sistem Aplikasi (Client Bootstrap Service), `FinoraDB` (IndexedDB).
- **Prasyarat**: Browser mendukung IndexedDB; belum ada data pada `FinoraDB`.
- **Alur Utama**:
  1. Pengguna membuka URL aplikasi Finora.
  2. Aplikasi membuka koneksi Dexie.js ke `FinoraDB` v1.
  3. Sistem memeriksa tabel `appSettings` (key `'default'`) dan jumlah record `categories`.
  4. Karena belum terinisialisasi, sistem menjalankan transaksi atomik `seedInitialDatabase()`: menyisipkan 13 kategori sistem (5 pemasukan, 8 pengeluaran) dan `appSettings` default (`theme: 'dark'`, `currency: 'IDR'`, `onboardingCompleted: true`).
  5. Sistem menjalankan evaluator transaksi berulang (no-op pada kunjungan pertama).
  6. Dashboard `/` dirender dengan state awal siap pakai.
- **Alur Alternatif**:
  - *A1 — Database Sudah Ada*: Langkah 4 dilewati; langsung lanjut ke langkah 5.
- **Skenario Error**:
  - *E1 — IndexedDB Diblokir (misal Private Browsing tertentu atau kebijakan browser)*: Aplikasi menampilkan *banner/fallback* error non-crash yang menjelaskan keterbatasan penyimpanan browser beserta tombol coba lagi.
- **Postcondition**: `FinoraDB` siap melayani operasi baca/tulis lokal tanpa panggilan server.

---

## UC-002 — Tambah Transaksi Baru

- **Aktor**: Pengguna, Form Transaksi, `transactionService`, `FinoraDB`.
- **Prasyarat**: Minimal satu kategori aktif tersedia untuk tipe yang dipilih.
- **Alur Utama**:
  1. Pengguna menekan tombol **"+ Catat Transaksi"** (di Dashboard, Header, atau Bottom Nav/FAB).
  2. Sistem menampilkan formulir dengan default: `type = 'expense'`, `date = today (YYYY-MM-DD lokal)`, `paymentMethod = 'cash'`.
  3. Pengguna memilih tipe (`income` / `expense`), mengetik nominal `125000` (tampilan otomatis terformat `125.000`).
  4. Pengguna memilih kategori (daftar difilter otomatis sesuai `type` terpilih), metode pembayaran, dan mengisi catatan opsional.
  5. Pengguna menekan **Simpan**.
  6. `transactionService.createTransaction()` memvalidasi payload via Zod (`amount` integer `1..999_999_999_999`, `date` valid, `categoryId` ada dan tipenya cocok dengan transaksi).
  7. Sistem menghasilkan UUID v4, menyisipkan record ke `transactions`, dan menampilkan toast konfirmasi `"Transaksi berhasil disimpan"`.
- **Alur Alternatif**:
  - *A1 — Simpan & Tambah Lagi*: Pengguna memilih opsi tambah transaksi berikutnya tanpa menutup form; form direset kecuali tanggal dan tipe terakhir.
- **Skenario Error**:
  - *E1 — Nominal `0`, kosong, atau desimal tidak valid*: Validasi Zod menggagalkan submit; pesan error tampil tepat di bawah input nominal.
  - *E2 — Kategori tidak cocok tipe atau tidak ditemukan*: Service melempar `ValidationError`; form meminta pengguna memilih kategori valid.
  - *E3 — QuotaExceededError*: Sistem menangkap error IndexedDB dan menyarankan ekspor backup atau membersihkan data lama.
- **Postcondition**: Transaksi baru tercatat permanen di IndexedDB; tampilan Dashboard, Transaksi, dan Anggaran otomatis diperbarui.

---

## UC-003 — Ubah & Hapus Transaksi

- **Aktor**: Pengguna, Halaman Transaksi, `transactionService`, `FinoraDB`.
- **Prasyarat**: Record transaksi target ada di tabel `transactions`.
- **Alur Utama (Ubah)**:
  1. Pengguna memilih tombol Edit pada baris transaksi.
  2. Form dimuat dengan data transaksi eksisting.
  3. Jika `type` diubah dari `expense` ke `income`, daftar kategori diperbarui dan field kategori direset agar tidak terjadi ketidaksesuaian tipe.
  4. Pengguna menekan **Simpan Perubahan**.
  5. `transactionService.updateTransaction()` memvalidasi ulang dengan Zod, menjaga `createdAt` asli, memperbarui `updatedAt` UTC, dan menyimpan perubahan ke `FinoraDB`.
- **Alur Alternatif (Hapus)**:
  1. Pengguna memilih tombol Hapus pada baris transaksi.
  2. Dialog konfirmasi menampilkan ringkasan singkat (nominal, kategori, tanggal) untuk mencegah salah hapus.
  3. Pengguna menekan **Hapus**; `transactionService.deleteTransaction(id)` menghapus record dari IndexedDB.
- **Skenario Error**:
  - *E1 — Transaksi tidak lagi ditemukan (misal dihapus dari tab browser lain)*: Sistem menampilkan peringatan `"Transaksi tidak ditemukan"` dan menyegarkan daftar.
- **Postcondition**: Perubahan/penghapusan terefleksi di seluruh agregasi saldo, anggaran, dan grafik.

---

## UC-004 — Pencarian & Filter Multi-Kriteria Transaksi

- **Aktor**: Pengguna, Halaman `/transactions`, `transactionService`.
- **Prasyarat**: Pengguna membuka halaman `/transactions`.
- **Alur Utama**:
  1. Sistem memuat transaksi bulan berjalan secara default (terurut `date DESC, createdAt DESC`).
  2. Pengguna mengisi kotak pencarian (debounce 200 ms) dan/atau memilih filter tipe, kategori, metode pembayaran, atau rentang tanggal kustom (`startDate` s.d. `endDate`).
  3. Sistem mengeksekusi kueri terindeks pada Dexie.js dan memfilter hasil di memori secara deterministik.
  4. UI menampilkan daftar transaksi cocok beserta ringkasan subtotal (Jumlah Transaksi, Total Pemasukan Filter, Total Pengeluaran Filter).
- **Alur Alternatif**:
  - *A1 — Reset Filter*: Pengguna menekan tombol "Reset Filter" untuk kembali ke tampilan default bulan berjalan.
- **Skenario Error**:
  - *E1 — `startDate > endDate`*: UI mencegah pemilihan rentang terbalik atau menampilkan pesan validasi rentang tanggal tidak valid.
- **Postcondition**: Hasil filter tampil akurat tanpa mengubah data di IndexedDB.

---

## UC-005 — Kelola Kategori & Penghapusan Aman (*Reassign/Archive*)

- **Aktor**: Pengguna, Halaman `/categories`, `categoryService`, `FinoraDB`.
- **Prasyarat**: Kategori sistem bawaan sudah tersedia.
- **Alur Utama (Tambah/Ubah)**:
  1. Pengguna membuka tab `Pengeluaran` atau `Pemasukan` di `/categories`.
  2. Pengguna menambah kategori baru dengan nama unik (case-insensitive dalam tipe yang sama), ikon Lucide, dan warna.
  3. `categoryService` menyimpan kategori dengan `isSystem = false`, `isArchived = false`.
- **Alur Alternatif (Hapus Kategori Terpakai)**:
  1. Pengguna memilih hapus pada kategori non-sistem `C_lama`.
  2. `categoryService.getCategoryUsageCount(C_lama)` mengecek referensi pada `transactions`, `budgets`, dan `recurringTransactions`.
  3. Karena jumlah referensi `> 0`, sistem membuka modal **Penanganan Kategori Terpakai** dengan 2 pilihan:
     - **Arsipkan** (`isArchived = true`): aman, histori tetap memakai nama `C_lama`.
     - **Pindahkan & Hapus**: pengguna memilih kategori target `C_baru` bertipe sama (termasuk kategori sistem `Lainnya`). Sistem menjalankan transaksi atomik Dexie untuk memperbarui `categoryId` di seluruh tabel referensi (termasuk menggabungkan/menangani potensi bentrok budget `(C_baru, month)` sesuai `RULE-020`), lalu menghapus `C_lama`.
- **Skenario Error**:
  - *E1 — Mencoba menghapus atau mengarsipkan kategori sistem fallback (`cat-sys-other-income` / `cat-sys-other-expense`)*: Aksi diblokir di UI dan ditolak oleh `categoryService`.
- **Postcondition**: Tidak ada transaksi, anggaran, atau aturan berulang yang menjadi yatim (*orphan `categoryId`*).

---

## UC-006 — Tetapkan & Evaluasi Anggaran Bulanan

- **Aktor**: Pengguna, Halaman `/budgets`, `budgetService`, `FinoraDB`.
- **Prasyarat**: Minimal satu kategori bertipe `expense` aktif.
- **Alur Utama**:
  1. Pengguna memilih bulan target (default bulan berjalan `YYYY-MM`).
  2. Pengguna menekan **Tambah Anggaran**, memilih kategori pengeluaran yang belum memiliki budget pada bulan tersebut, mengisi `limitAmount > 0` dan `warningThresholdPct` (default `80`).
  3. `budgetService.upsertBudget()` memvalidasi input dan menyimpan record.
  4. Sistem menghitung `spent`, `remaining`, `utilizationPct`, dan `status` (`safe` / `warning` / `exceeded`) secara real-time berdasarkan seluruh transaksi `expense` di bulan tersebut.
- **Alur Alternatif**:
  - *A1 — Salin dari Bulan Sebelumnya*: Sistem menyalin semua budget dari `month - 1` ke `month` untuk kategori yang belum memiliki anggaran di `month`.
- **Skenario Error**:
  - *E1 — Kategori bertipe `income`*: Ditolak oleh validasi domain (`RULE-008`).
  - *E2 — Ambang peringatan di luar rentang `50..95`*: Pesan error validasi ditampilkan di form.
- **Postcondition**: Status anggaran terbaca konsisten di `/budgets` dan kartu peringatan Dashboard.

---

## UC-007 — Kelola Target Keuangan & Kontribusi Earmark

- **Aktor**: Pengguna, Halaman `/goals`, `goalService`, `FinoraDB`.
- **Prasyarat**: Pengguna mengakses `/goals`.
- **Alur Utama**:
  1. Pengguna membuat target baru (nama, `targetAmount > 0`, `deadline` opsional, ikon, warna).
  2. Untuk menambah dana, pengguna menekan **Tambah Setoran** pada kartu target dan memasukkan nominal `> 0` serta tanggal lokal.
  3. Dalam satu transaksi Dexie atomik, `goalService.addContribution()` menyisipkan record ke `goalContributions`, memperbarui `financialGoals.currentAmount`, dan otomatis mengubah `status = 'completed'` jika `currentAmount >= targetAmount`.
- **Alur Alternatif**:
  - *A1 — Tarik Dana Alokasi*: Pengguna memilih mode tarik dana (`amount < 0` disimpan di `goalContributions`, nominal input di UI positif dengan tab "Tarik"). Sistem memverifikasi `currentAmount + delta >= 0`.
- **Skenario Error**:
  - *E1 — Penarikan melebihi `currentAmount`*: Transaksi ditolak sebelum menyentuh database; UI menampilkan sisa dana yang tersedia untuk ditarik.
  - *E2 — Deadline di masa lalu saat membuat target baru*: UI memberi peringatan atau meminta tanggal hari ini/mendatang.
- **Postcondition**: `AvailableBalance` berkurang/bertambah sesuai alokasi, tanpa mengubah `TotalIncome` maupun `TotalExpense`.

---

## UC-008 — Buat Aturan & Materialisasi Transaksi Berulang

- **Aktor**: Pengguna, Sistem Bootstrap/Router, `recurringService`, `FinoraDB`.
- **Prasyarat**: Terdapat kategori aktif yang sesuai tipe aturan.
- **Alur Utama**:
  1. Pengguna membuat aturan baru di `/recurring` (misal bulanan, nominal, kategori, `startDate`, `endDate` opsional).
  2. `recurringService.createRule()` menghitung `anchorDay` (jika bulanan) dan `nextRunDate` awal.
  3. Saat aplikasi dibuka atau halaman `/recurring` diakses, `recurringService.materializeDueTransactions(today)` memeriksa semua aturan dengan `isActive = true` dan `nextRunDate <= today`.
  4. Dalam transaksi atomik per aturan (maksimal 366 iterasi per eksekusi), sistem memeriksa idempotensi `[recurringRuleId+recurringOccurrenceDate]`, menyisipkan transaksi baru ke `transactions`, dan memajukan `nextRunDate` (dengan *end-of-month clamping* bila perlu). Jika melewati `endDate`, aturan dinonaktifkan otomatis (`isActive = false`).
- **Alur Alternatif**:
  - *A1 — Jeda atau Hapus Aturan*: Menonaktifkan atau menghapus aturan tidak menghapus transaksi masa lalu yang sudah terbentuk.
- **Skenario Error**:
  - *E1 — `endDate < startDate`*: Ditolak validasi Zod pada form.
  - *E2 — Catch-up melebihi 366 occurrence*: Sistem membatasi materialisasi hingga 366 kali dan menampilkan notifikasi agar pengguna meninjau tanggal mulai aturan.
- **Postcondition**: Seluruh transaksi jatuh tempo tercatat tepat sekali tanpa duplikasi.

---

## UC-009 — Eksplorasi Analitik & Ekspor Laporan CSV

- **Aktor**: Pengguna, Halaman `/analytics` & `/reports`, `analyticsService`, `exportService`.
- **Prasyarat**: Data transaksi tersedia (jika kosong, tampilkan *empty state*).
- **Alur Utama**:
  1. Di `/analytics`, pengguna memilih periode (`Bulan Ini`, `3 Bulan`, `6 Bulan`, `Tahun Ini`, atau kustom).
  2. `analyticsService` mengagregasi deret waktu bulanan, distribusi kategori pengeluaran, rasio tabungan, dan menghasilkan daftar insight deterministik lokal.
  3. Di `/reports`, pengguna meninjau tabel ringkasan dan menekan **Ekspor CSV**.
  4. `exportService.generateTransactionsCsv()` melakukan sanitasi formula (`=`, `+`, `-`, `@`, `\t`, `\r` diawali tanda kutip tunggal `'` bila perlu), menambahkan UTF-8 BOM, dan memicu unduhan blob lokal `finora-laporan-YYYY-MM-DD.csv`.
- **Skenario Error**:
  - *E1 — Tidak ada transaksi pada periode terpilih*: Tombol Ekspor CSV dinonaktifkan dengan keterangan jelas.
- **Postcondition**: Berkas CSV terunduh secara lokal tanpa permintaan jaringan.

---

## UC-010 — Ekspor Backup JSON

- **Aktor**: Pengguna, Halaman `/settings/backup`, `backupService`, Web Crypto API.
- **Prasyarat**: `FinoraDB` dapat dibaca.
- **Alur Utama**:
  1. Pengguna membuka `/settings/backup` dan menekan **Unduh Backup JSON**.
  2. `backupService.exportBackup()` membaca ketujuh tabel secara konsisten dalam transaksi read-only Dexie.
  3. Sistem menyusun `payload`, menserialisasikannya secara deterministik, menghitung digest SHA-256 via `crypto.subtle.digest`, dan membungkusnya ke objek envelope v1 (`backupFormatVersion: 1`, `dbSchemaVersion: 1`, `appName: "Finora"`, `exportedAt`, `checksum`, `payload`).
  4. Browser memicu unduhan berkas `finora-backup-YYYY-MM-DD-HHmm.json` dan mencatat `appSettings.lastBackupAt`.
- **Skenario Error**:
  - *E1 — Web Crypto API tidak tersedia (konteks non-HTTPS selain localhost)*: Tampilkan pesan error bahwa fitur verifikasi checksum memerlukan konteks aman HTTPS.
- **Postcondition**: Berkas backup portabel tersimpan di perangkat pengguna.

---

## UC-011 — Pratinjau & Restore Backup JSON

- **Aktor**: Pengguna, Halaman `/settings/backup`, `backupService`, `FinoraDB`.
- **Prasyarat**: Pengguna memiliki berkas `.json` hasil ekspor Finora.
- **Alur Utama**:
  1. Pengguna memilih atau menjatuhkan berkas `.json` (ukuran maks `25 MB`).
  2. `backupService.inspectBackupFile()` mem-parsing JSON dengan aman, memvalidasi struktur melalui Zod strict schema, dan menghitung ulang SHA-256 `payload` untuk dicocokkan dengan `checksum.value`.
  3. UI menampilkan **Restore Preview**: jumlah baris tiap tabel, rentang tanggal transaksi, serta jumlah konflik jika memakai mode `Merge`.
  4. Pengguna memilih mode:
     - **Replace All**: Pengguna mengetik kata konfirmasi `"TIMPA"` lalu menekan Eksekusi Restore.
     - **Merge**: Pengguna memilih strategi bentrok (`Lewati data lama` atau `Perbarui dengan backup`) lalu menekan Eksekusi Restore.
  5. `backupService.applyRestore()` menjalankan seluruh penulisan dalam satu transaksi atomik `db.transaction('rw', ...)` di Dexie.js.
  6. Toast sukses muncul dan halaman melakukan revalidasi seluruh state UI.
- **Skenario Error**:
  - *E1 — File bukan JSON valid / > 25 MB / gagal validasi Zod*: Ditolak seketika dengan pesan detail kesalahan format yang aman.
  - *E2 — Checksum SHA-256 tidak cocok*: Ditolak secara default untuk melindungi pengguna dari berkas korup/terpotong.
  - *E3 — Versi `backupFormatVersion` lebih baru dari versi aplikasi*: Ditolak dengan instruksi memperbarui aplikasi Finora terlebih dahulu.
  - *E4 — Kegagalan di tengah transaksi penulisan*: Dexie melakukan *rollback* penuh sehingga data lama tidak rusak setengah jalan.
- **Postcondition**: Basis data lokal terpulihkan secara atomik dan konsisten.

---

## UC-012 — Operasional Offline & Penanganan Kegagalan Storage

- **Aktor**: Pengguna, Browser, Service Worker, `FinoraDB`.
- **Prasyarat**: Aplikasi sudah pernah dikunjungi sekali sehingga *application shell* berada di Cache Storage.
- **Alur Utama**:
  1. Koneksi internet terputus (`offline` event aktif).
  2. Banner status ringan memberi tahu pengguna bahwa Finora berjalan dalam **Mode Offline — data tetap tersimpan aman di perangkat**.
  3. Pengguna mencatat transaksi, memeriksa anggaran, dan mengekspor backup/CSV seperti biasa.
- **Alur Alternatif**:
  - *A1 — Pembaruan Service Worker Tersedia*: Saat kembali online dan versi baru terdeteksi, banner non-intrusif menawarkan tombol **"Muat Ulang untuk Memperbarui"**.
- **Skenario Error**:
  - *E1 — Kunjungan pertama tanpa internet*: Browser menampilkan pesan offline standar karena SW belum terpasang.
  - *E2 — Rute tidak ter-cache diakses saat offline*: Service Worker menyajikan halaman `/offline` yang menyediakan tautan kembali ke Dashboard `/`.
  - *E3 — Storage Quota Penuh (`QuotaExceededError`)*: Modal peringatan meminta pengguna membuat backup JSON dan membersihkan data yang tidak perlu atau membebaskan ruang disk perangkat.
- **Postcondition**: Pengalaman pencatatan tetap andal dan tidak kehilangan data akibat gangguan jaringan.
