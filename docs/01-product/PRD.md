# Product Requirements Document (PRD) — Finora

**Versi Dokumen**: 1.0.0  
**Status**: Baseline Disetujui  
**Proyek**: Finora (*Your Money, Your Control*)  
**Dokumen Terkait**: [BRD.md](./BRD.md) | [USER_STORIES.md](./USER_STORIES.md) | [USE_CASES.md](./USE_CASES.md) | [PAGE_SPECIFICATIONS.md](../04-design/PAGE_SPECIFICATIONS.md)

---

## 1. Ringkasan Produk

**Finora** adalah aplikasi web progresif (*Progressive Web App*) manajemen keuangan pribadi berorientasi seluler (*mobile-first*) yang bekerja sepenuhnya di browser pengguna (*local-first* & *offline-first*). Aplikasi ini memadukan kecepatan pencatatan transaksi harian, pengendalian anggaran bulanan, perencanaan target tabungan, otomatisasi transaksi berulang, serta visualisasi analitik modern tanpa mewajibkan akun atau koneksi internet.

---

## 2. Visi & Tujuan Produk

### 2.1 Visi Produk
Menjadikan pengelolaan keuangan pribadi di perangkat pengguna sebagai pengalaman yang cepat, tenang, akurat, dan bebas kekhawatiran privasi.

### 2.2 Tujuan Produk
1. **Kecepatan Pencatatan**: Memungkinkan pengguna mencatat satu transaksi baru dalam ≤ 10 detik melalui formulir ringkas di perangkat seluler maupun desktop.
2. **Visibilitas Arus Kas Langsung**: Menyajikan kondisi keuangan bulan berjalan (*pemasukan, pengeluaran, saldo bersih, saldo tersedia, rasio tabungan*) langsung di halaman utama tanpa perlu kalkulasi manual.
3. **Pencegahan Pengeluaran Berlebih**: Memberikan peringatan visual progresif pada kategori anggaran yang mendekati atau melewati batas bulanan.
4. **Keamanan Data Mandiri**: Memudahkan pengguna mencadangkan seluruh data ke berkas JSON dan memulihkannya dengan pratinjau aman sebelum perubahan diterapkan.

---

## 3. Persona Pengguna (*User Personas*)

### Persona 1: Raka (20 tahun) — Mahasiswa Rantau
- **Konteks**: Menerima uang saku bulanan dari orang tua ditambah penghasilan paruh waktu sesekali. Mengandalkan ponsel Android kelas menengah dengan koneksi Wi-Fi kos yang kadang tidak stabil.
- **Kebutuhan**: Mencatat pengeluaran kecil (makan, kopi, transportasi, kuota) dengan cepat saat di luar, serta memastikan uang kos dan tabungan tidak terpakai untuk jajan.
- **Hambatan Saat Ini**: Malas memakai aplikasi yang harus login berulang kali atau lambat terbuka saat sinyal lemah.

### Persona 2: Nadya (27 tahun) — Karyawan Swasta
- **Konteks**: Memiliki gaji bulanan tetap, cicilan/tagihan rutin bulanan, serta beberapa target tabungan (dana darurat dan liburan).
- **Kebutuhan**: Mengatur anggaran per kategori (Makan, Transportasi, Hiburan, Belanja) setiap bulan, memantau sisa anggaran di pertengahan bulan, dan menyisihkan dana ke target keuangan tanpa mengacaukan angka pengeluaran bulanan.
- **Hambatan Saat Ini**: Bingung melihat saldo rekening yang terlihat besar padahal sebagian sudah dialokasikan untuk dana darurat.

### Persona 3: Dimas (31 tahun) — Freelancer Desain & Konsultan Teknis
- **Konteks**: Pemasukan tidak menentu tiap minggu/bulan, sangat peduli terhadap kerahasiaan data penghasilan dan kliennya.
- **Kebutuhan**: Menolak aplikasi cloud yang membaca data keuangannya; membutuhkan grafik perbandingan arus kas 6 bulan terakhir, rasio tabungan per bulan, ekspor CSV untuk rekap pajak/pribadi, dan backup JSON rutin ke penyimpanan lokal/drive pribadinya.

