# Glossary — Finora

**Versi Dokumen**: 1.0.0  
**Tujuan**: Menyeragamkan seluruh definisi istilah bisnis, keuangan, produk, dan teknis di seluruh paket dokumentasi dan implementasi Finora.

---

## 1. Istilah Bisnis & Keuangan

| Istilah | Definisi Resmi dalam Konteks Finora | Referensi |
|---|---|---|
| **Pemasukan (*Income*)** | Arus kas masuk yang menambah `NetBalance` pengguna pada tanggal tertentu (misalnya gaji, honorarium proyek, bonus, uang saku). Disimpan dengan `type = 'income'` dan `amount > 0`. | [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md) |
| **Pengeluaran (*Expense*)** | Arus kas keluar riil yang mengurangi `NetBalance` pengguna pada tanggal tertentu (misalnya makan, transportasi, tagihan). Disimpan dengan `type = 'expense'` dan `amount > 0`. | [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md) |
| **Arus Kas Bersih (*Net Cashflow*)** | Selisih antara total pemasukan dan total pengeluaran dalam **suatu periode waktu tertentu** (`TotalIncome(P) - TotalExpense(P)`). | [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md) |
| **Saldo Bersih (*Net Balance*)** | Akumulasi total seluruh pemasukan dikurangi total seluruh pengeluaran sejak awal pencatatan hingga saat ini (`TotalIncome(all) - TotalExpense(all)`). | [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md) |
| **Dana Teralokasi (*Allocated Savings / Earmark*)** | Total nominal yang telah disisihkan ke dalam target keuangan (`financialGoals`) berstatus `active` atau `completed` melalui catatan `goalContributions`. Bukan merupakan transaksi pengeluaran riil. | [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md) |
| **Saldo Tersedia (*Available Balance*)** | Saldo bersih yang belum dialokasikan ke target keuangan mana pun (`NetBalance - TotalAllocatedSavings`). Membantu pengguna mengetahui sisa dana bebas pakai. | [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md) |
| **Rasio Tabungan (*Savings Rate*)** | Persentase sisa pemasukan yang tidak terpakai pada suatu periode: `((TotalIncome(P) - TotalExpense(P)) / TotalIncome(P)) * 100`. Bernilai `null` (ditampilkan `"—"`) bila `TotalIncome(P) = 0`. | [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md) |
| **Anggaran Bulanan (*Monthly Budget*)** | Batas maksimal pengeluaran (`limitAmount`) yang ditetapkan pengguna untuk satu kategori pengeluaran spesifik pada satu bulan kalender (`YYYY-MM`). | [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md) |
| **Ambang Peringatan Anggaran (*Warning Threshold*)** | Persentase pemakaian anggaran (rentang `50%..95%`, default `80%`) yang memicu status visual `warning` sebelum mencapai batas 100%. | [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md) |
| **Target Keuangan (*Financial Goal*)** | Tujuan tabungan dengan nominal target (`targetAmount`), progres terkumpul (`currentAmount`), dan tenggat opsional (`deadline`). | [DATABASE_SCHEMA.md](../03-architecture/DATABASE_SCHEMA.md) |
| **Kontribusi Target (*Goal Contribution*)** | Catatan penyisihan dana (`amount > 0`) atau penarikan kembali alokasi dana (`amount < 0`) pada suatu target keuangan tanpa menciptakan duplikasi pada pengeluaran riil. | [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md) |
| **Transaksi Berulang (*Recurring Transaction*)** | Templat aturan penjadwalan otomatis lokal (harian, mingguan, bulanan, tahunan) yang menghasilkan record `transactions` secara idempoten saat jatuh tempo. | [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md) |
| **Nominal Integer IDR** | Representasi seluruh nilai uang Rupiah sebagai bilangan bulat aman JavaScript (`Number.isSafeInteger`), tanpa pembulatan desimal sen. | [DATA_DICTIONARY.md](../03-architecture/DATA_DICTIONARY.md) |

---

## 2. Istilah Produk & UX

