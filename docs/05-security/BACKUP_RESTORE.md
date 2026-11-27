# Backup & Restore Specification — Finora

**Versi Dokumen**: 1.0.0  
**Status**: Baseline Disetujui  
**Dokumen Terkait**: [DATA_DICTIONARY.md](../03-architecture/DATA_DICTIONARY.md) | [SECURITY.md](./SECURITY.md) | [ADR-006](../03-architecture/ADR/ADR-006-json-backup-restore.md)

---

## 1. Format File Backup JSON (`BackupEnvelopeV1`)

Setiap berkas backup diberi nama standar `finora-backup-YYYY-MM-DD-HHmm.json` dan memiliki struktur root JSON ketat berikut:

```json
{
  "appName": "Finora",
  "backupFormatVersion": 1,
  "dbSchemaVersion": 1,
  "exportedAt": "2026-11-27T04:15:00.000Z",
  "checksum": {
    "algorithm": "SHA-256",
    "value": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  },
  "payload": {
    "transactions": [],
    "categories": [],
    "budgets": [],
    "financialGoals": [],
    "goalContributions": [],
    "recurringTransactions": [],
    "appSettings": []
  }
}
```

### Aturan Versioning
- `backupFormatVersion`: Integer versi struktur envelope (`1`). Digunakan untuk validasi kompatibilitas parser.
- `dbSchemaVersion`: Integer versi skema `FinoraDB` (`1`). Jika aplikasi versi mendatang (`v2`) mengimpor file dengan `dbSchemaVersion: 1`, sistem menjalankan fungsi migrator terdedikasi sebelum penulisan DB (`DATA-007`).

---

## 2. Proses Ekspor (*Export Process*)

1. Pengguna menekan **Unduh Backup JSON** di `/settings/backup`.
2. `backupService.exportBackupJson()` membuka transaksi read-only pada ketujuh tabel `FinoraDB` agar seluruh data diambil dari titik waktu konsisten yang sama.
3. Objek `payload` disusun dengan urutan kunci terdefinisi, lalu diserialisasikan dengan fungsi deterministik (*canonical JSON stringify* yang mengurutkan properti atau mempertahankan struktur serialisasi konsisten).
4. Web Crypto API menghitung digest `SHA-256` atas byte UTF-8 dari string `payload` kanonik tersebut (`crypto.subtle.digest('SHA-256', encoder.encode(canonicalPayload))`) dan mengonversinya menjadi 64 karakter hex lowercase.
5. `BackupEnvelopeV1` dirakit dan diunduh sebagai `Blob` bertipe `application/json`.
6. Timestamp `appSettings.lastBackupAt` diperbarui ke `exportedAt` sehingga banner pengingat backup (`FR-023`) otomatis ter-reset.

---

## 3. Proses Validasi Impor (*Import Validation*)

Sebelum menampilkan pratinjau apa pun, `backupService.inspectBackupFile(file)` menjalankan **5 gerbang validasi berurutan**:

| Gerbang | Pemeriksaan | Penolakan Jika Gagal |
|---|---|---|
| **Gate 1 — File Guard** | Ekstensi `.json` (atau MIME `application/json`) dan ukuran `file.size <= 25 * 1024 * 1024` (25 MB) dan `> 0 byte`. | *"Berkas terlalu besar (maks 25 MB) atau bukan format JSON yang valid."* |
| **Gate 2 — Safe Parse & Key Sanitization** | `JSON.parse` dalam blok `try/catch`, menolak jika ada kunci `__proto__`, `constructor`, atau `prototype` di level mana pun. | *"Struktur JSON rusak atau mengandung properti tidak aman."* |
| **Gate 3 — Envelope & Version Check** | `appName === 'Finora'`, `backupFormatVersion === 1`, dan `dbSchemaVersion <= CURRENT_DB_SCHEMA_VERSION`. | *"Berkas bukan backup Finora atau dibuat oleh versi aplikasi yang lebih baru."* |
| **Gate 4 — SHA-256 Integrity Check** | Hitung ulang SHA-256 dari `canonicalStringify(parsed.payload)` dan bandingkan secara ketat dengan `parsed.checksum.value`. | *"Checksum tidak cocok. Berkas backup kemungkinan terpotong, rusak, atau telah dimodifikasi secara tidak sah."* |
| **Gate 5 — Zod Strict Schema & Referential Check** | Validasi seluruh array pada `payload` memakai skema `.strict()` Zod (integer IDR valid, tanggal kalender valid, serta tidak ada `categoryId` atau `goalId` yatim di dalam payload itu sendiri). | *"Data di dalam backup tidak memenuhi aturan integritas Finora (rincian field bermasalah ditampilkan)."* |

