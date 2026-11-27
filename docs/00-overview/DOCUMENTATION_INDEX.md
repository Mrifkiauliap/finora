# Documentation Index & Governance — Finora

**Versi Dokumen**: 1.0.0  
**Tujuan**: Peta lengkap seluruh paket dokumentasi Finora, urutan baca yang direkomendasikan, hubungan ketergantungan antar-dokumen, dan aturan *Single Source of Truth (SSOT)*.

---

## 1. Aturan Single Source of Truth (SSOT)

Apabila dijumpai perbedaan redaksi atau interpretasi antar dokumen, rujuk hierarki otoritas berikut:
1. **Visi, Batasan Tanpa-Backend & Privasi**: [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md), [ADR-005](../03-architecture/ADR/ADR-005-no-backend-architecture.md), [PRIVACY.md](../05-security/PRIVACY.md).
2. **Rumus Keuangan & Aturan Domain**: [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md) (`RULE-001` – `RULE-020`).
3. **Registri Kebutuhan & Keterlacakan**: [REQUIREMENTS.md](../02-requirements/REQUIREMENTS.md) & [TRACEABILITY.md](../02-requirements/TRACEABILITY.md).
4. **Skema Basis Data & Tipe Data**: [DATABASE_SCHEMA.md](../03-architecture/DATABASE_SCHEMA.md) & [DATA_DICTIONARY.md](../03-architecture/DATA_DICTIONARY.md).
5. **Identitas Visual, Warna & Kontras**: [STYLING.md](../04-design/STYLING.md).
6. **Keamanan, Header HTTP & Backup Format**: [SECURITY.md](../05-security/SECURITY.md) & [BACKUP_RESTORE.md](../05-security/BACKUP_RESTORE.md).
7. **Brief Eksekusi Agen Pengkodean**: [AGENT_BRIEF.md](../07-development/AGENT_BRIEF.md) & [AGENTS.md](../../AGENTS.md).

---

## 2. Urutan Baca yang Direkomendasikan

- **Untuk Product Manager / Business Analyst**: `PROJECT_OVERVIEW.md` → `GLOSSARY.md` → `BRD.md` → `PRD.md` → `USER_STORIES.md` → `USE_CASES.md`.
- **Untuk Software Architect / Tech Lead**: `PROJECT_OVERVIEW.md` → `SRS.md` → `BUSINESS_RULES.md` → `SYSTEM_ARCHITECTURE.md` → `ADR/*` → `DATABASE_SCHEMA.md` → `API_DESIGN.md`.
- **Untuk UI/UX Designer / Frontend Engineer**: `PRD.md` → `STYLING.md` → `COMPONENTS.md` → `LAYOUTS.md` → `PAGE_SPECIFICATIONS.md`.
- **Untuk AI Coding Agent Sebelum Menulis Kode**: `AGENTS.md` → `AGENT_BRIEF.md` → `CODING_STANDARDS.md` → `PROJECT_STRUCTURE.md` → `BUSINESS_RULES.md` → `DATABASE_SCHEMA.md` → `BACKLOG.md`.
- **Untuk Security, QA & DevOps**: `SECURITY.md` → `BACKUP_RESTORE.md` → `PWA_STRATEGY.md` → `TESTING.md` → `TEST_CASES.md` → `DEPLOYMENT.md` → `RELEASE_CHECKLIST.md`.

---

## 3. Indeks Lengkap Dokumen

### Root & Governance
| Dokumen | Deskripsi | Dependensi Utama |
|---|---|---|
| [README.md](../../README.md) | Ringkasan proyek, stack teknologi, navigasi docs, status tahap saat ini | `PROJECT_OVERVIEW.md`, `DOCUMENTATION_INDEX.md` |
| [AGENTS.md](../../AGENTS.md) | Panduan ringkas otoritatif bagi AI coding agent saat masuk ke repositori | `AGENT_BRIEF.md`, `CODING_STANDARDS.md` |
| [DOCUMENTATION_AUDIT.md](../DOCUMENTATION_AUDIT.md) | Hasil audit kelengkapan, konsistensi, link, ID, dan daftar pertanyaan terbuka | Seluruh paket `/docs` |

### `00-overview/` — Ikhtisar & Terminologi
| Dokumen | Deskripsi | Dependensi Utama |
|---|---|---|
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) | Pengenalan Finora, visi, masalah, tujuan, prinsip inti, scope & batasan | — |
| [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) | Indeks dokumentasi, urutan baca, dependensi, dan aturan SSOT | Seluruh dokumen |
| [GLOSSARY.md](./GLOSSARY.md) | Kamus istilah bisnis, keuangan, produk, teknis, dan konvensi ID | `PROJECT_OVERVIEW.md` |

