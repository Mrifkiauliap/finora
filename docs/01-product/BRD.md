# Business Requirements Document (BRD) — Finora

**Versi Dokumen**: 1.0.0  
**Status**: Baseline Disetujui  
**Proyek**: Finora (*Your Money, Your Control*)  
**Dokumen Terkait**: [PROJECT_OVERVIEW.md](../00-overview/PROJECT_OVERVIEW.md) | [PRD.md](./PRD.md) | [REQUIREMENTS.md](../02-requirements/REQUIREMENTS.md) | [TRACEABILITY.md](../02-requirements/TRACEABILITY.md)

---

## 1. Ringkasan Eksekutif (*Executive Summary*)

**Finora** adalah inisiatif pembangunan aplikasi manajemen keuangan pribadi berbasis web dan Progressive Web Application (PWA) untuk pengguna berbahasa Indonesia dengan mata uang default Rupiah (`IDR`). Nilai pembeda inti Finora adalah komitmen **Privacy-First** dan **Local-First**: seluruh pencatatan transaksi, anggaran, target tabungan, transaksi berulang, dan analitik dieksekusi serta disimpan secara eksklusif di dalam browser pengguna menggunakan IndexedDB.

Dari sisi operasional dan biaya infrastruktur, arsitektur tanpa backend (*no-backend*) berarti Finora hanya memanfaatkan Vercel untuk mendistribusikan bundel aplikasi statis/klien melalui HTTPS tanpa mengoperasikan server basis data pengguna, layanan autentikasi, ataupun pemrosesan data keuangan terpusat. Pendekatan ini meminimalkan risiko kebocoran data terpusat sekaligus meniadakan kewajiban penyimpanan data pribadi di sisi penyelenggara hosting.

---

## 2. Latar Belakang Bisnis (*Business Background*)

Pengelolaan keuangan pribadi yang disiplin membutuhkan alat bantu yang dapat diakses setiap saat dengan hambatan serendah mungkin. Di sisi lain, kesadaran pengguna terhadap privasi data finansial meningkat, sementara banyak solusi manajemen keuangan modern mengharuskan pembuatan akun, sinkronisasi cloud, atau menghubungkan rekening bank untuk sekadar mencatat pengeluaran harian.

Finora hadir untuk mengisi ruang aplikasi keuangan pribadi yang:
1. Menghormati kedaulatan data pengguna secara arsitektural (bukan sekadar janji kebijakan privasi).
2. Tetap berfungsi penuh dalam kondisi koneksi internet lambat atau terputus (*offline-first*).
3. Tidak memerlukan biaya berlangganan infrastruktur basis data cloud untuk mendukung operasional MVP.

---

## 3. Definisi Masalah (*Problem Definition*)

1. **Hambatan Privasi dan Kepercayaan**: Pengguna enggan memasukkan rincian penghasilan, pengeluaran, dan kebiasaan belanja ke layanan yang menyimpan data di server pihak ketiga.
2. **Friksi Awal (*Onboarding Friction*)**: Proses registrasi, verifikasi OTP, dan konfigurasi awal yang panjang menurunkan minat pencatatan sejak hari pertama.
3. **Kegagalan Akses Luring**: Pencatatan transaksi paling sering terjadi di luar ruangan (pembayaran tunai, transportasi, makan) di mana konektivitas seluler tidak selalu stabil.
4. **Kurangnya Kontrol Portabilitas**: Pengguna membutuhkan cara terstruktur untuk mencadangkan (*backup*), memverifikasi keutuhan cadangan, dan memulihkan (*restore*) data antar-perangkat tanpa bergantung pada akun cloud.
5. **Ketidakakuratan Pencatatan Konvensional**: Pencatatan manual di catatan teks atau spreadsheet di ponsel tidak memberikan peringatan anggaran otomatis, proyeksi target tabungan, atau agregasi kategori yang konsisten.

---

## 4. Tujuan Bisnis (*Business Objectives*)