---

## 4. Pratinjau Restore (*Restore Preview*)

Setelah lolos ke-5 gerbang validasi, UI menampilkan **Restore Preview Panel** tanpa mengubah database sama sekali:
- Metadata backup: Tanggal ekspor lokal (konversi dari `exportedAt`), versi format & skema, status checksum (**Terverifikasi SHA-256**).
- Ringkasan isi backup: Jumlah transaksi, kategori, anggaran, target, kontribusi target, aturan berulang, dan pengaturan.
- Rentang tanggal transaksi (`minDate` s.d. `maxDate`).
- Analisis dampak terhadap data yang saat ini ada di `FinoraDB`:
  - Jumlah record eksisting di browser saat ini.
  - Jumlah konflik `id` yang sama antara backup dan database lokal (untuk mode `Merge`).
  - Jumlah konflik kunci bisnis unik `(categoryId, month)` pada `budgets` yang memiliki ID berbeda namun kategori & bulannya sama (untuk mode `Merge`).

---

## 5. Penanganan Konflik & Konfirmasi Penimpaan

Pengguna memilih salah satu dari dua mode pemulihan:

### Mode A: `Replace All` (Ganti Semua Data)
- **Perilaku**: Mengosongkan ketujuh tabel lokal saat ini lalu memasukkan seluruh isi `payload` dari berkas backup secara atomik.
- **Konfirmasi Wajib (`SEC-010`)**: Pengguna wajib mencentang kesadaran bahwa data saat ini akan digantikan dan mengetik kata **`TIMPA`** tepat pada kotak konfirmasi sebelum tombol eksekusi aktif.

### Mode B: `Merge` (Gabungkan Data)
- **Perilaku**: Menambahkan record dari backup ke data yang sudah ada dengan dua opsi resolusi konflik:
  1. `skip_existing` (Default aman): Jika `id` sudah ada di database lokal (atau pasangan `(categoryId, month)` pada `budgets` sudah ada), pertahankan data lokal dan lewati item dari backup.
  2. `overwrite_existing`: Jika `id` sama atau pasangan `(categoryId, month)` pada `budgets` bentrok, perbarui dengan versi dari backup.
- **Perlindungan Kategori Sistem & Pengaturan**:
  - Kategori sistem dengan nama yang sama namun ID berbeda tetap dicegah melanggar aturan nama unik per tipe; kategori yang sudah ada di-map secara aman.
  - `appSettings` pada mode `Merge` secara default mempertahankan pengaturan lokal pengguna saat ini kecuali pengguna memilih menimpa preferensi.

---

## 6. Penanganan Backup Korup & Kegagalan Transaksi

1. **Berkas Korup**: Jika checksum gagal atau skema Zod gagal, tombol Restore tidak pernah ditampilkan; `FinoraDB` tidak tersentuh sedikit pun.
2. **Rollback Atomik**: Seluruh operasi tulis `Replace All` maupun `Merge` dijalankan di dalam satu `db.transaction('rw', [...semua 7 tabel...], async () => { ... })`. Jika terjadi `QuotaExceededError` atau kegagalan apa pun di tengah jalan, Dexie otomatis membatalkan seluruh perubahan (*full rollback*), menjaga kondisi database sebelum restore tetap utuh.

---

## 7. Keterbatasan Pemulihan (*Recovery Limitations*)

- **Tidak Bisa Memulihkan File yang Hilang/Terpotong Permanen**: Jika pengguna kehilangan berkas JSON backup atau memotong isinya tanpa menyimpan salinan lain, checksum akan menolak berkas korup tersebut dan tidak ada server cloud untuk mengunduh ulang.
- **Tidak Ada Enkripsi File di MVP**: Berkas `.json` dapat dibaca editor teks biasa; simpan file cadangan di folder atau penyimpanan terenkripsi milik pribadi pengguna.
- **Batas Memori Browser**: Untuk dataset sangat besar mendekati 25 MB (~puluhan ribu transaksi), proses parsing & transaksi IndexedDB di ponsel berspesifikasi rendah dapat memakan waktu beberapa detik (tampilkan *blocking progress indicator* agar pengguna tidak menutup tab di tengah proses).
