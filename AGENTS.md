# AGENTS.md — Panduan Otoritatif AI Coding Agent untuk Finora

Dokumen ini adalah titik masuk wajib bagi setiap AI coding agent (dan pengembang) yang bekerja di repositori **Finora**.

---

## 1. Status Repositori Saat Ini

Saat ini repositori berada pada fase **dokumentasi lengkap siap implementasi**. Sebelum menulis kode aplikasi apa pun, baca dan patuhi seluruh spesifikasi di direktori `docs/`.

---

## 2. Urutan Baca Wajib Sebelum Coding

1. [AGENT_BRIEF.md](./docs/07-development/AGENT_BRIEF.md) — Konteks, urutan implementasi, larangan, dan Definition of Done.
2. [DOCUMENTATION_AUDIT.md](./docs/DOCUMENTATION_AUDIT.md) — Pertanyaan terbuka (*Open Questions*) yang harus dikonfirmasi sebelum Phase 1.
3. [CODING_STANDARDS.md](./docs/07-development/CODING_STANDARDS.md) & [PROJECT_STRUCTURE.md](./docs/07-development/PROJECT_STRUCTURE.md).
4. [BUSINESS_RULES.md](./docs/02-requirements/BUSINESS_RULES.md) — Acuan tunggal seluruh rumus keuangan (`RULE-001` – `RULE-020`).
5. [DATABASE_SCHEMA.md](./docs/03-architecture/DATABASE_SCHEMA.md) & [API_DESIGN.md](./docs/03-architecture/API_DESIGN.md).
6. [STYLING.md](./docs/04-design/STYLING.md) & [PAGE_SPECIFICATIONS.md](./docs/04-design/PAGE_SPECIFICATIONS.md).
7. [SECURITY.md](./docs/05-security/SECURITY.md), [BACKUP_RESTORE.md](./docs/05-security/BACKUP_RESTORE.md), dan [PWA_STRATEGY.md](./docs/06-pwa/PWA_STRATEGY.md).

---

## 3. Aturan Arsitektur Keras (*Hard Guardrails*)

- **ZERO BACKEND**: Jangan membuat `/api/*`, server database, login/auth, atau sinkronisasi cloud.
- **ZERO TELEMETRY**: Jangan memasang analytics tracker, cookie tracking, atau font/script CDN eksternal.
- **LOCAL STORAGE ONLY**: Seluruh data pengguna disimpan di IndexedDB (`FinoraDB` via Dexie.js) dan divalidasi dengan Zod `.strict()`.
- **NO FINANCIAL DATA IN SW CACHE**: Service Worker `CacheStorage` hanya untuk aset aplikasi/statis; dilarang menyimpan data transaksi/backup di CacheStorage.
- **INTEGER IDR ONLY**: Semua nominal uang adalah integer aman (`Number.isSafeInteger`). Tanggal transaksi memakai `YYYY-MM-DD` lokal (`date-fns`), bukan `.toISOString().slice(0, 10)`.
- **ANTI-DOUBLE COUNTING**: Setoran/penarikan target keuangan hanya ditulis ke `goalContributions` dan memperbarui `financialGoals.currentAmount`, bukan membuat transaksi `expense`.
- **DARK MODE BUTTON CONTRAST**: Teks tombol di atas warna aksen `#10B981` wajib `#0B1220` (`7.38:1`), bukan putih.
- **CSP TANPA `'unsafe-eval'`**: Jangan menambahkan `'unsafe-eval'` atau `dangerouslySetInnerHTML` di produksi.

---

## 4. Alur Eksekusi Tugas

Kerjakan implementasi secara bertahap sesuai [ROADMAP.md](./docs/10-planning/ROADMAP.md) dan [BACKLOG.md](./docs/10-planning/BACKLOG.md), serta buktikan pemenuhan setiap tugas menggunakan kasus uji di [TEST_CASES.md](./docs/08-testing/TEST_CASES.md). Jika terdapat kebutuhan yang menyimpang dari spesifikasi `/docs`, dokumentasikan pembaruannya di `/docs` (termasuk ADR bila menyangkut keputusan arsitektur) setelah mendapat persetujuan.
