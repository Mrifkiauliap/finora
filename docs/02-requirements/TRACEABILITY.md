# Requirements Traceability Matrix (RTM) — Finora

**Versi Dokumen**: 1.0.0  
**Tujuan**: Menjamin keterlacakan penuh (*end-to-end traceability*) dari kebutuhan bisnis (`BR`), fitur produk (`FEAT`), kebutuhan perangkat lunak (`FR`/`NFR`/`SEC`/`PWA`/`DATA`), cerita pengguna (`US`), aturan bisnis (`RULE`), tugas implementasi (`STORY`/`TASK`), hingga kasus uji (`TC`).  
**Dokumen Terkait**: [BRD.md](../01-product/BRD.md) | [PRD.md](../01-product/PRD.md) | [REQUIREMENTS.md](./REQUIREMENTS.md) | [BACKLOG.md](../10-planning/BACKLOG.md) | [TEST_CASES.md](../08-testing/TEST_CASES.md)

---

## 1. Matriks Keterlacakan Kebutuhan Fungsional & Bisnis

| Business Req | Feature | Software Req | User Story | Business Rule | Backlog Task/Story | Test Case |
|---|---|---|---|---|---|---|
| `BR-001`, `BR-002` | `FEAT-001`, `FEAT-012` | `FR-001` | `US-001` | `RULE-019` | `STORY-002`, `TASK-006`, `TASK-007` | `TC-001`, `TC-002` |
| `BR-003`, `BR-008` | `FEAT-001` | `FR-002` | `US-002` | `RULE-002`–`RULE-005`, `RULE-018` | `STORY-007`, `TASK-016` | `TC-003`, `TC-004` |
| `BR-003` | `FEAT-002` | `FR-003` | `US-003` | `RULE-001`, `RULE-006`, `RULE-007`, `RULE-012` | `STORY-005`, `TASK-011`, `TASK-012` | `TC-005`, `TC-006`, `TC-007` |
| `BR-003` | `FEAT-002` | `FR-004` | `US-004` | `RULE-006`, `RULE-013` | `STORY-005`, `TASK-013` | `TC-008` |
| `BR-003` | `FEAT-002` | `FR-005` | `US-005` | `RULE-002`, `RULE-004` | `STORY-005`, `TASK-013` | `TC-009` |
| `BR-003` | `FEAT-003` | `FR-006` | `US-006` | `RULE-012` | `STORY-006`, `TASK-014`, `TASK-015` | `TC-010`, `TC-011` |
| `BR-004` | `FEAT-004` | `FR-007` | `US-007` | `RULE-019` | `STORY-008`, `TASK-017` | `TC-012` |
| `BR-004` | `FEAT-004` | `FR-008` | `US-008` | `RULE-019`, `RULE-020` | `STORY-008`, `TASK-018` | `TC-013`, `TC-014` |
| `BR-005` | `FEAT-005` | `FR-009` | `US-009` | `RULE-008`, `RULE-011` | `STORY-009`, `TASK-019`, `TASK-020` | `TC-015`, `TC-016` |
| `BR-005` | `FEAT-005` | `FR-010` | `US-010` | `RULE-009`, `RULE-010` | `STORY-010`, `TASK-021` | `TC-017`, `TC-018` |
| `BR-006` | `FEAT-006` | `FR-011` | `US-011` | `RULE-018` | `STORY-011`, `TASK-022` | `TC-019` |
| `BR-006` | `FEAT-006` | `FR-012` | `US-012` | `RULE-017`, `RULE-018` | `STORY-012`, `TASK-023` | `TC-020`, `TC-021` |
| `BR-007` | `FEAT-007` | `FR-013` | `US-013` | `RULE-014`, `RULE-016` | `STORY-013`, `TASK-024` | `TC-022` |
| `BR-007` | `FEAT-007` | `FR-014` | `US-014` | `RULE-014`, `RULE-015`, `RULE-016` | `STORY-014`, `TASK-025`, `TASK-026` | `TC-023`, `TC-024` |
| `BR-008` | `FEAT-008` | `FR-015` | `US-015` | `RULE-002`, `RULE-003` | `STORY-015`, `TASK-027`, `TASK-028` | `TC-025` |
| `BR-008` | `FEAT-008` | `FR-016` | `US-016` | `RULE-005`, `RULE-010` | `STORY-016`, `TASK-029` | `TC-026` |
| `BR-008` | `FEAT-009` | `FR-017` | `US-017` | `RULE-001`, `RULE-012` | `STORY-017`, `TASK-030`, `TASK-031` | `TC-027`, `TC-028` |
| `BR-001`, `BR-010` | `FEAT-010` | `FR-018` | `US-018`, `US-019` | `RULE-001` | `STORY-018`, `TASK-032`, `TASK-033` | `TC-029` |
| `BR-001` | `FEAT-010` | `FR-019` | `US-022` | `RULE-019` | `STORY-018`, `TASK-034` | `TC-030` |
| `BR-009` | `FEAT-011` | `FR-020` | `US-020` | `RULE-013` | `STORY-019`, `TASK-035` | `TC-031` |
| `BR-009` | `FEAT-011` | `FR-021` | `US-021` | `RULE-001`, `RULE-006` | `STORY-020`, `TASK-036`, `TASK-037` | `TC-032`, `TC-033` |
| `BR-009` | `FEAT-011` | `FR-022` | `US-021` | `RULE-008`, `RULE-019` | `STORY-020`, `TASK-038` | `TC-034`, `TC-035` |
| `BR-009` | `FEAT-010`, `FEAT-011` | `FR-023` | `US-020` | `RULE-013` | `STORY-019`, `TASK-035` | `TC-031` |
| `BR-010` | `FEAT-001`, `FEAT-012` | `FR-024` | `US-002`, `US-023`, `US-024` | — | `STORY-003`, `STORY-022`, `TASK-008`, `TASK-009`, `TASK-041` | `TC-038`, `TC-039`, `TC-040` |
| `BR-011` | `FEAT-013` | `FR-025`, `FR-026`, `FR-027` | `US-001` | — | `STORY-025`, `STORY-026`, `TASK-049`–`TASK-053` | `TC-041`, `TC-042`, `TC-043`, `TC-044` |