### `01-product/` — Produk & Kebutuhan Bisnis
| Dokumen | Deskripsi | Dependensi Utama |
|---|---|---|
| [BRD.md](../01-product/BRD.md) | Kebutuhan bisnis (`BR-001`–`BR-010`), pemangku kepentingan, risiko, kriteria sukses | `PROJECT_OVERVIEW.md` |
| [PRD.md](../01-product/PRD.md) | Persona, user journeys, fitur (`FEAT-001`–`FEAT-012`), prioritas, definisi MVP | `BRD.md` |
| [USER_STORIES.md](../01-product/USER_STORIES.md) | 24 User Stories (`US-001`–`US-024`) dengan kriteria Given/When/Then | `PRD.md` |
| [USE_CASES.md](../01-product/USE_CASES.md) | 12 Use Cases (`UC-001`–`UC-012`) lengkap dengan alur alternatif & skenario error | `USER_STORIES.md` |

### `02-requirements/` — Spesifikasi & Aturan Bisnis
| Dokumen | Deskripsi | Dependensi Utama |
|---|---|---|
| [SRS.md](../02-requirements/SRS.md) | Software Requirements Specification terstruktur (konteks, antarmuka, batasan) | `PRD.md`, `BRD.md` |
| [REQUIREMENTS.md](../02-requirements/REQUIREMENTS.md) | Registri 59 kebutuhan unik (`FR`, `NFR`, `SEC`, `PWA`, `DATA`) beserta verifikasi | `SRS.md`, `USE_CASES.md` |
| [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md) | 20 aturan & rumus finansial eksak (`RULE-001`–`RULE-020`) | `PRD.md`, `GLOSSARY.md` |
| [TRACEABILITY.md](../02-requirements/TRACEABILITY.md) | Matriks keterlacakan penuh `BR` → `FEAT` → `REQ` → `US` → `TASK` → `TC` | `REQUIREMENTS.md`, `BACKLOG.md`, `TEST_CASES.md` |

### `03-architecture/` — Arsitektur, Skema & ADR
| Dokumen | Deskripsi | Dependensi Utama |
|---|---|---|
| [SYSTEM_ARCHITECTURE.md](../03-architecture/SYSTEM_ARCHITECTURE.md) | Arsitektur local-first, lapisan komponen, siklus hidup, offline & deployment (Mermaid) | `SRS.md` |
| [DATABASE_SCHEMA.md](../03-architecture/DATABASE_SCHEMA.md) | Skema `FinoraDB` Dexie.js v1 (7 tabel, indeks, ER diagram, strategi migrasi) | `BUSINESS_RULES.md` |
| [DATA_DICTIONARY.md](../03-architecture/DATA_DICTIONARY.md) | Spesifikasi setiap field, tipe, validasi Zod, nilai default, dan envelope backup | `DATABASE_SCHEMA.md` |
| [DATA_FLOW.md](../03-architecture/DATA_FLOW.md) | Diagram dan alur data 9 operasi inti (CRUD, agregasi, insights, backup/restore, CSV) | `SYSTEM_ARCHITECTURE.md`, `DATABASE_SCHEMA.md` |
| [API_DESIGN.md](../03-architecture/API_DESIGN.md) | Kontrak *Client-Side Service Layer* TypeScript dan pemisahan dari HTTP API | `SYSTEM_ARCHITECTURE.md`, `DATA_DICTIONARY.md` |
| [ADR-001](../03-architecture/ADR/ADR-001-local-first-architecture.md) | Keputusan arsitektur Local-First | `PROJECT_OVERVIEW.md` |
| [ADR-002](../03-architecture/ADR/ADR-002-indexeddb-dexie.md) | Keputusan IndexedDB + Dexie.js + Zod | `ADR-001` |
| [ADR-003](../03-architecture/ADR/ADR-003-nextjs-vercel-hosting.md) | Keputusan Next.js App Router + Vercel static/CDN hosting | `ADR-001` |
| [ADR-004](../03-architecture/ADR/ADR-004-pwa-service-worker.md) | Keputusan PWA, Web App Manifest & Service Worker | `ADR-003` |
| [ADR-005](../03-architecture/ADR/ADR-005-no-backend-architecture.md) | Keputusan nol backend, nol autentikasi, nol database cloud | `ADR-001`, `BRD.md` |
| [ADR-006](../03-architecture/ADR/ADR-006-json-backup-restore.md) | Keputusan format JSON berversi + SHA-256 checksum | `ADR-005` |

### `04-design/` — Sistem Desain & Spesifikasi Halaman
| Dokumen | Deskripsi | Dependensi Utama |
|---|---|---|
| [STYLING.md](../04-design/STYLING.md) | Sistem desain visual: palet Dark/Light terverifikasi WCAG 2.1, 60-30-10, tipografi, chart | `PRD.md` |
| [COMPONENTS.md](../04-design/COMPONENTS.md) | Spesifikasi komponen reusable (props, varian, state, aksesibilitas) | `STYLING.md`, `API_DESIGN.md` |
| [LAYOUTS.md](../04-design/LAYOUTS.md) | Tata letak desktop/tablet/mobile, sidebar, bottom nav, dashboard grid | `STYLING.md`, `COMPONENTS.md` |
| [PAGE_SPECIFICATIONS.md](../04-design/PAGE_SPECIFICATIONS.md) | Spesifikasi 11 halaman aplikasi `/app/*`, 4 halaman publik, & `/offline` | `LAYOUTS.md`, `COMPONENTS.md`, `API_DESIGN.md` |
| [LANDING_PAGE.md](../04-design/LANDING_PAGE.md) | Spesifikasi 13 seksi Landing Page `/`, mockup statis, dan visual editorial | `STYLING.md`, `PUBLIC_ROUTES.md` |
| [PUBLIC_ROUTES.md](../04-design/PUBLIC_ROUTES.md) | Pemisahan rute publik (`/`, `/features`, `/about`, `/privacy`) vs aplikasi `/app/*` | `PAGE_SPECIFICATIONS.md` |

