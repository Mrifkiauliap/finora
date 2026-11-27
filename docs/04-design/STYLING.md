# Design System & Visual Styling — Finora

**Versi Dokumen**: 1.0.0  
**Identitas Visual**: *Premium Fintech, Minimalist, Modern, Clean, Professional, Trustworthy*  
**Tema Default**: Dark Mode (`#0B1220`), dilengkapi Light Mode terkalibrasi penuh  
**Dokumen Terkait**: [COMPONENTS.md](./COMPONENTS.md) | [LAYOUTS.md](./LAYOUTS.md) | [PAGE_SPECIFICATIONS.md](./PAGE_SPECIFICATIONS.md)

---

## 1. Filosofi Desain & Arah Visual

Finora dirancang sebagai ruang kontrol keuangan pribadi yang tenang, tegas, dan dapat dipercaya. Aplikasi keuangan sering jatuh ke dua ekstrem: terlalu kaku seperti spreadsheet kuno, atau terlalu ramai dengan warna neon yang melelahkan mata. Finora mengambil jalan tengah:

1. **Kejelasan Angka di Atas Dekorasi**: Angka saldo, nominal transaksi, dan status anggaran selalu menjadi hierarki visual nomor satu dengan *tabular numerals* dan kontras tinggi.
2. **Hierarki Kedalaman (*Surface Layering*)**: Alih-alih mengandalkan bayangan berat pada tema gelap, kedalaman visual dibangun dari tiga tingkat permukaan navy-slate yang konsisten (`Background` → `Surface` → `Elevated Surface`) dan garis batas halus `1px`.
3. **Warna Semantik yang Disiplin**: Hijau emerald (`#10B981` pada dark / `#047857` pada light) adalah sinyal aksi utama dan pertumbuhan positif; amber dan merah hanya muncul untuk peringatan anggaran, pengeluaran/defisit, atau aksi destruktif.
4. **Kalibrasi Terpisah Dark vs Light Mode**: Light mode **tidak dibuat** dengan membalik hex dark mode secara naif, melainkan dikalibrasi ulang agar rasio kontras WCAG 2.1 Level AA/AAA tetap terpenuhi pada latar terang.

---

## 2. Palet Warna & Kontras WCAG 2.1 Terverifikasi

### 2.1 Dark Mode (Default)

| Token CSS | Hex | Peran | Rasio Kontras Terverifikasi |
|---|---|---|---|
| `--bg-canvas` | `#0B1220` | Latar utama kanvas aplikasi (60%) | Base |
| `--bg-surface` | `#111C2E` | Kartu, sidebar, panel konten (30%) | Base Surface |
| `--bg-elevated` | `#17243A` | Modal, dropdown, popover, hover row | Base Elevated |
| `--text-primary` | `#F8FAFC` | Judul, angka saldo, teks utama | `17.89:1` on canvas, `16.33:1` on surface, `14.87:1` on elevated (AAA) |
| `--text-secondary` | `#94A3B8` | Label sekunder, tanggal, subjudul | `7.30:1` on canvas, `6.66:1` on surface, `6.07:1` on elevated (AA+) |
| `--text-muted` | `#64748B` | Placeholder non-kritis / teks besar (`>=18px`) | `3.93:1` on canvas (`>=3:1` untuk teks besar; hindari untuk teks kecil `<14px`) |
| `--border-subtle` | `#263449` | Pembatas dekoratif antar-kartu & tabel | `1.36:1` on surface (dekoratif saja) |
| `--border-control` | `#566B87` | Border input form, checkbox, switch (WCAG 1.4.11) | `3.13:1` on `#111C2E`, `3.43:1` on `#0B1220` (AA UI Control) |
| `--accent-primary` | `#10B981` | CTA utama, active state, indikator positif (10%) | `6.73:1` on `#111C2E` |
| `--accent-hover` | `#34D399` | Hover state aksen & link interaktif | `8.89:1` on `#111C2E` |
| `--accent-foreground` | `#0B1220` | **WAJIB** untuk teks/ikon di atas tombol solid `#10B981` | `7.38:1` on `#10B981` (AAA — dilarang teks putih `#FFFFFF` karena hanya `2.54:1`!) |
| `--status-success` | `#22C55E` | Pemasukan, status `safe`, target tercapai | `7.50:1` on `#111C2E` |
| `--status-warning` | `#F59E0B` | Anggaran mendekati batas (`warning`) | `7.95:1` on `#111C2E` |
| `--status-danger` | `#EF4444` | Ikon, border error, progress `exceeded` | `4.54:1` on `#111C2E` |
| `--status-danger-text` | `#F87171` | Teks pesan error kecil di atas surface/elevated | `6.18:1` on `#111C2E`, `5.62:1` on `#17243A` (AA+) |
| `--danger-solid` | `#DC2626` | Latar tombol solid aksi destruktif (Hapus/Reset) | Teks `#FFFFFF` menghasilkan `4.83:1` (AA) |