| Istilah | Definisi Resmi dalam Konteks Finora | Referensi |
|---|---|---|
| **Zero-Signup Onboarding** | Pola akses aplikasi langsung tanpa formulir pendaftaran/login; kunjungan pertama otomatis menyiapkan kategori bawaan dan pengaturan default. | [PRD.md](../01-product/PRD.md) |
| **Masking Saldo (*Privacy Toggle*)** | Fitur menyembunyikan angka saldo dan nominal di layar (misalnya menjadi `Rp •••••••`) dengan satu klik untuk mencegah *shoulder surfing* di tempat umum. | [COMPONENTS.md](../04-design/COMPONENTS.md) |
| **Soft-Archive Kategori** | Penonaktifan kategori (`isArchived = true`) agar tidak muncul pada pilihan formulir transaksi baru, namun tetap menjaga integritas label pada transaksi historis. | [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md) |
| **Category Reassignment** | Proses memindahkan seluruh referensi transaksi, anggaran, dan aturan berulang dari kategori yang akan dihapus ke kategori pengganti bertipe sama dalam satu transaksi atomik. | [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md) |
| **Restore Preview** | Tahap pratinjau sebelum impor JSON dijalankan, menampilkan jumlah record, rentang tanggal, validasi checksum, serta potensi konflik data. | [BACKUP_RESTORE.md](../05-security/BACKUP_RESTORE.md) |
| **Mode Replace vs Merge** | Dua strategi pemulihan backup: *Replace* menghapus seluruh data lokal saat ini lalu menggantinya dengan isi backup; *Merge* menggabungkan data baru dan menyelesaikan konflik ID/kunci unik secara terkontrol. | [BACKUP_RESTORE.md](../05-security/BACKUP_RESTORE.md) |
| **Application Shell** | Kerangka antarmuka utama (navigasi sidebar/bawah, header, layout dasar, aset statis JS/CSS) yang di-cache agar aplikasi terbuka instan saat luring. | [PWA_STRATEGY.md](../06-pwa/PWA_STRATEGY.md) |
| **Tabular Numerals (`tabular-nums`)** | Fitur tipografi di mana setiap digit angka memiliki lebar horizontal seragam sehingga kolom nominal uang dan tabel sejajar rapi secara vertikal. | [STYLING.md](../04-design/STYLING.md) |

---

## 3. Istilah Arsitektur & Teknis