---

## 4. Perjalanan Pengguna Utama (*User Journeys*)

### Journey A: Kunjungan Pertama hingga Transaksi Pertama (*First-Run Flow*)
1. Pengguna membuka URL Finora di browser mobile/desktop.
2. Aplikasi menginisialisasi `FinoraDB` secara otomatis di latar belakang, melakukan *seeding* 13 kategori default (5 pemasukan, 8 pengeluaran) dan `appSettings` default.
3. Dashboard langsung tampil dalam Dark Mode default dengan *empty state* yang ramah dan tombol CTA jelas: **"+ Catat Transaksi"** (tidak ada gerbang login).
4. Pengguna menekan tombol tambah transaksi, memilih tipe `Pengeluaran`, mengetik nominal `35000` (terformat live `Rp 35.000`), memilih kategori `Makanan & Minuman`, metode `QRIS / E-Wallet`, lalu menyimpan.
5. Dashboard langsung memperbarui kartu ringkasan dan daftar transaksi terbaru secara instan.

### Journey B: Kontrol Anggaran di Tengah Bulan
1. Di awal bulan, pengguna membuka halaman **Anggaran** (`/budgets`) dan menetapkan batas `Rp 1.500.000` untuk kategori `Makanan & Minuman` dengan ambang peringatan `80%`.
2. Sepanjang bulan, setiap transaksi pengeluaran pada kategori tersebut otomatis memperbarui kalkulasi `BudgetSpent`.
3. Ketika pemakaian mencapai `Rp 1.250.000` (`83,3%`), bar progres berubah menjadi status `warning` (amber) dan muncul di kartu peringatan anggaran pada Dashboard.

### Journey C: Alokasi Target Keuangan & Saldo Tersedia
1. Pengguna membuat target `Dana Darurat` sebesar `Rp 15.000.000` di halaman **Target** (`/goals`).
2. Setelah gajian masuk (`+Rp 8.000.000`), pengguna menyetor alokasi `Rp 2.000.000` ke target `Dana Darurat`.
3. Sistem mencatatnya ke `goalContributions` (bukan sebagai `expense`), sehingga `NetBalance` tetap mencerminkan uang riil yang dimiliki, sedangkan `AvailableBalance` berkurang `Rp 2.000.000` agar tidak tidak sengaja terpakai.

### Journey D: Backup & Pindah Perangkat
1. Pengguna membuka **Pengaturan → Backup & Restore** (`/settings/backup`).
2. Pengguna menekan **Ekspor Backup JSON**; browser mengunduh berkas `finora-backup-YYYY-MM-DD.json` lengkap dengan metadata versi dan checksum SHA-256.
3. Di perangkat baru, pengguna membuka Finora, mengunggah berkas JSON tersebut, meninjau ringkasan pratinjau (*Restore Preview*), memilih mode `Replace All`, mengetik konfirmasi eksplisit, dan seluruh data pulih seketika.

---

## 5. Cakupan Produk (*Product Scope*)