### 2.2 Light Mode (Terkalibrasi — Bukan Inversi Naif)

| Token CSS | Hex | Peran | Rasio Kontras Terverifikasi |
|---|---|---|---|
| `--bg-canvas` | `#F8FAFC` | Latar utama kanvas aplikasi (60%) | Base |
| `--bg-surface` | `#FFFFFF` | Kartu, sidebar, panel utama (30%) | Base Surface |
| `--bg-elevated` | `#F1F5F9` | Permukaan inset, chip, header tabel, hover subtle | Base Subtle/Elevated |
| `--text-primary` | `#0F172A` | Judul, angka saldo, teks utama | `17.85:1` on `#FFFFFF`, `17.06:1` on `#F8FAFC` (AAA) |
| `--text-secondary` | `#475569` | Label sekunder, subjudul, tanggal | `7.58:1` on `#FFFFFF`, `7.24:1` on `#F8FAFC` (AAA) |
| `--text-muted` | `#64748B` | Caption & metadata pendukung | `4.76:1` on `#FFFFFF`, `4.55:1` on `#F8FAFC` (AA) |
| `--border-subtle` | `#CBD5E1` | Pembatas kartu & tabel (plus `#E2E8F0` untuk divider halus) | `1.48:1` on `#FFFFFF` |
| `--border-control` | `#7B8CA3` | Border input form, checkbox, radio (WCAG 1.4.11) | `3.43:1` on `#FFFFFF`, `3.28:1` on `#F8FAFC` (AA UI Control) |
| `--accent-primary` | `#047857` | CTA utama, link aktif, tombol solid (10%) | `5.48:1` on `#FFFFFF` (AA); hover `#065F46` |
| `--accent-foreground` | `#FFFFFF` | Teks di atas tombol solid `#047857` | `5.48:1` on `#047857` (AA) |
| `--accent-graphic` | `#059669` | Progress bar & elemen grafik non-teks | `3.77:1` on `#FFFFFF` (`>=3:1` Non-text AA) |
| `--status-success` | `#15803D` | Teks pemasukan & status `safe` | `5.02:1` on `#FFFFFF`, `4.79:1` on `#F8FAFC` (AA) |
| `--status-warning` | `#B45309` | Teks & ikon status `warning` | `5.02:1` on `#FFFFFF`, `4.80:1` on `#F8FAFC` (AA) |
| `--status-danger` | `#DC2626` | Pengeluaran, tombol solid bahaya, border error | `4.83:1` on `#FFFFFF`; teks putih di tombol `#DC2626` = `4.83:1` (AA) |
| `--status-danger-text` | `#B91C1C` | Teks error pada latar `#F1F5F9` atau `#FFFFFF` | `6.47:1` on `#FFFFFF`, `5.91:1` on `#F1F5F9` (AA+) |

---

## 3. Aturan Distribusi Warna 60–30–10

1. **60% — Warna Kanvas Dominan**: `--bg-canvas` (`#0B1220` dark / `#F8FAFC` light) mengisi latar belakang viewport, area margin, dan ruang bernapas antar-komponen agar mata tidak lelah.
2. **30% — Permukaan & Struktur Sekunder**: `--bg-surface` (`#111C2E` / `#FFFFFF`), `--bg-elevated`, sidebar, header navigasi, serta border halus `--border-subtle` membentuk hierarki kartu dan tabel.
3. **10% — Aksen & Sinyal Semantik**: `--accent-primary` (`#10B981` / `#047857`) dan warna status semantik hanya digunakan pada tombol aksi primer, indikator navigasi aktif, badge status, dan elemen kunci grafik. **Dilarang** mewarnai seluruh latar kartu besar dengan aksen hijau pekat.

---

## 4. Tipografi, Ukuran & Bobot Huruf

