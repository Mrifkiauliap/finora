# Project Milestones — Finora

**Versi Dokumen**: 1.0.0  
**Dokumen Terkait**: [ROADMAP.md](./ROADMAP.md) | [BACKLOG.md](./BACKLOG.md) | [RELEASE_CHECKLIST.md](../09-deployment/RELEASE_CHECKLIST.md)

---

| Milestone | Nama Milestone | Fase | Stories Tercakup | Deliverables Utama | Kriteria Keluar (*Exit Criteria*) |
|---|---|---|---|---|---|
| **M1** | **Technical Foundation & Design Shell** | Phase 1 | `STORY-001` – `STORY-004` | Proyek Next.js Strict + Tailwind Dark/Light tokens + `FinoraDB` v1 + `bootstrapService` + navigasi responsif & komponen shared | `typecheck` & `lint` bersih; kunjungan pertama otomatis seed 13 kategori; UI navigasi tampil rapi di `360px` & `1280px`. |
| **M2** | **Core Ledger & Dashboard Operational** | Phase 2 | `STORY-005` – `STORY-008` | CRUD transaksi, search/filter multi-kriteria, Dashboard KPI (`NetBalance`, `AvailableBalance`, `SavingsRate`), manajemen kategori & reassignment | Seluruh kasus uji `TC-001` s.d. `TC-014` lulus; tidak ada kategori/transaksi yatim saat hapus kategori. |
| **M3** | **Full Personal Finance Suite** | Phase 3 | `STORY-009` – `STORY-014` | Anggaran bulanan + salin bulan lalu, Target Keuangan (earmark anti-double counting), Transaksi Berulang lokal idempoten | Seluruh kasus uji `TC-015` s.d. `TC-024` lulus; uji *end-of-month clamping* & batas 366 catch-up terverifikasi. |
| **M4** | **Analytics & Portable Reporting** | Phase 4 | `STORY-015` – `STORY-017` | Halaman `/analytics` (Recharts + insight lokal) dan `/reports` (siap cetak + CSV UTF-8 BOM anti-injection) | `TC-025` s.d. `TC-028` lulus; ekspor CSV aman terhadap formula injection dan terbaca rapi di spreadsheet. |
| **M5** | **Hardened Offline PWA & Backup Ready** | Phase 5 | `STORY-018` – `STORY-023` | `/settings`, `/settings/backup` (JSON v1 + SHA-256 + Preview + Replace/Merge), PWA manifest + SW + `/offline`, 8 security headers + CSP, benchmark 5.000 tx | `TC-029` s.d. `TC-038` lulus; produksi build berjalan penuh dalam mode Offline; benchmark `<= 150 ms`. |
| **M6** | **Production Release v1.0.0 on Vercel** | Phase 6 | `STORY-024` | Vercel Production Deployment + verifikasi Lighthouse + cross-browser + tag `v1.0.0` | `TC-039`, `TC-040`, dan seluruh poin [RELEASE_CHECKLIST.md](../09-deployment/RELEASE_CHECKLIST.md) terpenuhi 100%. |