### `05-security/` & `06-pwa/` — Keamanan, Privasi & Offline PWA
| Dokumen | Deskripsi | Dependensi Utama |
|---|---|---|
| [SECURITY.md](../05-security/SECURITY.md) | Model ancaman, anti-XSS, 8 HTTP security headers, kompatibilitas CSP + Next.js + PWA | `SYSTEM_ARCHITECTURE.md` |
| [PRIVACY.md](../05-security/PRIVACY.md) | Kepemilikan data, zero telemetry, batasan penyimpanan browser, penghapusan data | `SECURITY.md`, `ADR-005` |
| [BACKUP_RESTORE.md](../05-security/BACKUP_RESTORE.md) | Spesifikasi JSON envelope, 5 gerbang validasi impor, preview, Replace vs Merge | `DATA_DICTIONARY.md`, `SECURITY.md`, `ADR-006` |
| [PWA_STRATEGY.md](../06-pwa/PWA_STRATEGY.md) | Manifest, strategi cache SW, lifecycle update, isolasi cache dari data finansial | `ADR-004`, `SECURITY.md` |
| [OFFLINE_BEHAVIOR.md](../06-pwa/OFFLINE_BEHAVIOR.md) | Matriks perilaku 7 skenario online/offline/kuota/error IndexedDB | `PWA_STRATEGY.md`, `PRIVACY.md` |

### `07-development/`, `08-testing/`, `09-deployment/` & `10-planning/`
| Dokumen | Deskripsi | Dependensi Utama |
|---|---|---|
| [AGENT_BRIEF.md](../07-development/AGENT_BRIEF.md) | Brief utama implementasi untuk AI coding agent & developer | Seluruh arsitektur, desain & rules |
| [CODING_STANDARDS.md](../07-development/CODING_STANDARDS.md) | Konvensi TypeScript strict, React, penamaan, error handling, utilitas keuangan | `API_DESIGN.md` |
| [DEVELOPMENT_WORKFLOW.md](../07-development/DEVELOPMENT_WORKFLOW.md) | Branching, Conventional Commits, PR review, dan proses rilis | `CODING_STANDARDS.md` |
| [PROJECT_STRUCTURE.md](../07-development/PROJECT_STRUCTURE.md) | Struktur direktori kode usulan & pertanyaan terbuka lokasi app root (`OQ-01`) | `SYSTEM_ARCHITECTURE.md` |
| [TESTING.md](../08-testing/TESTING.md) | Strategi piramida pengujian (unit, integration `fake-indexeddb`, PWA, security) | `REQUIREMENTS.md`, `BUSINESS_RULES.md` |
| [TEST_CASES.md](../08-testing/TEST_CASES.md) | 40 kasus uji kanonik (`TC-001`–`TC-040`) beserta langkah & hasil yang diharapkan | `TESTING.md`, `REQUIREMENTS.md` |
| [QA_CHECKLIST.md](../08-testing/QA_CHECKLIST.md) | Daftar periksa praktis kesiapan kualitas sebelum rilis | `TEST_CASES.md` |
| [DEPLOYMENT.md](../09-deployment/DEPLOYMENT.md) | Panduan local dev, build produksi, GitHub → Vercel, headers, PWA verify & rollback | `SECURITY.md`, `PWA_STRATEGY.md` |
| [SEO.md](../09-deployment/SEO.md) | Metadata publik, Open Graph, `sitemap.ts`, `robots.ts`, dan privasi crawl `/app/*` | `PUBLIC_ROUTES.md`, `DEPLOYMENT.md` |
| [RELEASE_CHECKLIST.md](../09-deployment/RELEASE_CHECKLIST.md) | Langkah verifikasi pre-release, execution, dan post-release produksi | `DEPLOYMENT.md`, `QA_CHECKLIST.md` |
| [ROADMAP.md](../10-planning/ROADMAP.md) | Peta jalan 6 fase implementasi dari fondasi hingga produksi Vercel | `PRD.md`, `AGENT_BRIEF.md` |
| [BACKLOG.md](../10-planning/BACKLOG.md) | Backlog berjenjang `EPIC-01..06`, `STORY-001..024`, `TASK-001..048`, & protokol `BUG` | `ROADMAP.md`, `REQUIREMENTS.md` |
| [MILESTONES.md](../10-planning/MILESTONES.md) | 6 Milestone terukur (`M1`–`M6`) beserta deliverables dan exit criteria | `ROADMAP.md`, `BACKLOG.md` |
