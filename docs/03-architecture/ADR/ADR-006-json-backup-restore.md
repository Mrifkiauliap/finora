# ADR-006: Format Backup JSON Berversi dengan Verifikasi Checksum SHA-256

**Status**: Accepted  
**Tanggal Keputusan**: 2026-11-27  
**Dokumen Terkait**: [BACKUP_RESTORE.md](../../05-security/BACKUP_RESTORE.md) | [DATA_DICTIONARY.md](../DATA_DICTIONARY.md) | [ADR-005](./ADR-005-no-backend-architecture.md)

---

## Context

Karena Finora tidak memiliki database cloud (`ADR-005`), risiko terbesar bagi pengguna adalah kehilangan data akibat penghapusan data browser, kerusakan perangkat, atau pergantian ponsel. Pengguna memerlukan mekanisme ekspor/impor mandiri yang portabel, mudah dipahami, aman terhadap berkas rusak atau manipulasi struktur berbahaya, serta mendukung pratinjau sebelum menimpa data yang sudah ada.

## Decision

Finora mengadopsi **format JSON Envelope berversi (`BackupEnvelopeV1`)** dengan spesifikasi:
1. Memuat seluruh 7 tabel `FinoraDB` di dalam properti `payload`.
2. Menyertakan `appName: "Finora"`, `backupFormatVersion: 1`, `dbSchemaVersion: 1`, dan `exportedAt` UTC.
3. Menyertakan `checksum` ber-algoritma `SHA-256` yang dihitung di browser melalui Web Crypto API (`crypto.subtle.digest`) atas serialisasi JSON kanonik `payload`.
4. Proses impor wajib melalui tahap **Inspect & Restore Preview** (validasi ukuran `<= 25 MB`, Zod `.strict()`, sanitasi prototype key, pencocokan checksum) dan mendukung dua mode atomik: `Replace All` (butuh konfirmasi ketik `"TIMPA"`) dan `Merge`.

## Alternatives

1. **Ekspor/Impor CSV Saja**:
   - *Alasan Ditolak*: CSV bersifat datar (*flat*) dan tidak dapat menyimpan relasi utuh `categories` (ikon/warna/isArchived), `budgets`, `financialGoals`, `goalContributions`, `recurringTransactions`, dan `appSettings` secara lossless. CSV tetap disediakan khusus untuk kebutuhan laporan (`FR-017`).
2. **JSON Mentah Tanpa Versi & Checksum**:
   - *Alasan Ditolak*: Berkas yang terpotong saat transfer atau diedit keliru dapat merusak basis data lokal saat diimpor, serta menyulitkan migrasi ketika skema database naik ke v2 kelak.
3. **JSON Terenkripsi Kata Sandi Wajib di MVP**:
   - *Alasan Ditolak*: Jika pengguna lupa kata sandi berkas backupnya, data hilang permanen tanpa opsi pemulihan; selain itu enkripsi menyulitkan pengguna memeriksa isi cadangannya. Opsi enkripsi AES-GCM berbasis passphrase dapat ditambahkan sebagai fitur opt-in di V2 (`ROADMAP.md`).

## Consequences

- **Positif**:
  - Pemulihan lintas perangkat 100% akurat tanpa server.
  - Kerusakan berkas terdeteksi sebelum satu pun baris database lokal disentuh.
  - Struktur berversi siap dimigrasikan pada versi aplikasi mendatang.
- **Negatif / Trade-off**:
  - Checksum SHA-256 menjamin **integritas** (deteksi korupsi/modifikasi tidak sengaja), **bukan** kerahasiaan data; berkas backup JSON dapat dibaca oleh siapa pun yang memiliki akses fisik ke file tersebut. Pengguna harus menyimpannya di lokasi yang aman (dijelaskan jelas di [PRIVACY.md](../../05-security/PRIVACY.md)).