| Kode | Tujuan Bisnis | Cara Pencapaian |
|---|---|---|
| **OBJ-1** | Memastikan 100% kedaulatan dan privasi data keuangan pengguna | Penyimpanan eksklusif di IndexedDB lokal tanpa transmisi jaringan data finansial. |
| **OBJ-2** | Memaksimalkan adopsi awal tanpa hambatan registrasi | Pengalaman *zero-signup*; aplikasi siap mencatat transaksi dalam hitungan detik setelah dibuka pertama kali. |
| **OBJ-3** | Memberikan keandalan pencatatan di segala kondisi jaringan | Implementasi arsitektur PWA *Offline-First* dengan Service Worker dan caching *application shell*. |
| **OBJ-4** | Menjaga keakuratan laporan dan kesadaran finansial pengguna | Penerapan rumus akuntansi pribadi deterministik (pemasukan, pengeluaran, saldo tersedia, rasio tabungan, anggaran, target). |
| **OBJ-5** | Menekan kompleksitas dan biaya operasional hosting | Hosting statis/klien di Vercel tanpa backend, tanpa database cloud, dan tanpa layanan pihak ketiga berbayar. |

---

## 5. Pemangku Kepentingan (*Stakeholders*)

| Peran | Kepentingan Utama | Keterlibatan pada Dokumen |
|---|---|---|
| **Product Owner / Inisiator Proyek** | Kesesuaian visi *Privacy-First*, cakupan MVP realistis, kualitas pengalaman pengguna. | Penentu prioritas [PRD.md](./PRD.md) & [ROADMAP.md](../10-planning/ROADMAP.md). |
| **Pengguna Akhir (*End Users*)** | Kecepatan pencatatan, kejelasan angka IDR, keandalan offline, kemudahan backup/restore. | Terwakili oleh persona & [USER_STORIES.md](./USER_STORIES.md). |
| **Tim Pengembang / AI Coding Agent** | Spesifikasi teknis bebas ambiguitas, aturan bisnis eksplisit, standar kode jelas. | Pengguna [AGENT_BRIEF.md](../07-development/AGENT_BRIEF.md) & [SRS.md](../02-requirements/SRS.md). |
| **UI/UX Designer** | Identitas visual *premium fintech*, konsistensi komponen, aksesibilitas gelap/terang. | Pengguna [STYLING.md](../04-design/STYLING.md) & [PAGE_SPECIFICATIONS.md](../04-design/PAGE_SPECIFICATIONS.md). |
| **QA & Security Reviewer** | Kriteria penerimaan terukur, keamanan sisi klien, HTTP headers, integritas data. | Pengguna [TESTING.md](../08-testing/TESTING.md) & [SECURITY.md](../05-security/SECURITY.md). |

---

## 6. Target Audiens

1. **Mahasiswa**: Membutuhkan alat pencatatan cepat untuk uang saku, kebutuhan kuliah, makan, dan tabungan sederhana tanpa kuota berlebih.
2. **Karyawan**: Membutuhkan pemantauan arus kas bulanan dari gaji, kontrol anggaran per pos pengeluaran, dan pelacakan dana darurat.
3. **Freelancer**: Membutuhkan pemantauan arus kas yang fluktuatif, analisis tren pemasukan vs pengeluaran antar-bulan, dan ekspor CSV untuk rekap mandiri.
4. **Individu Pengelola Keuangan Pribadi**: Membutuhkan pengingat anggaran dan jadwal tagihan berulang agar tidak melewati batas belanja.
5. **Pengguna Peduli Privasi**: Memilih aplikasi *local-first* yang bebas pelacakan (*zero-analytics*) dan mudah diaudit perilaku jaringannya.

---

## 7. Kebutuhan Bisnis (*Business Requirements*)

Setiap kebutuhan bisnis di bawah memiliki ID unik (`BR-XXX`) yang diturunkan lebih lanjut ke fitur produk, kebutuhan perangkat lunak, tugas implementasi, dan kasus uji di [TRACEABILITY.md](../02-requirements/TRACEABILITY.md).