- **Font Keluarga Utama (`--font-sans`)**: `Plus Jakarta Sans` (dimuat self-hosted via `next/font/google` dengan subset `latin`, fallback `system-ui, -apple-system, sans-serif`).
- **Font Angka/Kode Opsional (`--font-mono`)**: `JetBrains Mono` (self-hosted via `next/font/google`) untuk tampilan kode checksum/ID atau angka monospaced bila dipilih, serta wajib kelas utilitas `tabular-nums` (`font-variant-numeric: tabular-nums`) pada **seluruh nominal uang, persentase, dan tanggal tabel**.

| Peran Tipografi | Token Tailwind | Ukuran / Line-Height | Font Weight | Keterangan |
|---|---|---|---|---|
| **KPI Hero Balance** | `text-3xl md:text-4xl` | `30px/36px` – `36px/42px` | `700` (Bold) | `tabular-nums`, tracking `-0.02em` |
| **Page Title (`h1`)** | `text-2xl` | `24px / 32px` | `700` (Bold) | 1 judul utama per halaman |
| **Section Heading (`h2`)** | `text-lg` | `18px / 26px` | `600` (Semibold) | Judul kartu & subbagian |
| **Card Title (`h3`)** | `text-base` | `16px / 24px` | `600` (Semibold) | Judul widget kecil |
| **Body Default** | `text-sm` | `14px / 20px` | `400` / `500` | Teks daftar transaksi, deskripsi, label |
| **Table / Input Label** | `text-xs` – `text-sm` | `12px/16px` – `14px/20px` | `500` (Medium) | Label form & header kolom |
| **Caption / Badge** | `text-xs` | `12px / 16px` | `500` / `600` | Minimum `12px` untuk teks terbaca |

---

## 5. Skala Spasi, Radius, Shadow & Elevasi

- **Skala Spasi (Basis 4px)**: `4px` (`1`), `8px` (`2`), `12px` (`3`), `16px` (`4` — gap antar-item rapat), `20px` (`5` — padding kartu mobile), `24px` (`6` — padding kartu desktop & gap grid), `32px` (`8` — jarak antar-seksi halaman).
- **Border Radius**:
  - Input, badge kecil, tombol kompak: `8px` (`rounded-lg`).
  - Tombol standar, item menu navigasi: `10px` (`rounded-[10px]`).
  - Kartu konten (*Card*), modal, drawer: `14px`–`16px` (`rounded-2xl`).
  - Pill badge, avatar ikon kategori, toggle switch: `9999px` (`rounded-full`).
- **Shadow & Elevasi**:
  - *Dark Mode*: Elevasi mengandalkan kontras permukaan (`#0B1220` → `#111C2E` → `#17243A`) + border `1px solid #263449`. Shadow lembut (`0 12px 32px -8px rgba(2, 6, 23, 0.55)`) hanya dipakai pada modal, dropdown, dan toast melayang.
  - *Light Mode*: Kartu memakai `1px solid #E2E8F0` + shadow halus `0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)`; modal memakai `0 16px 36px -8px rgba(15, 23, 42, 0.14)`.

---

## 6. Ikonografi

- **Pustaka**: `lucide-react` secara eksklusif.
- **Ukuran Standar**: `16px` (inline badge/button kecil), `20px` (navigasi, input icon, card header), `24px` (FAB, empty state badge), `strokeWidth={1.75}` untuk tampilan bersih dan tajam.
- **Ikon Kategori Terkurasi**: Gunakan whitelist tetap kunci Lucide (`utensils`, `car`, `receipt`, `shopping-bag`, `gamepad-2`, `heart-pulse`, `graduation-cap`, `wallet`, `briefcase`, `gift`, `trending-up`, `home`, `plane`, `coffee`, `smartphone`, `more-horizontal`) sehingga validasi Zod tetap aman tanpa dynamic import tak terkontrol.

---

## 7. Gaya Komponen Inti

### 7.1 Varian Tombol (*Button Variants*)
| Varian | Dark Mode | Light Mode | Penggunaan |
|---|---|---|---|
| **Primary** | BG `#10B981`, Text `#0B1220`, Hover `#34D399` | BG `#047857`, Text `#FFFFFF`, Hover `#065F46` | Aksi utama halaman (Simpan, Tambah Transaksi) |
| **Secondary** | BG `#17243A`, Text `#F8FAFC`, Border `#263449`, Hover `#1E2E4A` | BG `#F1F5F9`, Text `#0F172A`, Border `#CBD5E1`, Hover `#E2E8F0` | Aksi sekunder (Ekspor CSV, Salin Bulan Lalu) |
| **Outline / Ghost** | BG transparan, Text `#94A3B8` / `#F8FAFC`, Hover `#17243A` | BG transparan, Text `#475569` / `#0F172A`, Hover `#F1F5F9` | Batal, toolbar filter, tombol ikon |
| **Destructive** | BG `#DC2626`, Text `#FFFFFF`, Hover `#B91C1C` | BG `#DC2626`, Text `#FFFFFF`, Hover `#B91C1C` | Hapus Permanen, Factory Reset |