---

## 2. Matriks Keterlacakan Non-Fungsional, Keamanan, PWA & Data

| Requirement ID | Kategori | Business Req / ADR Terkait | Backlog Task/Story | Test Case / Verifikasi |
|---|---|---|---|---|
| `NFR-001` | Kinerja Query | `BR-003`, `ADR-002` | `STORY-004`, `TASK-010`, `TASK-042` | `TC-036` |
| `NFR-002` | Web Vitals | `BR-010`, `ADR-003` | `STORY-024`, `TASK-046` | `TC-040` |
| `NFR-003` | Atomisitas DB | `BR-004`, `BR-006`, `BR-009` | `STORY-004`, `TASK-018`, `TASK-023`, `TASK-038` | `TC-014`, `TC-020`, `TC-034` |
| `NFR-004` | Aksesibilitas WCAG | `BR-010` | `STORY-003`, `TASK-008`, `TASK-032` | `TC-029`, `TC-039` |
| `NFR-005` | Responsivitas | `BR-010` | `STORY-003`, `TASK-008`, `TASK-009` | `TC-039` |
| `NFR-006` | Tipografi Angka IDR | `BR-003` | `STORY-001`, `TASK-004`, `TASK-011` | `TC-005` |
| `NFR-007` | TypeScript & Lint | `ADR-003` | `STORY-001`, `TASK-001`, `TASK-043` | `TC-040` |
| `NFR-008` | Error Handling | `BR-009`, `BR-010` | `STORY-004`, `TASK-010`, `TASK-037` | `TC-032`, `TC-038` |
| `NFR-009` | Zero Telemetry | `BR-001`, `ADR-005` | `STORY-021`, `TASK-039`, `TASK-044` | `TC-037` |
| `NFR-010` | Lintas Browser | `BR-010` | `STORY-024`, `TASK-047` | `TC-039`, `TC-040` |
| `NFR-011` | Isolasi Publik dari IDB | `BR-011`, `ADR-005` | `STORY-025`, `TASK-049`, `TASK-050` | `TC-042`, `TC-043` |
| `SEC-001` | Anti-XSS | `BR-001` | `STORY-021`, `TASK-039`, `TASK-043` | `TC-037` |
| `SEC-002` | Validasi Zod Ketat | `BR-001`, `BR-009` | `STORY-004`, `TASK-010`, `TASK-036` | `TC-006`, `TC-033` |
| `SEC-003` | Anti-Prototype Pollution | `BR-009`, `ADR-006` | `STORY-020`, `TASK-036` | `TC-033` |
| `SEC-004` | Checksum Backup | `BR-009`, `ADR-006` | `STORY-019`, `STORY-020`, `TASK-035`, `TASK-036` | `TC-031`, `TC-032` |
| `SEC-005` | Batas Upload File | `BR-009` | `STORY-020`, `TASK-036` | `TC-033` |
| `SEC-006` | CSV Injection Guard | `BR-008` | `STORY-017`, `TASK-030` | `TC-028` |
| `SEC-007` | 8 HTTP Security Headers | `BR-001`, `ADR-003` | `STORY-021`, `TASK-040`, `TASK-045` | `TC-037`, `TC-040` |
| `SEC-008` | Nol Transmisi Server | `BR-001`, `ADR-005` | `STORY-021`, `TASK-039` | `TC-037` |
| `SEC-009` | Audit Dependensi | `BR-001` | `STORY-024`, `TASK-045` | `TC-040` |
| `SEC-010` | Konfirmasi Ketik Aksi Kritis | `BR-009` | `STORY-018`, `STORY-020`, `TASK-034`, `TASK-038` | `TC-030`, `TC-034` |
| `PWA-001` | Web App Manifest | `BR-010`, `ADR-004` | `STORY-022`, `TASK-041` | `TC-038`, `TC-040` |
| `PWA-002` | Siklus Hidup SW | `BR-010`, `ADR-004` | `STORY-022`, `TASK-041` | `TC-038` |
| `PWA-003` | Caching App Shell | `BR-010`, `ADR-004` | `STORY-022`, `TASK-041` | `TC-038` |
| `PWA-004` | Isolasi Data dari SW Cache | `BR-001`, `ADR-004` | `STORY-022`, `TASK-041` | `TC-037`, `TC-038` |
| `PWA-005` | Fallback `/offline` | `BR-010`, `ADR-004` | `STORY-022`, `TASK-041` | `TC-038` |
| `PWA-006` | Indikator Offline UI | `BR-010` | `STORY-022`, `TASK-041` | `TC-038` |
| `PWA-007` | Installability | `BR-010`, `ADR-004` | `STORY-022`, `TASK-041` | `TC-040` |
| `DATA-001` | Skema `FinoraDB` v1 | `BR-001`–`BR-007`, `ADR-002` | `STORY-002`, `TASK-005` | `TC-001` |
| `DATA-002` | Integer Aman IDR | `BR-003`, `RULE-001` | `STORY-004`, `TASK-010` | `TC-006` |
| `DATA-003` | Tanggal Lokal & UTC | `BR-003`, `RULE-012`, `RULE-013` | `STORY-004`, `TASK-010`, `TASK-025` | `TC-007` |
| `DATA-004` | Integritas Referensial | `BR-004`, `BR-006` | `STORY-008`, `TASK-018`, `TASK-023` | `TC-014`, `TC-020` |
| `DATA-005` | Keunikan Kunci Bisnis | `BR-005`, `BR-007` | `STORY-009`, `TASK-019`, `TASK-025` | `TC-015`, `TC-024` |
| `DATA-006` | Envelope Backup v1 | `BR-009`, `ADR-006` | `STORY-019`, `TASK-035`, `TASK-036` | `TC-031`, `TC-032` |
| `DATA-007` | Migrasi Versi Skema | `BR-009`, `ADR-002` | `STORY-002`, `TASK-005`, `TASK-036` | `TC-035` |
| `DATA-008` | Kuota & Persistensi Storage | `BR-001`, `BR-010` | `STORY-023`, `TASK-042` | `TC-038` |

---

## 3. Verifikasi Cakupan Menyeluruh

- **Total Business Requirements (`BR`)**: 11 (`BR-001` – `BR-011`) — **100% terpetakan**.
- **Total Features (`FEAT`)**: 13 (`FEAT-001` – `FEAT-013`) — **100% terpetakan**.
- **Total Software Requirements**: 63 (`27 FR + 11 NFR + 10 SEC + 7 PWA + 8 DATA`) — **100% terpetakan**.
- **Total User Stories (`US`)**: 24 (`US-001` – `US-024`) — **100% terpetakan**.
- **Total Test Cases (`TC`)**: 44 (`TC-001` – `TC-044`) — **100% terpetakan**.
