# Finora — *Your Money, Your Control.*

**Finora** adalah aplikasi manajemen keuangan pribadi (*Personal Finance Management*) berbasis web progresif (**PWA**) dengan arsitektur **Local-First**, **Offline-First**, dan **Privacy-First** untuk pengguna Indonesia (`id-ID` / `IDR`).

Seluruh catatan transaksi, kategori, anggaran bulanan, target tabungan, jadwal transaksi berulang, analitik, dan laporan disimpan secara lokal di browser pengguna menggunakan **IndexedDB (Dexie.js)**. Aplikasi ini dirancang tanpa registrasi wajib, tanpa autentikasi, tanpa database cloud, dan tanpa pengiriman data keuangan ke server pihak ketiga. **Vercel** berperan murni sebagai platform hosting dan distribusi aset aplikasi via HTTPS.

> **Status Proyek Saat Ini**: **Tahap Perencanaan & Spesifikasi Selesai (Pre-Implementation)**. Kode aplikasi belum diimplementasikan; seluruh spesifikasi produk, arsitektur, desain UI/UX, keamanan, pengujian, dan backlog tersedia lengkap di direktori [`docs/`](./docs/00-overview/DOCUMENTATION_INDEX.md).

---

## Prinsip Utama

- **Privacy First & Zero Telemetry**: Tidak ada skrip analitik pihak ketiga, tidak ada tracking cookie, dan 0 pengiriman data keuangan keluar perangkat.
- **Local-First & Offline-First**: Berfungsi penuh secara luring setelah kunjungan pertama melalui Service Worker + IndexedDB (`FinoraDB`).
- **User Data Ownership**: Ekspor laporan CSV (aman dari *formula injection*) dan ekspor/impor penuh Backup JSON berversi dengan verifikasi checksum `SHA-256`.
- **Financial Accuracy**: Nominal IDR disimpan sebagai integer aman (`SafeInteger`), tanggal bisnis memakai kalender lokal `YYYY-MM-DD`, dan tabungan target (*earmark*) dipisahkan dari pengeluaran riil (*anti-double counting*).

---

## Stack Teknologi Baseline

| Lapisan | Teknologi |
|---|---|
| **Frontend** | Next.js (App Router), React, TypeScript (`strict: true`), Tailwind CSS, shadcn/ui, Lucide Icons |
| **Penyimpanan & Validasi Lokal** | IndexedDB, Dexie.js, Zod |
| **Visualisasi & Utilitas** | Recharts, `date-fns`, `Intl.NumberFormat('id-ID')` |
| **PWA** | Web App Manifest, Service Worker (`@serwist/next` / SW TypeScript), Offline Fallback `/offline` |
| **Hosting & CI/CD** | GitHub, Vercel (Static/CDN + 8 HTTP Security Headers) |

---

## Navigasi Dokumentasi Cepat

Mulai eksplorasi dari [Indeks Dokumentasi Lengkap](./docs/00-overview/DOCUMENTATION_INDEX.md):

