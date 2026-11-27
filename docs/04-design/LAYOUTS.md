# Layouts & Responsive Architecture — Finora

**Versi Dokumen**: 1.0.0  
**Prinsip**: Mobile-First, Zero Horizontal Overflow, Thumb-Friendly Navigation  
**Dokumen Terkait**: [STYLING.md](./STYLING.md) | [COMPONENTS.md](./COMPONENTS.md) | [PAGE_SPECIFICATIONS.md](./PAGE_SPECIFICATIONS.md)

---

## 1. Strategi Tata Letak Lintas Breakpoint

| Breakpoint | Lebar Viewport | Navigasi Utama | Struktur Konten | Tombol Catat Cepat |
|---|---|---|---|---|
| **Mobile** | `360px – 767px` | *Fixed Bottom Navigation Bar* (`64px` + `env(safe-area-inset-bottom)`) + menu "Lainnya" (*Sheet*) | 1 kolom vertikal penuh (`px-4`, gap `16px`) | Tombol tengah menonjol di Bottom Nav atau FAB `56×56 px` |
| **Tablet** | `768px – 1023px` | *Collapsible Rail / Drawer Sidebar* (`72px` collapsed atau slide-over) + Top Bar | Grid 2 kolom untuk KPI & kartu | Tombol **"+ Catat Transaksi"** di Top Header |
| **Desktop** | `>= 1024px` | *Persistent Left Sidebar* (`256px` fixed) + Top Header (`64px`) | Container konten `max-w-[1280px]` dengan grid 12 kolom | Tombol **"+ Catat Transaksi"** di Header & Sidebar |

---

## 2. Struktur Navigasi (*Navigation Architecture*)

### 2.1 Desktop Persistent Sidebar (`>= 1024px`)
Lebar `256px`, latar `--bg-surface`, border kanan `1px solid --border-subtle`:
1. **Brand Area (`64px`)**: Logo Finora + tagline singkat *"Your Money, Your Control"*.
2. **Primary CTA**: Tombol penuh **"+ Catat Transaksi"** (membuka modal/rute tambah transaksi).
3. **Navigasi Utama**:
   - `Dashboard` (`/`)
   - `Transaksi` (`/transactions`)
   - `Anggaran` (`/budgets`)
   - `Target` (`/goals`)
   - `Berulang` (`/recurring`)
   - `Analitik` (`/analytics`)
   - `Laporan` (`/reports`)
4. **Navigasi Sekunder / Pengelolaan** (dipisah divider halus):
   - `Kategori` (`/categories`)
   - `Backup & Restore` (`/settings/backup`)
   - `Pengaturan` (`/settings`)
5. **Footer Sidebar**: Badge indikator status lokal/offline ringkas (`"Penyimpanan Lokal • Offline Siap"`).

### 2.2 Mobile Bottom Navigation (`< 768px`)
Karena 11 rute tidak mungkin dijejalkan ke satu baris bawah ponsel tanpa membuat target sentuh sempit (`< 44px`), mobile memakai **4 tab langsung + 1 tombol tengah Catat + laci "Menu"**:
1. **Beranda** (`/`)
2. **Transaksi** (`/transactions`)
3. **+** (Tombol aksi utama `48×48 px` emerald → membuka `/transactions/new` atau Quick Entry Sheet)
4. **Anggaran** (`/budgets`)
5. **Menu** (Membuka *Bottom Sheet* berisi `Target`, `Berulang`, `Analitik`, `Laporan`, `Kategori`, `Backup & Restore`, `Pengaturan`)

> Setiap item bottom nav wajib memiliki tinggi sentuh minimal `48px` dan label teks `11px–12px` yang jelas (tidak ikon saja).

---

## 3. Top Header Bar

Tinggi `64px` (desktop/tablet) atau `56px` (mobile), sticky di atas area scroll konten dengan *backdrop blur* halus:
- **Kiri**: Judul halaman aktif (atau tombol menu drawer pada tablet).
- **Kanan**:
  - Indikator status Offline (hanya muncul bila `offline`, atau chip halus).
  - Tombol `PrivacyMaskToggle` (ikon mata: sembunyikan/tampilkan nominal).
  - Tombol `ThemeToggle` (ikon matahari/bulan).
  - Tombol `"+ Catat"` (pada tablet & desktop).

---

## 4. Grid System Dashboard & Hierarki Konten

### 4.1 Desktop Dashboard Grid (`12 Columns`, `gap-6`)
1. **Baris 1 — Hero & KPI Summary**:
   - `4 kolom`: **Hero Balance Card** (`AvailableBalance` utama + `NetBalance` + `TotalAllocatedSavings`).
   - `8 kolom` (sub-grid 3 kartu sama rata): **Pemasukan Bulan Ini**, **Pengeluaran Bulan Ini**, **Rasio Tabungan**.
2. **Baris 2 — Analitik & Peringatan Anggaran**:
   - `7 kolom`: **Grafik Tren Arus Kas (6 Bulan Terakhir)**.
   - `5 kolom`: **Peringatan Anggaran Bulan Ini** (menampilkan kategori berstatus `exceeded` dan `warning` lebih dulu).
3. **Baris 3 — Aktivitas & Target**:
   - `7 kolom`: **5 Transaksi Terbaru** (dengan tautan "Lihat Semua →").
   - `5 kolom`: **Progres Target Keuangan Aktif** (maksimal 3 target prioritas + tautan "Kelola Target →").

### 4.2 Mobile & Tablet Stack Order (Hierarki Membaca)
Pada mobile (`< 768px`), urutan vertikal memprioritaskan informasi keputusan harian:
1. Hero Balance (`AvailableBalance` & `NetBalance`)
2. Ringkasan Pemasukan vs Pengeluaran Bulan Ini (2 kolom sejajar `grid-cols-2`) + Rasio Tabungan
3. Peringatan Anggaran (jika ada kategori `warning`/`exceeded`, tampil menonjol di atas lipatan kedua)
4. 5 Transaksi Terbaru
5. Grafik Tren Arus Kas
6. Progres Target Aktif

---

## 5. Aturan Responsivitas Tabel & Dialog

1. **Tabel Transaksi / Laporan**:
   - Desktop (`>= 768px`): Tabel berkolom (`Tanggal`, `Kategori & Catatan`, `Metode`, `Nominal`, `Aksi`) dengan angka rata kanan dan `tabular-nums`.
   - Mobile (`< 768px`): Berubah menjadi **Stacked Card List** (ikon kategori di kiri, nama kategori + catatan + tanggal di tengah, nominal + metode di kanan; aksi edit/hapus via tap baris atau menu `...`).
2. **Modal vs Drawer/Sheet**:
   - Desktop: Centered Modal (`max-w-lg`) atau halaman khusus (`/transactions/new`).
   - Mobile: Bottom Sheet dengan tinggi maks `90dvh` dan tombol simpan tetap terjangkau di bagian bawah saat keyboard virtual tidak menutupinya.
3. **Zero Horizontal Scroll**: Seluruh halaman diuji pada `360px` untuk memastikan `document.documentElement.scrollWidth <= window.innerWidth`.