| Area | Termasuk di MVP (v1.0) | Ditunda ke Pasca-MVP (V2+) |
|---|---|---|
| **Akses** | Zero-signup, lokal di browser | Passcode/PIN lock opsional, enkripsi lokal |
| **Transaksi** | Income & Expense, search, multi-filter, sort | Split transaction, lampiran foto struk lokal |
| **Akun/Dompet** | Single ledger (metode pembayaran sebagai atribut transaksi) | Multi-dompet & transfer antar-dompet |
| **Mata Uang** | IDR (`id-ID`) integer tanpa sen | Multi-currency & kurs manual/opsional |
| **Kategori** | 13 kategori default + CRUD kustom + soft-archive + reassign | Sub-kategori bertingkat |
| **Anggaran** | Anggaran bulanan per kategori pengeluaran + threshold peringatan | Rollover sisa anggaran antar-bulan, anggaran mingguan |
| **Target** | Target tabungan + setoran/penarikan earmark + estimasi bulanan | Auto-allocate persentase gaji |
| **Berulang** | Harian/Mingguan/Bulanan/Tahunan, materialisasi lokal saat buka app | Notifikasi Push OS terjadwal |
| **Analitik & Laporan** | Grafik tren, donut kategori, insight berbasis aturan, ekspor CSV | Ekspor PDF terformat, perbandingan tahunan multi-tahun |
| **Portabilitas** | Export/Import JSON berversi + SHA-256 + Preview + Replace/Merge | Sinkronisasi terenkripsi E2EE opsional berbasis file/cloud user |

---

## 6. Spesifikasi Fitur & Prioritas (`FEAT-XXX`)

| ID | Nama Fitur | Prioritas | Deskripsi Fungsional Ringkas | Ref Kebutuhan |
|---|---|---|---|---|
| **FEAT-001** | **Dashboard Ringkasan Finansial** | P0 (Must) | Menampilkan kartu KPI (`NetBalance`, `AvailableBalance`, Pemasukan & Pengeluaran bulan aktif, `SavingsRate`), peringatan anggaran, progres target aktif, grafik ringkas 6 bulan/bulan ini, dan 5 transaksi terakhir. | `FR-001`, `FR-002` |
| **FEAT-002** | **Pencatatan & Pengelolaan Transaksi** | P0 (Must) | Form tambah/ubah transaksi (desktop modal/halaman & mobile sheet/halaman), input nominal ramah IDR dengan pemisah ribuan langsung, pilih kategori sesuai tipe, tanggal lokal, catatan, metode pembayaran, hapus dengan konfirmasi. | `FR-003`, `FR-004`, `FR-005` |
| **FEAT-003** | **Pencarian & Filter Transaksi** | P0 (Must) | Pencarian teks catatan/kategori, filter rentang tanggal, preset bulan, tipe (`income`/`expense`), kategori, metode pembayaran, serta pengurutan tanggal/nominal dan pagination/virtual list. | `FR-006` |
| **FEAT-004** | **Manajemen Kategori & Reassignment** | P0 (Must) | Seeding 13 kategori default, pembuatan/pengeditan kategori kustom (nama, tipe, ikon Lucide, warna terkurasi), arsip kategori terpakai, serta dialog pemindahan (*reassignment*) sebelum hapus permanen. | `FR-007`, `FR-008` |
| **FEAT-005** | **Anggaran Bulanan (*Budgets*)** | P0 (Must) | Pengaturan batas nominal per kategori pengeluaran per bulan `YYYY-MM`, opsi salin anggaran dari bulan sebelumnya, progress bar semantik (`safe`/`warning`/`exceeded`), dan detail transaksi penyumbang pengeluaran kategori tersebut. | `FR-009`, `FR-010` |
| **FEAT-006** | **Target Keuangan (*Financial Goals*)** | P1 (Should) | Daftar target tabungan, tambah/ubah target dengan tenggat opsional, catat setor/tarik alokasi dana (`goalContributions`), riwayat kontribusi, status `active`/`paused`/`completed`, serta kalkulasi kebutuhan tabungan bulanan. | `FR-011`, `FR-012` |
| **FEAT-007** | **Transaksi Berulang (*Recurring*)** | P1 (Should) | Pembuatan aturan berulang (`daily`/`weekly`/`monthly`/`yearly`), pratinjau tanggal jatuh tempo berikutnya, jeda/aktifkan aturan, dan materialisasi otomatis lokal yang idempoten saat aplikasi dibuka. | `FR-013`, `FR-014` |
| **FEAT-008** | **Analitik Keuangan (*Analytics*)** | P1 (Should) | Visualisasi Recharts interaktif: tren Pemasukan vs Pengeluaran, rincian pengeluaran per kategori (Donut + tabel persentase), perbandingan bulan berjalan vs bulan sebelumnya, dan kartu *Rule-Based Insights* deterministik. | `FR-015`, `FR-016` |
| **FEAT-009** | **Laporan & Ekspor CSV** | P0 (Must) | Ringkasan laporan bulanan/rentang tanggal yang dapat dicetak (*print-friendly*) dan ekspor berkas `.csv` UTF-8 (dengan BOM opsional untuk kompatibilitas Excel Indonesia) yang aman dari *CSV formula injection*. | `FR-017` |
| **FEAT-010** | **Pengaturan & Mode Privasi** | P0 (Must) | Pengaturan tema (Dark default, Light, System), toggle mask nominal saldo (*Privacy Mode*), hari awal minggu, ambang peringatan anggaran default, status penyimpanan browser, dan tombol reset data berkonfirmasi ganda. | `FR-018`, `FR-019` |
| **FEAT-011** | **Backup & Restore JSON** | P0 (Must) | Ekspor seluruh 7 tabel ke JSON terversi + SHA-256 checksum; impor dengan validasi Zod ketat, verifikasi checksum, Restore Preview, dan pemilihan mode `Replace All` atau `Merge`. | `FR-020`, `FR-021`, `FR-022` |
| **FEAT-012** | **PWA Installable & Offline Experience** | P0 (Must) | Web App Manifest, Service Worker caching untuk app shell, indikator status online/offline, banner pembaruan SW, serta halaman fallback `/offline`. | `PWA-001` s.d. `PWA-007` |
| **FEAT-013** | **Website Publik & Landing Page SEO** | P0 (Must) | Landing page di `/` (13 seksi), halaman `/features`, `/about`, `/privacy`, navigasi terpisah, CTA `"Open My Finance"` menuju `/app`, sitemap, robots.txt, dan Open Graph. | `FR-025`, `FR-026`, `FR-027`, `NFR-011` |

