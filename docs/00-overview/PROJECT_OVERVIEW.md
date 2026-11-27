# Project Overview — Finora

**Versi Dokumen**: 1.0.0  
**Status**: Disetujui sebagai Baseline Perencanaan  
**Tagline**: *Your Money, Your Control.*  
**Bahasa Utama Produk**: Bahasa Indonesia (`id-ID`)  
**Mata Uang Default**: Indonesian Rupiah (`IDR`)

---

## 1. Pengenalan Proyek

**Finora** adalah aplikasi web manajemen keuangan pribadi (*Personal Finance Management*) yang dirancang sebagai **Progressive Web Application (PWA)** dengan arsitektur **Local-First** dan pengalaman **Offline-First**. Finora memungkinkan individu mencatat pemasukan dan pengeluaran harian, mengatur anggaran bulanan per kategori, memantau target tabungan (*financial goals*), mengelola transaksi berulang (*recurring transactions*), serta menganalisis perilaku keuangan melalui visualisasi data yang bersih dan mudah dipahami.

Berbeda dari aplikasi keuangan konvensional yang mewajibkan pendaftaran akun dan menyimpan data transaksi pengguna di server pihak ketiga, Finora menempatkan **browser pengguna sebagai satu-satunya penyimpan data**. Seluruh catatan keuangan disimpan secara lokal di IndexedDB melalui Dexie.js. Vercel berperan murni sebagai platform *hosting* dan distribusi aset aplikasi (*application shell* dan berkas statis), tanpa pernah menerima, memproses, atau menyimpan data finansial pengguna.

Dokumen ini menjadi titik masuk konseptual bagi tim pengembang, analis bisnis, desainer UI/UX, peninjau keamanan, dan *AI coding agent*. Untuk navigasi lengkap seluruh paket dokumentasi, lihat [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md).

---

## 2. Visi Produk

> **Memberdayakan setiap individu di Indonesia untuk mencatat, memahami, dan mengendalikan keuangan pribadi mereka secara akurat dan bebas gangguan—tanpa mengorbankan privasi, kepemilikan data, maupun aksesibilitas saat luring.**

Visi tersebut bertumpu pada tiga janji produk utama:
1. **Kendali Penuh di Tangan Pengguna**: Tidak ada *lock-in* platform, tidak ada kewajiban login, dan data dapat diekspor kapan saja dalam format JSON terstruktur maupun CSV.
2. **Kecepatan & Ketersediaan Offline**: Membuka aplikasi dan mencatat transaksi terasa instan seperti aplikasi native, baik saat terhubung ke internet maupun ketika berada di area tanpa sinyal.
3. **Kejelasan Finansial Berbasis Data Lokal**: Perhitungan saldo, tingkat tabungan (*savings rate*), pemakaian anggaran, dan proyeksi target keuangan dilakukan secara deterministik dan transparan langsung di perangkat pengguna.

---

## 3. Pernyataan Masalah (*Problem Statement*)

Individu yang ingin membangun kebiasaan mencatat keuangan sering menghadapi hambatan struktural berikut:

| No | Masalah Utama | Dampak Terhadap Pengguna | Respons Desain Finora |
|---|---|---|---|
| 1 | **Risiko Privasi & Pengumpulan Data** | Banyak aplikasi keuangan gratis mengumpulkan riwayat transaksi ke server cloud untuk profil iklan atau analitik pihak ketiga. | Nol transmisi data finansial ke server; tidak ada tracking analitik; 100% penyimpanan lokal di IndexedDB. |
| 2 | **Friksi Onboarding & Login** | Keharusan membuat akun, verifikasi email/OTP, dan sinkronisasi awal membuat pengguna enggan mulai mencatat. | Akses langsung (*zero-signup*) ke dashboard pada kunjungan pertama dengan kategori default siap pakai. |
| 3 | **Ketergantungan Koneksi Internet** | Aplikasi berbasis server melambat atau gagal menyimpan saat pengguna berada di transportasi umum, basement, atau jaringan tidak stabil. | Arsitektur Offline-First via Service Worker + IndexedDB memastikan seluruh fitur inti bekerja tanpa internet. |
| 4 | **Ketidakjelasan Pemisahan Saldo vs Tabungan** | Beberapa aplikasi mencampur alokasi tabungan ke dalam pengeluaran atau gagal membedakan saldo total dari saldo bebas pakai. | Pemisahan tegas antara `NetBalance`, `TotalAllocatedSavings` (earmark target), dan `AvailableBalance` tanpa *double counting*. |
| 5 | **Ketiadaan Portabilitas Data** | Pengguna terjebak di satu aplikasi karena tidak ada mekanisme ekspor/impor penuh yang dapat diverifikasi. | Fitur Backup JSON berversi dengan checksum SHA-256, pratinjau restore, dan ekspor laporan CSV. |

