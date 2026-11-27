# Privacy Specification — Finora

**Versi Dokumen**: 1.0.0  
**Prinsip**: *Your Money, Your Control — Zero Data Collection*  
**Dokumen Terkait**: [SECURITY.md](./SECURITY.md) | [BACKUP_RESTORE.md](./BACKUP_RESTORE.md) | [OFFLINE_BEHAVIOR.md](../06-pwa/OFFLINE_BEHAVIOR.md)

---

## 1. Komitmen Kepemilikan Data (*Data Ownership*)

Seluruh data keuangan yang Anda masukkan ke Finora—termasuk transaksi, catatan, kategori kustom, anggaran, target tabungan, jadwal berulang, dan preferensi—sepenuhnya milik Anda dan hanya berada di browser pada perangkat yang Anda gunakan.

Pengembang maupun penyedia hosting (Vercel) **tidak memiliki akses, salinan, atau hak kendali** atas data finansial Anda.

---

## 2. Penyimpanan Lokal & Tanpa Transmisi Data

1. **Lokasi Penyimpanan**: Data disimpan secara eksklusif di **IndexedDB** (`FinoraDB`) milik browser pada origin aplikasi.
2. **Nol Transmisi Data Keuangan (`SEC-008`)**: Finora tidak memiliki server basis data dan tidak mengirimkan payload transaksi, saldo, anggaran, atau ringkasan keuangan melalui `fetch`, `XMLHttpRequest`, `WebSocket`, maupun `navigator.sendBeacon`.
3. **Nol Pelacakan & Analitik Pihak Ketiga (`NFR-009`)**:
   - Tidak ada Google Analytics, Vercel Web Analytics dengan tracking event pribadi, Meta Pixel, atau SDK pelacak perilaku pengguna.
   - Tidak ada cookie pelacakan iklan atau *fingerprinting* perangkat.
   - Seluruh font dimuat secara *self-hosted* dari origin Finora sendiri sehingga tidak ada permintaan runtime ke CDN font eksternal yang dapat membocorkan alamat IP pengguna ke pihak ketiga.

---

## 3. Batasan Penyimpanan Browser (*Browser Storage Limitations*)

Pengguna perlu memahami sifat alami penyimpanan lokal browser:
1. **Terikat Perangkat & Profil Browser**: Data di Chrome laptop tidak otomatis muncul di Chrome ponsel maupun di Firefox pada laptop yang sama.
2. **Mode Penyamaran (*Incognito / Private Mode*)**: Seluruh data IndexedDB yang dibuat dalam sesi Private/Incognito akan dihapus otomatis oleh browser begitu semua jendela sesi tersebut ditutup.
3. **Pembersihan Cache / Site Data**: Jika pengguna memilih *"Clear browsing data → Cookies and other site data / Hosted app data"*, seluruh `FinoraDB` akan ikut terhapus permanen.
4. **Storage Eviction**: Pada kondisi ruang penyimpanan perangkat hampir habis, sistem operasi atau browser dapat membersihkan data situs yang tidak berstatus *persistent storage* (Finora menyediakan tombol permintaan *Persistent Storage* pada `/settings`).

---

## 4. Penghapusan Data (*Data Deletion*)

Finora menyediakan dua mekanisme penghapusan data yang transparan:
1. **Penghapusan Selektif**: Hapus transaksi, anggaran, target, atau aturan berulang satu per satu melalui antarmuka masing-masing halaman.
2. **Penghapusan Total (*Factory Reset*)**: Melalui halaman `/settings` → **Zona Bahaya → Hapus Semua Data**, pengguna dapat mengosongkan seluruh 7 tabel `FinoraDB` dalam satu aksi terkonfirmasi (`"HAPUS"`). Penghapusan ini bersifat seketika dan tidak dapat dibatalkan kecuali pengguna memiliki berkas backup JSON.

---

## 5. Tanggung Jawab Backup Pengguna

Karena tidak ada salinan cloud di server mana pun:
- Pengguna bertanggung jawab membuat cadangan berkala melalui `/settings/backup` sebelum mengganti perangkat, memperbarui OS besar-besaran, meng-uninstall browser, atau membersihkan data situs.
- Pengguna juga bertanggung jawab menjaga kerahasiaan berkas `.json` hasil backup maupun `.csv` hasil laporan yang disimpan di penyimpanan internal perangkat atau layanan penyimpanan pribadi pilihan pengguna, karena berkas ekspor MVP belum terenkripsi kata sandi.

---

## 6. Keterbatasan Privasi di Tingkat Perangkat (*Privacy Limitations*)

1. **Akses Fisik Bersama (*Shared Device*)**: Siapa pun yang dapat membuka profil browser Anda tanpa kunci layar perangkat dapat membuka Finora dan melihat angka keuangan Anda.
2. **Perlindungan Visual (*Shoulder Surfing*)**: Gunakan tombol **Privacy Masking** (ikon mata di header) atau aktifkan default tersembunyi di `/settings` saat membuka Finora di tempat umum.
3. **Log Hosting Standar**: Sebagaimana layanan web statis umumnya, edge server Vercel secara teknis memproses metadata permintaan HTTP standar (alamat IP, User-Agent, path halaman statis seperti `/`) untuk mengirimkan berkas HTML/JS. Metadata tersebut **tidak pernah** mengandung catatan transaksi, kategori, maupun nominal keuangan Anda.
