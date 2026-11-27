# ADR-002: Pemilihan IndexedDB dan Dexie.js sebagai Persistensi Lokal

**Status**: Accepted  
**Tanggal Keputusan**: 2026-11-27  
**Dokumen Terkait**: [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md) | [DATA_DICTIONARY.md](../DATA_DICTIONARY.md) | [ADR-001](./ADR-001-local-first-architecture.md)

---

## Context

Finora membutuhkan penyimpanan lokal di browser yang mampu menampung ribuan hingga puluhan ribu transaksi, mendukung kueri rentang tanggal dan filter gabungan (`[type+date]`, `[categoryId+date]`), menyediakan transaksi atomik lintas-tabel (untuk target keuangan, *reassignment* kategori, materialisasi berulang, dan restore backup), serta mendukung migrasi skema berversi di masa depan.

## Decision

Finora menggunakan **IndexedDB** sebagai mesin basis data browser dan **Dexie.js** sebagai pustaka pembungkus TypeScript resmi, yang dipasangkan dengan **Zod** pada batas validasi input/impor.

## Alternatives

1. **`localStorage` / `sessionStorage`**:
   - *Alasan Ditolak*: Kapasitas terbatas (~5 MB), API sinkron yang memblokir *main thread* UI saat serialisasi JSON besar, tidak mendukung indeks kueri, dan tidak memiliki transaksi atomik lintas-entitas.
2. **IndexedDB API Native (tanpa wrapper)**:
   - *Alasan Ditolak*: API berbasis event callback (`IDBRequest`) sangat verbos, rawan kesalahan pada pengelolaan versi/upgrade transaksi, dan tidak memiliki *reactive live query* bawaan untuk React.
3. **SQLite WASM / OPFS (Origin Private File System)**:
   - *Alasan Ditolak*: Menambah ukuran bundel WASM signifikan, memerlukan konfigurasi header `Cross-Origin-Embedder-Policy` (`COEP`) untuk performa optimal yang berisiko berbenturan dengan aset/ekosistem PWA di beberapa browser seluler, dan melebihi kebutuhan kueri MVP.

## Consequences

- **Positif**:
  - Dukungan penuh transaksi atomik `db.transaction('rw', ...)` untuk menjaga integritas multi-tabel (`NFR-003`).
  - *Compound indexes* mempercepat agregasi Dashboard bulan berjalan (`NFR-001`).
  - `useLiveQuery` dari `dexie-react-hooks` menyederhanakan sinkronisasi reaktif UI dengan mutasi database.
  - Jalur migrasi skema `version(n).upgrade(...)` jelas dan terstruktur (`DATA-007`).
- **Negatif / Trade-off**:
  - IndexedDB tidak menegakkan *foreign key constraints* atau tipe kolom secara ketat; oleh karena itu seluruh validasi skema dan integritas referensial harus ditegakkan di *Service Layer* menggunakan Zod (`SEC-002`, `DATA-004`).
  - Browser dapat membersihkan penyimpanan pada kondisi disk kritis apabila origin tidak berstatus *persistent storage* (`DATA-008`).