- Tinggi tombol standar: `40px` desktop, minimal `44px` pada kontrol utama mobile.

### 7.2 Gaya Formulir (*Form Controls*)
- Latar input: `#0B1220` (on surface `#111C2E` dark) / `#FFFFFF` (light).
- Border default: `1px solid --border-control` (`#566B87` dark / `#7B8CA3` light) agar kontras tepi input `>= 3:1`.
- Focus ring: `2px solid --accent-primary` dengan `ring-offset-2` sesuai warna permukaan.
- Error state: border `--status-danger` + pesan teks `--status-danger-text` tepat di bawah input, terhubung via `aria-describedby`.

### 7.3 Gaya Kartu (*Card*) & Navigasi
- Padding kartu: `p-5` (`20px`) di mobile, `p-6` (`24px`) di tablet/desktop.
- Item navigasi aktif: latar `#10B981/15` dengan teks `#34D399` dan indikator batang kiri `3px` di dark mode; latar `#047857/10` dengan teks `#047857` di light mode.

---

## 8. Gaya Grafik (*Recharts Chart Styles*)

Palet seri grafik dikalibrasi agar setiap batang/garis/slice memenuhi kontras non-teks `>= 3:1` terhadap latar kartu:

| Urutan Seri | Dark Mode (`#111C2E`) | Light Mode (`#FFFFFF`) | Peran Umum |
|---|---|---|---|
| Seri 1 | `#10B981` (`6.73:1`) | `#059669` (`3.77:1`) | Pemasukan / Kategori 1 |
| Seri 2 | `#FB7185` (`6.35:1`) | `#E11D48` (`4.70:1`) | Pengeluaran / Kategori 2 |
| Seri 3 | `#38BDF8` (`7.97:1`) | `#0284C7` (`4.10:1`) | Arus Kas Bersih / Kategori 3 |
| Seri 4 | `#F59E0B` (`7.95:1`) | `#D97706` (`3.19:1`) | Anggaran / Kategori 4 |
| Seri 5 | `#A78BFA` (`6.28:1`) | `#7C3AED` (`5.70:1`) | Kategori 5 |
| Seri 6 | `#2DD4BF` (`9.18:1`) | `#0D9488` (`3.74:1`) | Kategori 6 / Lainnya |

- Gridlines chart memakai warna halus (`#263449` dark / `#E2E8F0` light) dengan `strokeDasharray="3 3"`.
- Tooltip Recharts harus berupa komponen React kustom bergaya Elevated Surface yang memformat nominal penuh via `Intl.NumberFormat('id-ID')` dan menghormati mode *Privacy Masking* jika aktif.

---

## 9. Breakpoints Responsif & Aksesibilitas & Motion

- **Breakpoints (Tailwind Default Mobile-First)**:
  - Base (`< 640px`): Ponsel standar (`360px`–`639px`).
  - `sm` (`>= 640px`): Ponsel besar / landscape.
  - `md` (`>= 768px`): Tablet portrait (transisi grid 2 kolom & sidebar ringkas).
  - `lg` (`>= 1024px`): Desktop (sidebar penuh `256px` + konten utama maks `1280px`).
  - `xl` (`>= 1280px`): Desktop lebar (grid dashboard 12 kolom penuh).
- **Aksesibilitas (`NFR-004`)**:
  - Tidak pernah membedakan `income` vs `expense` hanya dengan warna; sertakan prefix `+` / `-` dan ikon panah masuk/keluar.
  - Seluruh modal memakai *focus trap*, tertutup oleh `Escape`, dan mengembalikan fokus ke tombol pemicu saat ditutup.
- **Pedoman Gerak (*Motion Guidelines*)**:
  - Durasi transisi mikro cepat dan fungsional: `150ms` untuk hover/focus, `200ms` untuk modal/drawer (`cubic-bezier(0.16, 1, 0.3, 1)`).
  - Hormati preferensi OS `prefers-reduced-motion: reduce`: matikan animasi transisi chart Recharts (`isAnimationActive={!prefersReducedMotion}`) dan sederhanakan transisi modal menjadi fade instan.