---

## 4. Tujuan Proyek

1. **Tujuan Produk**: Menyediakan aplikasi PWA manajemen keuangan pribadi yang siap dipasang (*installable*) di desktop dan seluler dengan waktu muat cepat dan antarmuka modern bertema *fintech* minimalis.
2. **Tujuan Fungsional**: Menghadirkan manajemen transaksi, kategori, anggaran bulanan, target keuangan, transaksi berulang, analitik interaktif, laporan CSV, serta *backup/restore* JSON yang terintegrasi penuh.
3. **Tujuan Keamanan & Privasi**: Menjamin tidak adanya komunikasi data keuangan ke server eksternal, validasi skema ketat di batas input/impor (Zod), serta perlindungan XSS dan HTTP security headers di Vercel.
4. **Tujuan Rekayasa**: Menyediakan spesifikasi arsitektur, aturan bisnis, desain sistem UI/UX, rencana pengujian, dan panduan agen pengkodean yang bebas ambiguitas sehingga implementasi dapat dijalankan bertahap secara konsisten.

---

## 5. Target Pengguna

1. **Mahasiswa**: Mengelola uang saku, kos, makan, dan tabungan jangka pendek dengan kuota internet terbatas.
2. **Karyawan**: Memantau alokasi gaji bulanan, tagihan rutin, rasio tabungan, dan target dana darurat.
3. **Pekerja Lepas (*Freelancer*)**: Mencatat pemasukan tidak tetap, memisahkan arus kas masuk/keluar, dan mengevaluasi tren bulanan.
4. **Individu Pengelola Keuangan Pribadi**: Siapa saja yang membutuhkan pencatatan kas pribadi yang cepat dan rapi.
5. **Pengguna Peduli Privasi (*Privacy-Conscious Users*)**: Pengguna yang menolak menyimpan catatan keuangan pribadinya di database cloud pihak ketiga.

Detail persona dan perjalanan pengguna dibahas pada [PRD.md](../01-product/PRD.md).

---

## 6. Prinsip Inti (*Core Principles*)

| Prinsip | Penjabaran Operasional |
|---|---|
| **1. Privacy First** | Zero telemetry, zero third-party analytics, zero tracking cookies, dan nol pengiriman data transaksi ke jaringan. |
| **2. Local-First** | IndexedDB (`FinoraDB` via Dexie.js) adalah satu-satunya sumber kebenaran data pengguna di runtime. |
| **3. Offline-First** | *Application shell* di-cache oleh Service Worker; seluruh operasi CRUD, perhitungan, dan grafik berjalan penuh tanpa koneksi. |
| **4. User Data Ownership** | Pengguna bebas mengekspor seluruh basis data (JSON), mengekspor ringkasan transaksi (CSV), atau menghapus seluruh data lokal kapan saja. |
| **5. Mobile-First** | Dirancang pertama kali untuk ergonomi layar ponsel (navigasi bawah, target sentuh minimal `44×44 px`, entri transaksi cepat), lalu diskalakan ke tablet dan desktop. |
| **6. Financial Calculation Accuracy** | Seluruh nominal IDR disimpan sebagai integer aman (`SafeInteger`), tanggal bisnis memakai format `YYYY-MM-DD` bebas pergeseran zona waktu, dan rumus diuji unit test. |
| **7. Maintainable Architecture** | Pemisahan jelas antara UI, *client-side service layer*, *pure financial domain calculators*, skema validasi Zod, dan repositori Dexie.js. |
| **8. Accessibility** | Kepatuhan WCAG 2.1 Level AA untuk kontras warna (mode gelap & terang terkalibrasi), navigasi keyboard, label ARIA, dan `tabular-nums`. |
| **9. Production-Oriented Engineering** | TypeScript strict mode, pengujian berlapis, CSP & security headers terdokumentasi, dan checklist rilis Vercel yang dapat diaudit. |

---

## 7. Ruang Lingkup (*Scope*)