| Direktori | Fokus Dokumentasi | Dokumen Kunci |
|---|---|---|
| [`docs/00-overview/`](./docs/00-overview/PROJECT_OVERVIEW.md) | Ringkasan proyek, indeks, dan glosarium istilah | [PROJECT_OVERVIEW.md](./docs/00-overview/PROJECT_OVERVIEW.md), [GLOSSARY.md](./docs/00-overview/GLOSSARY.md) |
| [`docs/01-product/`](./docs/01-product/BRD.md) | Kebutuhan bisnis, spesifikasi produk, user stories, use cases | [BRD.md](./docs/01-product/BRD.md), [PRD.md](./docs/01-product/PRD.md), [USER_STORIES.md](./docs/01-product/USER_STORIES.md) |
| [`docs/02-requirements/`](./docs/02-requirements/REQUIREMENTS.md) | SRS, registri 59 kebutuhan, 20 aturan finansial, matriks keterlacakan | [REQUIREMENTS.md](./docs/02-requirements/REQUIREMENTS.md), [BUSINESS_RULES.md](./docs/02-requirements/BUSINESS_RULES.md), [TRACEABILITY.md](./docs/02-requirements/TRACEABILITY.md) |
| [`docs/03-architecture/`](./docs/03-architecture/SYSTEM_ARCHITECTURE.md) | Arsitektur sistem, skema `FinoraDB`, data dictionary, alur data, service layer, 6 ADR | [SYSTEM_ARCHITECTURE.md](./docs/03-architecture/SYSTEM_ARCHITECTURE.md), [DATABASE_SCHEMA.md](./docs/03-architecture/DATABASE_SCHEMA.md), [API_DESIGN.md](./docs/03-architecture/API_DESIGN.md) |
| [`docs/04-design/`](./docs/04-design/STYLING.md) | Sistem desain Dark/Light WCAG 2.1, komponen UI, layout responsif, 12 halaman | [STYLING.md](./docs/04-design/STYLING.md), [PAGE_SPECIFICATIONS.md](./docs/04-design/PAGE_SPECIFICATIONS.md) |
| [`docs/05-security/`](./docs/05-security/SECURITY.md) | Model ancaman, CSP & 8 headers wajib, privasi, spesifikasi backup/restore JSON | [SECURITY.md](./docs/05-security/SECURITY.md), [BACKUP_RESTORE.md](./docs/05-security/BACKUP_RESTORE.md) |
| [`docs/06-pwa/`](./docs/06-pwa/PWA_STRATEGY.md) | Strategi manifest, Service Worker, isolasi cache, skenario offline | [PWA_STRATEGY.md](./docs/06-pwa/PWA_STRATEGY.md), [OFFLINE_BEHAVIOR.md](./docs/06-pwa/OFFLINE_BEHAVIOR.md) |
| [`docs/07-development/`](./docs/07-development/AGENT_BRIEF.md) | Brief agen implementasi, standar coding, workflow Git, struktur folder | [AGENT_BRIEF.md](./docs/07-development/AGENT_BRIEF.md), [CODING_STANDARDS.md](./docs/07-development/CODING_STANDARDS.md) |
| [`docs/08-testing/`](./docs/08-testing/TESTING.md) | Strategi QA, 40 kasus uji kanonik (`TC-001`–`TC-040`), checklist rilis QA | [TESTING.md](./docs/08-testing/TESTING.md), [TEST_CASES.md](./docs/08-testing/TEST_CASES.md) |
| [`docs/09-deployment/`](./docs/09-deployment/DEPLOYMENT.md) | Konfigurasi Vercel, keamanan deployment, verifikasi PWA, rollback | [DEPLOYMENT.md](./docs/09-deployment/DEPLOYMENT.md), [RELEASE_CHECKLIST.md](./docs/09-deployment/RELEASE_CHECKLIST.md) |
| [`docs/10-planning/`](./docs/10-planning/ROADMAP.md) | Roadmap 6 fase, backlog berjenjang (`EPIC`/`STORY`/`TASK`), dan milestone | [ROADMAP.md](./docs/10-planning/ROADMAP.md), [BACKLOG.md](./docs/10-planning/BACKLOG.md) |
| [Audit Dokumentasi](./docs/DOCUMENTATION_AUDIT.md) | Laporan validasi silang, temuan konsistensi, dan pertanyaan terbuka sebelum coding | [DOCUMENTATION_AUDIT.md](./docs/DOCUMENTATION_AUDIT.md) |

---

## Untuk Pengembang & AI Coding Agent

Sebelum memulai implementasi Phase 1:
1. Baca [`AGENTS.md`](./AGENTS.md) dan [`docs/07-development/AGENT_BRIEF.md`](./docs/07-development/AGENT_BRIEF.md).
2. Tinjau *Open Questions* di [`docs/DOCUMENTATION_AUDIT.md`](./docs/DOCUMENTATION_AUDIT.md) (termasuk penentuan lokasi root proyek Next.js vs subdirektori `finora/` dan verifikasi strategi CSP + PWA).
3. Eksekusi tugas secara berurutan mengikuti [`docs/10-planning/BACKLOG.md`](./docs/10-planning/BACKLOG.md).
