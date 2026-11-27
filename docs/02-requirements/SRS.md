# Software Requirements Specification (SRS) — Finora

**Versi Dokumen**: 1.0.0  
**Status**: Baseline Disetujui  
**Standar Rujukan**: Struktur adaptasi IEEE 830 / ISO/IEC/IEEE 29148  
**Dokumen Terkait**: [REQUIREMENTS.md](./REQUIREMENTS.md) | [BUSINESS_RULES.md](./BUSINESS_RULES.md) | [TRACEABILITY.md](./TRACEABILITY.md) | [SYSTEM_ARCHITECTURE.md](../03-architecture/SYSTEM_ARCHITECTURE.md)

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
Dokumen *Software Requirements Specification (SRS)* ini menetapkan spesifikasi perangkat lunak secara menyeluruh untuk aplikasi **Finora** (*Personal Finance Management*). Dokumen ini menjembatani kebutuhan produk pada [PRD.md](../01-product/PRD.md) menjadi spesifikasi teknis sistem klien, batasan antarmuka eksternal, kebutuhan data, serta atribut kualitas yang harus dipenuhi sebelum rilis MVP.

### 1.2 Ruang Lingkup Sistem
Finora adalah aplikasi web progresif (*Progressive Web Application*) berbasis Next.js App Router, React, dan TypeScript Strict Mode yang berjalan seluruhnya di sisi klien untuk mengelola data keuangan pribadi dalam mata uang `IDR`. Seluruh persistensi data dilakukan pada IndexedDB (`FinoraDB`) melalui Dexie.js dan divalidasi oleh Zod.

---

## 2. Gambaran Umum Sistem (*System Overview & Context*)

### 2.1 Konteks Sistem
Finora beroperasi tanpa server aplikasi bisnis dan tanpa basis data jarak jauh:
- **Sisi Hosting (Vercel)**: Mengirimkan bundel HTML, JavaScript, CSS, font mandiri (*self-hosted*), ikon PWA, dan Web App Manifest melalui HTTPS beserta 8 HTTP security headers wajib.
- **Sisi Perangkat Pengguna (Browser Runtime)**: Menjalankan *React UI Layer*, *Client-Side Service Layer*, *Domain Calculators*, *Zod Schemas*, *Dexie.js Repository*, dan *Service Worker*.

### 2.2 Karakteristik Pengguna
Sistem tidak mengenal peran administrator, moderator, atau multi-tenant. Hanya ada satu aktor pengguna lokal pemilik perangkat dengan tingkat keahlian teknologi beragam (mahasiswa hingga pekerja profesional) yang membutuhkan antarmuka Bahasa Indonesia yang jelas.

---

## 3. Kebutuhan Fungsional (*Functional Requirements Summary*)

Rincian penuh bernomor unik `FR-001` hingga `FR-027`—beserta kriteria penerimaan dan metode verifikasinya—didefinisikan di [REQUIREMENTS.md](./REQUIREMENTS.md). Secara garis besar, kapabilitas fungsional sistem terbagi menjadi sembilan modul:

1. **Bootstrap & Inisialisasi Lokal (`FR-001`, `FR-002`)**: Pembukaan aplikasi `/app` langsung tanpa login, inisialisasi skema `FinoraDB`, *seeding* 13 kategori default & pengaturan awal, serta agregasi Dashboard real-time.
2. **Manajemen Transaksi (`FR-003` – `FR-006`)**: CRUD transaksi `income`/`expense`, validasi integer IDR, pencarian teks, filter multi-parameter, pengurutan, dan ringkasan hasil filter.
3. **Manajemen Kategori (`FR-007`, `FR-008`)**: CRUD kategori kustom, perlindungan kategori sistem fallback `Lainnya`, *soft-archive*, dan *reassignment* atomik saat penghapusan kategori terpakai.
4. **Anggaran Bulanan (`FR-009`, `FR-010`)**: Penetapan dan penyalinan batas anggaran per `(categoryId, month)`, evaluasi status `safe`/`warning`/`exceeded`, dan daftar transaksi penyumbang realisasi.
5. **Target Keuangan (`FR-011`, `FR-012`)**: Pengelolaan target tabungan, pencatatan setoran/penarikan *earmark* (`goalContributions`), pencegahan saldo target negatif, dan perhitungan `AvailableBalance` tanpa *double counting*.
6. **Transaksi Berulang (`FR-013`, `FR-014`)**: Definisi jadwal berulang dengan *end-of-month clamping* dan materialisasi lokal idempoten saat aplikasi aktif.
7. **Analitik & Laporan (`FR-015` – `FR-017`)**: Grafik tren & proporsi Recharts, *rule-based insights* deterministik lokal, tampilan laporan siap cetak, serta ekspor CSV terlindung dari *formula injection*.
8. **Pengaturan & Backup/Restore (`FR-018` – `FR-024`)**: Preferensi tema, *privacy masking*, reset total berkonfirmasi ganda, ekspor JSON berversi dengan checksum SHA-256, dan impor berpratinjau (mode `Replace` dan `Merge`).
9. **Website Publik & SEO (`FR-025` – `FR-027`, `NFR-011`)**: Landing page `/`, `/features`, `/about`, `/privacy` dengan navigasi terpisah, pratinjau statis, sitemap, robots.txt (`disallow: /app/`), dan isolasi mutlak dari IndexedDB.

---

## 4. Kebutuhan Non-Fungsional (*Non-Functional Requirements Summary*)

Spesifikasi formal bernomor `NFR-001` hingga `NFR-010` tercantum di [REQUIREMENTS.md](./REQUIREMENTS.md), mencakup:
- **Kinerja**: Agregasi dashboard untuk 5.000 transaksi `<= 150 ms`; FCP mobile 4G `< 1,8 detik`; input form tanpa lag berarti.
- **Keandalan & Atomisitas**: Seluruh mutasi multi-tabel (seperti kontribusi target, reassign kategori, materialisasi berulang, dan restore backup) wajib berjalan dalam `db.transaction('rw', ...)` Dexie.js.
- **Aksesibilitas**: WCAG 2.1 Level AA pada mode gelap & terang, navigasi keyboard penuh, fokus terlihat, `tabular-nums`, dan target sentuh `>= 44×44 px`.
- **Kompatibilitas**: Browser modern berbasis Chromium, Firefox, dan Safari (desktop & mobile) yang mendukung IndexedDB, Service Worker, dan Web Crypto API.
- **Ketahanan Kode**: TypeScript `strict: true`, tanpa `any` implisit/eksplisit di domain, cakupan unit test tinggi pada logika kalkulasi dan validasi.

---

## 5. Kebutuhan Antarmuka Eksternal (*External Interface Requirements*)

### 5.1 Antarmuka Pengguna (*User Interface*)
- Responsif di tiga rentang utama: Mobile (`360px – 767px`), Tablet (`768px – 1023px`), Desktop (`>= 1024px`).
- Spesifikasi visual dikunci pada [STYLING.md](../04-design/STYLING.md), komponen pada [COMPONENTS.md](../04-design/COMPONENTS.md), tata letak pada [LAYOUTS.md](../04-design/LAYOUTS.md), dan 11 halaman inti + `/offline` pada [PAGE_SPECIFICATIONS.md](../04-design/PAGE_SPECIFICATIONS.md).

### 5.2 Antarmuka Perangkat Keras & Browser API
- **IndexedDB API** (via Dexie.js) sebagai penyimpanan lokal terstruktur.
- **Cache Storage & Service Worker API** untuk aset aplikasi offline.
- **Web Crypto API (`crypto.subtle.digest` & `crypto.randomUUID`)** untuk UUID v4 dan SHA-256 checksum backup.
- **File API / Blob Download** untuk ekspor dan impor berkas `.json` dan `.csv`.
- **StorageManager API (`navigator.storage.persist` & `estimate`)** (opsional/graceful degradation bila tidak didukung Safari versi tertentu).