| ID | Kebutuhan Bisnis | Deskripsi & Rasional | Prioritas |
|---|---|---|---|
| **BR-001** | **Kepemilikan & Privasi Data Lokal Penuh** | Aplikasi wajib menyimpan seluruh catatan keuangan secara lokal di perangkat pengguna dan dilarang mengirimkan data keuangan ke server eksternal atau analitik pihak ketiga. | Must Have |
| **BR-002** | **Akses Langsung Tanpa Pendaftaran** | Pengguna wajib dapat langsung menggunakan seluruh fitur inti saat pertama kali membuka aplikasi tanpa registrasi, login, atau verifikasi eksternal. | Must Have |
| **BR-003** | **Pencatatan Arus Kas Harian yang Cepat** | Aplikasi wajib mendukung pencatatan, penyuntingan, penghapusan, pencarian, dan penyaringan transaksi pemasukan serta pengeluaran dalam mata uang IDR secara akurat. | Must Have |
| **BR-004** | **Pengorganisasian Kategori Fleksibel** | Aplikasi wajib menyediakan kategori default siap pakai sekaligus mengizinkan pengguna menambah, mengubah, mengarsipkan, atau memindahkan kategori tanpa merusak histori transaksi. | Must Have |
| **BR-005** | **Pengendalian Anggaran Bulanan** | Aplikasi wajib memungkinkan penetapan batas anggaran bulanan per kategori pengeluaran dan memberi sinyal visual dini saat mendekati atau melampaui batas. | Must Have |
| **BR-006** | **Perencanaan & Pemantauan Target Tabungan** | Aplikasi wajib memfasilitasi pelacakan target tabungan terpisah dari pengeluaran riil, sehingga pengguna mengetahui Saldo Tersedia vs Dana Teralokasi secara akurat. | Should Have |
| **BR-007** | **Otomatisasi Lokal Transaksi Berulang** | Aplikasi wajib mendukung penjadwalan transaksi rutin (seperti gaji, kos, langganan) yang tercatat otomatis di perangkat tanpa memerlukan server cron. | Should Have |
| **BR-008** | **Wawasan Visual & Ekspor Laporan** | Aplikasi wajib menyajikan grafik tren, komposisi kategori, ringkasan periode, serta ekspor CSV agar pengguna memahami perilaku keuangannya. | Must Have |
| **BR-009** | **Portabilitas & Pemulihan Data Mandiri** | Aplikasi wajib menyediakan ekspor backup JSON berversi dengan verifikasi integritas serta proses pratinjau dan restore yang aman untuk perpindahan perangkat atau pemulihan. | Must Have |
| **BR-010** | **Pengalaman PWA Offline-First & Responsif** | Aplikasi wajib dapat dipasang sebagai PWA di desktop/mobile dan beroperasi penuh secara luring dengan tata letak responsif dan aksesibel (Dark & Light mode). | Must Have |
| **BR-011** | **Website Publik Edukatif & Pemisahan Rute `/app`** | Finora wajib menyediakan website publik pengenalan produk (`/`, `/features`, `/about`, `/privacy`) dengan SEO lengkap yang terpisah dari workspace keuangan `/app` tanpa mengekspos data pribadi atau bergantung pada IndexedDB. | Must Have |

---

## 8. Aturan Bisnis Tingkat Tinggi (*High-Level Business Rules*)

Aturan bisnis tingkat tinggi berikut dirinci menjadi rumus dan batasan formal pada [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md):
1. **Satu Mata Uang Default di MVP**: Seluruh transaksi menggunakan IDR dalam bilangan bulat positif (`> 0`); format tampilan mengikuti standar lokal `id-ID`.
2. **Pemisahan Pemasukan dan Pengeluaran**: Tidak ada nominal negatif pada `transactions`; arah arus kas murni ditentukan oleh tipe transaksi.
3. **Anti-Double Counting pada Target Keuangan**: Menyisihkan uang ke target tabungan memengaruhi *Available Balance* melalui `goalContributions`, bukan dicatat sebagai pengeluaran baru.
4. **Tanggal Kalender Lokal Bebas Pergeseran Zona Waktu**: Tanggal transaksi menggunakan format `YYYY-MM-DD` sesuai kalender lokal pengguna.
5. **Integritas Referensi Kategori**: Transaksi historis tidak boleh kehilangan kategori; penghapusan kategori yang telah digunakan harus melalui pengalihan (*reassignment*) atau pengarsipan (*soft-archive*).

---

## 9. Batasan Bisnis (*Business Constraints*)

1. **Nol Anggaran Layanan Backend/Cloud**: Pengembangan dan deployment tidak boleh bergantung pada server API, database cloud, atau layanan berbayar pihak ketiga.
2. **Penghormatan Pembatasan Platform Hosting**: Vercel digunakan semata-mata sebagai platform penyaji aset aplikasi web via HTTPS.
3. **Ketiadaan Sinkronisasi Otomatis Antar-Perangkat**: Pemindahan data antar-perangkat pada versi MVP sepenuhnya mengandalkan alur manual ekspor/impor berkas backup JSON oleh pengguna.
4. **Batas Kepatuhan Privasi**: Aplikasi dilarang memuat Google Analytics, Meta Pixel, Sentry dengan payload data pengguna, atau skrip pelacak sejenis.