| Istilah | Definisi Resmi dalam Konteks Finora | Referensi |
|---|---|---|
| **Local-First Architecture** | Paradigma arsitektur di mana penyimpanan utama dan pemrosesan logika bisnis berjalan sepenuhnya di perangkat klien, tanpa ketergantungan jaringan untuk membaca/menulis data. | [ADR-001](../03-architecture/ADR/ADR-001-local-first-architecture.md) |
| **Offline-First Experience** | Desain perilaku aplikasi yang mengasumsikan kondisi offline adalah skenario normal; aset aplikasi dilayani dari Cache Storage dan data dari IndexedDB. | [OFFLINE_BEHAVIOR.md](../06-pwa/OFFLINE_BEHAVIOR.md) |
| **IndexedDB** | Sistem basis data transaksional NoSQL berorientasi objek bawaan browser web yang mendukung indeks dan kapasitas penyimpanan besar secara asinkron. | [ADR-002](../03-architecture/ADR/ADR-002-indexeddb-dexie.md) |
| **Dexie.js** | Pustaka pembungkus (*wrapper*) TypeScript untuk IndexedDB yang menyediakan API transaksi atomik, *compound index*, migrasi skema berversi, dan *live query*. | [DATABASE_SCHEMA.md](../03-architecture/DATABASE_SCHEMA.md) |
| **`FinoraDB`** | Nama kanonik basis data IndexedDB milik Finora yang terdiri atas 7 tabel (`transactions`, `categories`, `budgets`, `financialGoals`, `goalContributions`, `recurringTransactions`, `appSettings`). | [DATABASE_SCHEMA.md](../03-architecture/DATABASE_SCHEMA.md) |
| **Zod** | Pustaka validasi skema TypeScript-first yang digunakan pada batas input UI, batas service layer, dan validasi ketat berkas impor JSON. | [CODING_STANDARDS.md](../07-development/CODING_STANDARDS.md) |
| **Client-Side Service Layer** | Lapisan modul TypeScript internal (`src/services/*`) yang mengorkestrasi validasi, aturan bisnis, dan transaksi Dexie.js; menggantikan peran REST API backend. | [API_DESIGN.md](../03-architecture/API_DESIGN.md) |
| **Opportunistic Materialization** | Mekanisme evaluasi dan pembuatan transaksi dari aturan `recurringTransactions` yang jatuh tempo setiap kali aplikasi dibuka atau rute terkait diakses, dengan jaminan idempotensi. | [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md) |
| **End-of-Month Clamping** | Penyesuaian tanggal berulang bulanan ketika `anchorDay` (misal 31) melebihi jumlah hari pada bulan target (misal 28/29 Februari), sehingga dijepit ke hari terakhir bulan tersebut tanpa mengubah `anchorDay` asli. | [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md) |
| **ISO Local Calendar Date (`YYYY-MM-DD`)** | Format string tanggal kalender lokal tanpa komponen jam dan zona waktu (contoh: `2026-11-27`) untuk mencegah pergeseran hari akibat perbedaan offset UTC. | [DATA_DICTIONARY.md](../03-architecture/DATA_DICTIONARY.md) |
| **ISO 8601 UTC Timestamp** | Format waktu presisi UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`) khusus untuk metadata audit sistem (`createdAt`, `updatedAt`, `exportedAt`). | [DATA_DICTIONARY.md](../03-architecture/DATA_DICTIONARY.md) |
| **PWA (Progressive Web Application)** | Aplikasi web yang menggunakan Web App Manifest dan Service Worker sehingga dapat diinstal ke home screen/desktop dan berjalan luring. | [PWA_STRATEGY.md](../06-pwa/PWA_STRATEGY.md) |
| **Service Worker (SW)** | Skrip worker browser yang berjalan di latar belakang terpisah dari DOM utama untuk mencegat permintaan jaringan aset statis dan menyediakan cache offline. | [PWA_STRATEGY.md](../06-pwa/PWA_STRATEGY.md) |
| **CSP (Content Security Policy)** | Header keamanan HTTP (`Content-Security-Policy`) yang membatasi sumber skrip, gaya, font, koneksi, dan worker yang boleh dieksekusi browser untuk memitigasi XSS. | [SECURITY.md](../05-security/SECURITY.md) |
| **SHA-256 Checksum** | Nilai ringkasan kriptografis 256-bit yang dihitung melalui Web Crypto API (`crypto.subtle.digest`) atas `payload` JSON backup untuk mendeteksi kerusakan berkas (*bit-rot*) atau modifikasi tidak lengkap. **Catatan**: Checksum integritas bukan mekanisme enkripsi/tanda tangan rahasia. | [BACKUP_RESTORE.md](../05-security/BACKUP_RESTORE.md) |
| **Single Source of Truth (SSOT)** | Dokumen atau definisi kanonik yang menjadi acuan resmi apabila terdapat penafsiran ganda antar dokumen. | [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) |

---

## 4. Konvensi Penulisan Simbol & ID

| Awalan ID | Domain Dokumen | Lokasi Definisi |
|---|---|---|
| `BR-XXX` | Business Requirement | [BRD.md](../01-product/BRD.md) |
| `FEAT-XXX` | Product Feature | [PRD.md](../01-product/PRD.md) |
| `US-XXX` | User Story | [USER_STORIES.md](../01-product/USER_STORIES.md) |
| `UC-XXX` | Use Case | [USE_CASES.md](../01-product/USE_CASES.md) |
| `FR-XXX` | Functional Requirement | [REQUIREMENTS.md](../02-requirements/REQUIREMENTS.md) |
| `NFR-XXX` | Non-Functional Requirement | [REQUIREMENTS.md](../02-requirements/REQUIREMENTS.md) |
| `SEC-XXX` | Security Requirement | [REQUIREMENTS.md](../02-requirements/REQUIREMENTS.md) |
| `PWA-XXX` | PWA Requirement | [REQUIREMENTS.md](../02-requirements/REQUIREMENTS.md) |
| `DATA-XXX` | Data Requirement | [REQUIREMENTS.md](../02-requirements/REQUIREMENTS.md) |
| `RULE-XXX` | Financial Business Rule | [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md) |
| `ADR-XXX` | Architecture Decision Record | [ADR-001](../03-architecture/ADR/ADR-001-local-first-architecture.md) |
| `EPIC-XX` / `STORY-XXX` / `TASK-XXX` | Backlog Perencanaan | [BACKLOG.md](../10-planning/BACKLOG.md) |
| `TC-XXX` | Test Case | [TEST_CASES.md](../08-testing/TEST_CASES.md) |