### 5.3 Antarmuka Komunikasi (*Communications Interfaces*)
- **Hanya HTTPS Statis ke Origin Sendiri (`'self'`)**: Aplikasi berkomunikasi dengan edge server Vercel semata-mata untuk mengunduh halaman dan aset statis aplikasi.
- **Tidak Ada API Jaringan Eksternal**: Aplikasi tidak membuka koneksi WebSocket, REST API eksternal, GraphQL, atau beacon analitik ke domain pihak ketiga mana pun.

---

## 6. Kebutuhan Data (*Data Requirements Summary*)

Spesifikasi formal `DATA-001` hingga `DATA-008` ada di [REQUIREMENTS.md](./REQUIREMENTS.md), sedangkan detail skema dan kolom berada di [DATABASE_SCHEMA.md](../03-architecture/DATABASE_SCHEMA.md) dan [DATA_DICTIONARY.md](../03-architecture/DATA_DICTIONARY.md):
- Basis data kanonik bernama `FinoraDB` (versi 1) dengan 7 object stores/tabel.
- Nominal uang bertipe integer aman (`SafeInteger`), tidak pernah float desimal untuk nilai Rupiah.
- Tanggal bisnis bertipe string `YYYY-MM-DD`, timestamp sistem bertipe ISO 8601 UTC.
- Seluruh input batas masuk dan impor JSON divalidasi oleh Zod sebelum menyentuh IndexedDB.

---

## 7. Batasan Sistem (*Constraints*)

1. **Zero Backend & Zero External Auth**: Setiap perubahan kode yang memperkenalkan API penyimpanan data di server atau login pengguna melanggar arsitektur inti ([ADR-005](../03-architecture/ADR/ADR-005-no-backend-architecture.md)).
2. **Strict CSP Compatibility**: Kebijakan keamanan tidak boleh bergantung pada `'unsafe-eval'` di produksi maupun memanggil skrip eksternal tidak tepercaya ([SECURITY.md](../05-security/SECURITY.md)).
3. **Keterbatasan Penyimpanan Lokal**: Kapasitas dan ketahanan data bergantung pada kuota browser dan disiplin pengguna menjaga perangkat/backup ([PRIVACY.md](../05-security/PRIVACY.md)).

---

## 8. Ketergantungan (*Dependencies*)

| Kategori | Paket / Teknologi | Peran dalam Sistem |
|---|---|---|
| Framework UI | Next.js App Router, React, TypeScript Strict | Rendering klien/SSG shell, routing halaman, type safety |
| Styling & UI | Tailwind CSS, shadcn/ui, Lucide Icons | Token desain, komponen aksesibel, ikonografi konsisten |
| Persistensi & Validasi | Dexie.js, Zod | Abstraksi IndexedDB, migrasi skema, validasi runtime ketat |
| Visualisasi & Utilitas | Recharts, `date-fns`, `Intl.NumberFormat` | Grafik analitik, aritmetika tanggal kalender, format IDR |
| PWA & Hosting | Serwist / Service Worker, Web App Manifest, Vercel | Caching offline, instalabilitas PWA, hosting HTTPS + headers |

---

## 9. Asumsi (*Assumptions*)

1. Pengguna mengakses aplikasi melalui browser modern dengan JavaScript dan IndexedDB aktif.
2. Jam sistem dan zona waktu pada perangkat pengguna mencerminkan waktu lokal aktual pengguna saat mencatat transaksi (`today` lokal untuk default tanggal dan evaluasi aturan berulang).
3. Pengguna menggunakan Finora sebagai alat manajemen keuangan pribadi di lingkungan terpercaya (perangkat pribadi), karena MVP tidak mengimplementasikan enkripsi disk/passcode aplikasi.