---

## 7. Kriteria Penerimaan Fungsional Tingkat Produk

1. **Zero Network Data Leakage**: Seluruh fitur dari `FEAT-001` hingga `FEAT-011` beroperasi tanpa satu pun panggilan API backend; hanya `FEAT-012` yang berinteraksi dengan cache aset statis dari origin Vercel.
2. **Konsistensi Angka Lintas Halaman**: Nominal total pengeluaran bulan `M` di Dashboard (`FEAT-001`), ringkasan filter di Transaksi (`FEAT-003`), agregasi kategori di Anggaran (`FEAT-005`), grafik Analitik (`FEAT-008`), dan Laporan (`FEAT-009`) selalu menghasilkan angka yang identik.
3. **Keterpulihan Penuh**: Pengguna yang menghapus seluruh datanya setelah melakukan Backup JSON dapat memulihkan kondisi awal 100% tanpa kehilangan kategori, budget, target, maupun histori transaksi.

---

## 8. Kebutuhan Pengalaman Pengguna (*UX Requirements*)

1. **Mobile-First Ergonomics**: Tombol aksi tambah transaksi utama (*Primary FAB / Quick Action*) mudah dijangkau ibu jari pada layar 360px–430px; target sentuh minimum `44×44 px`.
2. **Kejelasan Angka Finansial**: Seluruh nilai IDR wajib menggunakan `tabular-nums`, pemisah ribuan titik (`.`), simbol `Rp`, serta perbedaan warna dan tanda (`+`/`-`) yang tidak hanya mengandalkan warna saja (aksesibel bagi buta warna).
3. **Umpan Balik Seketika**: Operasi penyimpanan lokal harus memberikan umpan balik visual (toast/snackbar atau pembaruan UI langsung) dalam ≤ 100 ms pada kondisi normal, dengan *undo* atau konfirmasi jelas untuk aksi destruktif.
4. **Empty, Loading, dan Error States Lengkap**: Setiap halaman tidak boleh menampilkan layar kosong tanpa konteks; sertakan ilustrasi/ikon, penjelasan singkat dalam Bahasa Indonesia yang santai-profesional, dan satu aksi lanjutan (*CTA*).
5. **Mode Gelap Default dengan Pilihan Terang**: Tema gelap (*navy-slate* `#0B1220` dengan aksen *emerald* `#10B981`) menjadi default sesuai identitas *premium fintech*, dengan peralihan ke mode terang yang dikalibrasi kontrasnya (lihat [STYLING.md](../04-design/STYLING.md)).