### 7.1 Dalam Ruang Lingkup MVP (Rilis v1.0)
- **Dashboard Keuangan**: Ringkasan Saldo Bersih, Saldo Tersedia, Pemasukan/Pengeluaran bulan berjalan, Rasio Tabungan, peringatan anggaran, progres target, dan grafik arus kas.
- **Manajemen Transaksi**: Tambah, ubah, hapus (dengan konfirmasi/undo), pencarian, filter (rentang tanggal, tipe, kategori, metode pembayaran), dan pengurutan.
- **Manajemen Kategori**: Kategori sistem bawaan (pemasukan & pengeluaran), tambah/ubah kategori kustom, arsip (*soft-archive*), dan pemindahan kategori (*reassignment*) sebelum penghapusan.
- **Anggaran Bulanan (*Budgets*)**: Penetapan batas pengeluaran per kategori per bulan (`YYYY-MM`), ambang peringatan yang dapat dikonfigurasi (default 80%), dan pelacakan realisasi otomatis.
- **Target Keuangan (*Financial Goals*)**: Pembuatan target tabungan, pencatatan setoran/penarikan dana (*earmark*) tanpa mengganggu total pengeluaran riil, serta estimasi kebutuhan tabungan bulanan bila memiliki tenggat waktu.
- **Transaksi Berulang (*Recurring Transactions*)**: Aturan harian, mingguan, bulanan (dengan *end-of-month clamping*), dan tahunan yang dimaterialisasikan secara lokal saat aplikasi dibuka.
- **Analitik & Laporan**: Grafik Recharts (tren arus kas, proporsi kategori, perbandingan periode, realisasi vs anggaran) serta ekspor CSV ramah Excel/Sheets.
- **Pengaturan & Backup/Restore**: Preferensi tema (Dark default / Light / System), mode privasi sensor saldo (*masking*), ekspor JSON dengan checksum SHA-256, pratinjau impor, dan mode *Replace* atau *Merge*.
- **PWA & Offline**: Web App Manifest, Service Worker, instalasi lintas platform, halaman fallback `/offline`, dan penanganan kuota/kesalahan IndexedDB.

### 7.2 Di Luar Ruang Lingkup MVP (*Out-of-Scope*)
Fitur berikut **secara eksplisit dikecualikan** dari MVP agar tetap sesuai prinsip tanpa-backend dan batas kompleksitas v1.0 (dibahas sebagai peluang masa depan di [PRD.md](../01-product/PRD.md) dan [ROADMAP.md](../10-planning/ROADMAP.md)):
- Registrasi pengguna, login, autentikasi OAuth, atau manajemen akun server.
- Sinkronisasi cloud lintas perangkat, database jarak jauh, atau kolaborasi multi-pengguna.
- Integrasi Open Banking, mutasi rekening otomatis, scraping e-wallet, atau API keuangan eksternal.
- Manajemen multi-dompet/rekening dan transaksi transfer antar-dompet (direncanakan untuk V2).
- Dukungan multi-mata uang dan konversi kurs otomatis (MVP fokus penuh pada `IDR`).
- Pemindaian struk OCR berbasis AI/server atau fitur investasi/saham/kripto.
- Enkripsi *at-rest* berbasis kata sandi pengguna di dalam IndexedDB (dipertimbangkan untuk ekspansi pasca-MVP karena implikasi pemulihan kunci).

---

## 8. Batasan Produk (*Product Constraints*)

1. **Tanpa Backend**: Tidak boleh ada API route server yang menyimpan data pengguna, database eksternal, maupun sesi autentikasi.
2. **Ketergantungan Penyimpanan Browser**: Data berada di ruang asal (*origin*) browser pada perangkat spesifik. Menghapus data situs/browser atau berpindah perangkat tanpa melakukan backup JSON akan menyebabkan data tidak tersedia pada perangkat baru.
3. **Kapasitas Kuota Browser**: Penyimpanan tunduk pada kuota IndexedDB browser masing-masing perangkat (lihat [OFFLINE_BEHAVIOR.md](../06-pwa/OFFLINE_BEHAVIOR.md)).
4. **Batas Eksekusi Latar Belakang**: Karena tidak ada *server cron*, transaksi berulang dan evaluasi notifikasi dalam aplikasi hanya diproses saat aplikasi aktif dibuka oleh pengguna.
5. **Stack Teknologi Tetap**: Next.js App Router, React, TypeScript Strict Mode, Tailwind CSS, shadcn/ui, Lucide Icons, IndexedDB + Dexie.js, Zod, Recharts, `date-fns`, `Intl.NumberFormat`, PWA, GitHub, dan Vercel (lihat [SYSTEM_ARCHITECTURE.md](../03-architecture/SYSTEM_ARCHITECTURE.md)).

---

## Dokumen Terkait
- [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) — Peta seluruh dokumen dan aturan *source of truth*.
- [GLOSSARY.md](./GLOSSARY.md) — Kamus istilah bisnis, keuangan, dan teknis.
- [BRD.md](../01-product/BRD.md) — Kebutuhan dan justifikasi bisnis.
- [PRD.md](../01-product/PRD.md) — Spesifikasi produk, persona, dan ruang lingkup fitur.
