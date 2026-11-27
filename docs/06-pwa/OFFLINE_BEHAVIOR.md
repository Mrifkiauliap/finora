# Offline Behavior & Storage Resilience — Finora

**Versi Dokumen**: 1.0.0  
**Status**: Baseline Disetujui  
**Dokumen Terkait**: [PWA_STRATEGY.md](./PWA_STRATEGY.md) | [PRIVACY.md](../05-security/PRIVACY.md) | [UC-012](../01-product/USE_CASES.md)

---

## 1. Matriks Perilaku Sistem pada 7 Kondisi Operasional

| Kondisi | Status Jaringan | Status SW / IDB | Perilaku yang Diharapkan | Pesan / Indikator UI |
|---|---|---|---|---|
| **1. Online Normal** | Terhubung | SW aktif, IDB siap | Aplikasi dimuat cepat, Service Worker mengecek pembaruan di latar belakang, seluruh fitur berjalan penuh di IndexedDB lokal. | Tidak ada banner gangguan; indikator status halus di footer sidebar `"Lokal • Tersinkronisasi di Perangkat"`. |
| **2. Offline Setelah Kunjungan Pertama** | Terputus (`onLine=false`) | SW aktif (shell ter-cache), IDB siap | Seluruh 11 rute inti terbuka dari CacheStorage SW; CRUD transaksi, kategori, anggaran, target, berulang, analitik Recharts, laporan CSV, dan Backup JSON berjalan 100% normal. Jika mengakses rute tak ter-cache, SW melayani `/offline`. | `OfflineStatusBanner` non-blocking (`role="status"`): *"Mode Offline — Data Anda tetap tersimpan aman di perangkat."* |
| **3. Kunjungan Pertama Tanpa Internet** | Terputus | SW belum terpasang, cache kosong | Browser secara alami menampilkan halaman *"No Internet"* bawaan browser karena aset awal belum pernah diunduh dari Vercel. *(Keterbatasan standar arsitektur web).* | Ditangani oleh browser OS hingga koneksi pertama berhasil menginstal SW. |
| **4. Pembaruan Service Worker Tersedia** | Online (atau baru kembali online) | SW baru di state `waiting` | SW baru tidak memutus sesi aktif; pengguna tetap aman menyelesaikan input yang sedang diketik. | `SwUpdateBanner`: *"Pembaruan aplikasi tersedia"* + tombol **"Muat Ulang"** dan opsi **"Nanti"**. |
| **5. IndexedDB Tidak Tersedia / Diblokir** | Online / Offline | `indexedDB` null atau `SecurityError` / `InvalidStateError` saat `db.open()` | Aplikasi tidak boleh crash ke layar putih React. Tangkap di bootstrap error boundary dan arahkan ke tampilan fallback diagnostik yang aman. | `ErrorFallback`: *"Penyimpanan lokal browser tidak tersedia (kemungkinan diblokir oleh mode Private/pengaturan privasi browser). Finora membutuhkan IndexedDB untuk menyimpan data Anda secara lokal."* |
| **6. Kuota Penyimpanan Penuh (`QuotaExceededError`)** | Online / Offline | Kuota disk/origin browser penuh | Transaksi Dexie otomatis rollback sehingga data lama tidak rusak. Service layer mengembalikan `STORAGE_QUOTA_EXCEEDED`. | Modal peringatan: *"Ruang penyimpanan browser penuh. Unduh Backup JSON sekarang untuk mengamankan data Anda, lalu kosongkan ruang penyimpanan perangkat atau hapus data lama."* + tombol langsung **Unduh Backup JSON**. |
| **7. Data Browser Dibersihkan (`Clear Site Data`)** | Online / Offline | Cache & `FinoraDB` terhapus | Saat kunjungan berikutnya, aplikasi menganggap ini sebagai kondisi awal (*first-run bootstrap*, `UC-001`), membuat ulang `FinoraDB` bersih dengan 13 kategori default. | Tampil kondisi awal bersih + opsi di kartu sambutan: *"Sudah punya cadangan? Pulihkan dari Backup JSON"*. |

---

## 2. Alur Pemulihan Pembaruan & Perlindungan Transaksi Aktif

1. **Deteksi Online/Offline UI**: Hook `useOnlineStatus()` mendengarkan event `window.addEventListener('online', ...)` dan `'offline'`. Indikator hanya bersifat informatif—tidak menonaktifkan tombol Simpan, Ekspor CSV, atau Ekspor JSON.
2. **Permintaan Persistent Storage (`DATA-008`)**:
   - Setelah pengguna mencatat minimal 1 transaksi atau atas klik eksplisit di `/settings`, aplikasi dapat memanggil `navigator.storage?.persist?.()` (jika tersedia) untuk mengurangi risiko *automatic browser eviction* saat ruang disk menipis.
   - Hasil (`granted` / `not-granted` / `unsupported`) ditampilkan jujur di halaman `/settings` tanpa melempar error pada browser yang tidak mendukung API tersebut (misal beberapa versi Safari).
3. **Pemantauan Penggunaan Kuota**:
   - Di `/settings`, `bootstrapService.getStorageHealth()` memanggil `navigator.storage?.estimate?.()` untuk menampilkan estimasi pemakaian vs kuota dalam MB.

---

## 3. Batasan Offline yang Didokumentasikan Secara Jujur

- **Pindah Browser atau Tab Incognito**: Data pada Chrome tidak terbagi dengan Safari/Firefox pada perangkat yang sama, dan data pada sesi Incognito hilang saat seluruh tab Incognito ditutup.
- **Materialisasi Berulang Saat Aplikasi Tidak Dibuka**: Jika ponsel mati atau aplikasi tidak dibuka selama 2 bulan, transaksi berulang yang jatuh tempo pada 2 bulan tersebut tidak diproses di latar belakang oleh OS; seluruhnya akan dimaterialisasi berurutan begitu aplikasi dibuka kembali (hingga batas aman 366 occurrence per aturan sesuai `RULE-016`).