---

## 9. Metrik Produk (Berbasis Verifikasi Lokal & Kualitas, Tanpa Telemetri)

Karena Finora melarang pelacakan analitik jarak jauh (`PRIVACY.md`), metrik produk dievaluasi melalui pengujian lokal dan audit build sebelum rilis:
- **First Contentful Paint (FCP)** pada simulasi mobile 4G: `< 1,8 detik`.
- **Waktu Respons CRUD IndexedDB** untuk 5.000 record transaksi: `< 150 ms` untuk agregasi dashboard bulan aktif.
- **Skor Lighthouse** (Produksi Vercel): Performance `>= 90`, Accessibility `>= 95`, Best Practices `>= 95`, PWA installable terverifikasi.
- **Tingkat Keberhasilan Offline**: 100% rute inti tetap dapat dibuka dan dimutasi saat DevTools disetel ke *Offline*.

---

## 10. Definisi Minimum Viable Product (MVP)

MVP Finora dianggap siap rilis publik apabila seluruh fitur berprioritas **P0 (Must)** (`FEAT-001`, `FEAT-002`, `FEAT-003`, `FEAT-004`, `FEAT-005`, `FEAT-009`, `FEAT-010`, `FEAT-011`, `FEAT-012`) dan fitur **P1 (Should)** inti (`FEAT-006`, `FEAT-007`, `FEAT-008`) terimplementasi penuh sesuai spesifikasi halaman pada [PAGE_SPECIFICATIONS.md](../04-design/PAGE_SPECIFICATIONS.md), lulus seluruh kasus uji P0/P1 pada [TEST_CASES.md](../08-testing/TEST_CASES.md), serta lolos audit keamanan & deployment pada [RELEASE_CHECKLIST.md](../09-deployment/RELEASE_CHECKLIST.md).

---

## 11. Peluang Pengembangan Masa Depan (*Future Opportunities*, Pasca-MVP)

1. **V2 — Multi-Dompet & Transfer Antar-Akun**: Pencatatan rekening bank, dompet tunai, dan e-wallet terpisah beserta transaksi transfer netral yang tidak dihitung sebagai pemasukan/pengeluaran.
2. **V2 — Keamanan Kunci Layar & Enkripsi Opsional**: PIN/Passcode lokal atau WebAuthn lokal untuk mengunci antarmuka, plus opsi backup JSON terenkripsi AES-GCM berbasis passphrase pengguna.
3. **V3 — Multi-Mata Uang & Sub-Kategori**: Dukungan mata uang asing dengan kurs manual/snapshot per transaksi.
4. **V3 — Ekspor PDF & Impor Mutasi CSV Bank**: Parser CSV lokal di browser untuk membantu impor catatan dari file CSV pengguna.

---

## Dokumen Terkait
- [USER_STORIES.md](./USER_STORIES.md) — Daftar lengkap user stories dan kriteria Given/When/Then.
- [USE_CASES.md](./USE_CASES.md) — Alur utama, alternatif, dan skenario error setiap interaksi inti.
- [REQUIREMENTS.md](../02-requirements/REQUIREMENTS.md) — Spesifikasi kebutuhan bernomor unik.