---

## 10. Manfaat yang Diharapkan (*Expected Benefits*)

- **Bagi Pengguna Akhir**: Kendali penuh atas privasi finansial, bebas biaya langganan, pencatatan tetap lancar tanpa internet, serta pemahaman arus kas dan disiplin anggaran yang lebih baik.
- **Bagi Pengembang & Pemelihara**: Arsitektur ringkas tanpa beban operasional server/basis data terpusat, permukaan serangan keamanan jauh lebih kecil dibanding sistem multi-tenant cloud, dan pemeliharaan kode yang terstruktur.

---

## 11. Kriteria Keberhasilan (*Success Criteria*)

Karena Finora tidak memakai telemetri/analitik eksternal (`BR-001`), keberhasilan rilis MVP diukur melalui kriteria verifikasi teknis dan kualitas produk yang dapat diaudit secara lokal serta saat rilis produksi:
1. **Kepatuhan Privasi 100%**: Inspeksi DevTools Network membuktikan 0 permintaan keluar yang membawa data transaksi, kategori, anggaran, maupun target pengguna.
2. **Ketepatan Perhitungan 100%**: Seluruh kasus uji rumus keuangan pada [TEST_CASES.md](../08-testing/TEST_CASES.md) lulus tanpa penyimpangan pembulatan atau kesalahan status.
3. **Keandalan Offline Penuh**: Setelah kunjungan awal, aplikasi dapat dibuka ulang dalam mode offline dan menjalankan CRUD transaksi, anggaran, target, analitik, serta ekspor CSV/JSON tanpa error.
4. **Integritas Backup/Restore**: Siklus penuh Export JSON → Hapus/Ubah Data → Restore Preview → Restore (Replace/Merge) memulihkan seluruh entitas secara identik dan menolak berkas yang dimodifikasi/rusak (checksum tidak cocok).
5. **Kesiapan PWA & Kualitas Hosting**: Skor Lighthouse PWA, Accessibility, dan Best Practices memenuhi ambang target pada [QA_CHECKLIST.md](../08-testing/QA_CHECKLIST.md), dan 8 security headers wajib aktif pada deployment Vercel.

---

## 12. Risiko dan Asumsi (*Risks and Assumptions*)

### 12.1 Asumsi
- Pengguna memakai browser modern yang mendukung IndexedDB, Service Worker, `Intl.NumberFormat`, dan Web Crypto API (Chrome/Edge/Firefox/Safari versi terkini).
- Pengguna memahami bahwa penghapusan data browser secara manual tanpa backup eksternal akan menghilangkan data lokal (dimitigasi dengan pengingat backup berkala di UI).

### 12.2 Risiko Bisnis & Mitigasi

| Risiko | Dampak | Probabilitas | Mitigasi |
|---|---|---|---|
| **Kehilangan data akibat pengguna membersihkan cache/storage browser atau ganti perangkat** | Tinggi | Sedang | Pengingat backup berkala berdasarkan `lastBackupAt`, kemudahan ekspor JSON satu klik, dan edukasi jelas di halaman Backup & Privacy. |
| **Browser melakukan *storage eviction* pada perangkat penyimpanan penuh** | Sedang | Rendah–Sedang | Meminta `navigator.storage.persist()` (jika didukung browser) saat instalasi/penggunaan aktif dan menampilkan indikator status penyimpanan di Settings. |
| **Kesalahpahaman pengguna terhadap perbedaan Saldo Bersih dan Saldo Tersedia** | Sedang | Sedang | Label UI yang eksplisit, tooltip/info singkat di Dashboard & Goals, serta dokumentasi jelas pada [PAGE_SPECIFICATIONS.md](../04-design/PAGE_SPECIFICATIONS.md). |
| **Inkonsistensi implementasi fitur karena tidak ada backend terpusat** | Sedang | Rendah | Seluruh aturan bisnis dan skema Zod dikunci terpusat dalam lapisan domain/service yang diuji ketat sebelum rilis. |

---

## Dokumen Terkait
- [PRD.md](./PRD.md) — Penjabaran fitur produk, persona, dan prioritas MVP.
- [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md) — Rumus keuangan dan batasan operasional.
- [PRIVACY.md](../05-security/PRIVACY.md) — Komitmen privasi dan batasan penyimpanan browser.
