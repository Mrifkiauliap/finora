# ADR-001: Arsitektur Local-First sebagai Paradigma Utama

**Status**: Accepted  
**Tanggal Keputusan**: 2026-11-27  
**Dokumen Terkait**: [SYSTEM_ARCHITECTURE.md](../SYSTEM_ARCHITECTURE.md) | [PRIVACY.md](../../05-security/PRIVACY.md) | [ADR-005](./ADR-005-no-backend-architecture.md)

---

## Context

Finora ditujukan bagi pengguna di Indonesia (mahasiswa, karyawan, freelancer, dan individu peduli privasi) yang ingin mencatat transaksi keuangan harian tanpa friksi pendaftaran akun, tanpa ketergantungan koneksi internet yang stabil, dan dengan jaminan bahwa riwayat keuangan mereka tidak pernah dikumpulkan oleh pihak ketiga.

Pada arsitektur web konvensional (*cloud-first*), seluruh operasi baca/tulis bergantung pada server jarak jauh sehingga gagal ketika offline, memerlukan login, menimbulkan biaya penyimpanan server, serta memperbesar risiko kebocoran data terpusat.

## Decision

Finora mengadopsi **arsitektur Local-First** di mana perangkat pengguna (browser) bertindak sebagai penyimpan sumber kebenaran (*single source of truth*) sekaligus mesin eksekusi seluruh logika bisnis, validasi, agregasi, dan pelaporan keuangan.

Secara spesifik:
1. Seluruh entitas domain disimpan lokal di IndexedDB (`FinoraDB`).
2. Tidak ada ketergantungan koneksi jaringan setelah *application shell* ter-cache.
3. Kepemilikan penuh atas ekspor/impor data diberikan kepada pengguna melalui JSON Backup dan CSV.

## Alternatives

1. **Cloud-First dengan Sinkronisasi Opsional**:
   - *Kelebihan*: Data langsung tersedia lintas perangkat setelah login.
   - *Alasan Ditolak*: Memerlukan infrastruktur server, sistem autentikasi, kebijakan retensi data server, dan melanggar tujuan inti *zero-signup privacy-first* untuk rilis MVP.
2. **Offline-Cache + Backend Queue (Hybrid Sync)**:
   - *Kelebihan*: Tetap bisa offline sementara sebelum disinkronkan ke server.
   - *Alasan Ditolak*: Memperkenalkan kompleksitas *conflict resolution* (CRDT/OT), manajemen token sesi, dan tetap menyimpan data finansial pengguna di server cloud.

## Consequences

- **Positif**:
  - Privasi pengguna terlindungi secara struktural karena data finansial tidak pernah meninggalkan perangkat.
  - Latensi UI sangat rendah (pembacaan dan penulisan lokal dalam hitungan milidetik).
  - Pengalaman *zero-signup* memangkas hambatan penggunaan hari pertama.
- **Negatif / Trade-off**:
  - Data terikat pada origin browser pada perangkat tertentu; pengguna wajib memanfaatkan fitur Backup JSON secara berkala ([BACKUP_RESTORE.md](../../05-security/BACKUP_RESTORE.md)).
  - Sinkronisasi otomatis real-time antar-perangkat tidak tersedia di MVP.
  - Akses ke browser/perangkat yang tidak terkunci secara fisik dapat membaca IndexedDB lokal ([SECURITY.md](../../05-security/SECURITY.md)).
