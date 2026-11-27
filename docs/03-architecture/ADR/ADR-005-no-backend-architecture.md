# ADR-005: Keputusan Tanpa Backend, Tanpa Autentikasi, dan Tanpa Database Cloud

**Status**: Accepted  
**Tanggal Keputusan**: 2026-11-27  
**Dokumen Terkait**: [BRD.md](../../01-product/BRD.md) | [PRIVACY.md](../../05-security/PRIVACY.md) | [API_DESIGN.md](../API_DESIGN.md)

---

## Context

Banyak aplikasi keuangan meminta pengguna membuat akun dan mengirimkan seluruh catatan keuangan ke server cloud. Hal ini menciptakan friksi pengguna baru, menambah permukaan serangan server (kebocoran database terpusat, peretasan akun), memicu beban kepatuhan penyimpanan data sensitif, serta membutuhkan biaya operasional backend dan database berkelanjutan.

## Decision

Finora secara tegas memilih **arsitektur Tanpa Backend (*Zero-Backend*)**:
- Tidak ada API endpoint penyimpanan data (`/api/*`).
- Tidak ada sistem registrasi, login, password, atau OAuth.
- Tidak ada basis data eksternal (PostgreSQL, MySQL, Firebase, Supabase, MongoDB, dll.).
- Tidak ada sinkronisasi cloud otomatis pada rilis MVP.
- Vercel hanya menjadi host statis/edge pengirim aset antarmuka.

## Alternatives

1. **Backend Minimalis untuk Auth + Backup Cloud Terenkripsi**:
   - *Alasan Ditolak*: Tetap membutuhkan server, manajemen akun/pemulihan password, penyimpanan blob pengguna, dan menyimpang dari batasan proyek yang menuntut nol backend serta nol autentikasi wajib.
2. **Integrasi OAuth Google Drive / iCloud API Langsung dari Klien**:
   - *Alasan Ditolak*: Menambah ketergantungan OAuth client secret/consent screen pihak ketiga dan domain eksternal pada `connect-src` CSP; dapat dievaluasi terpisah sebagai ekstensi opsional jauh setelah MVP.

## Consequences

- **Positif**:
  - Kepatuhan privasi absolut: penyelenggara aplikasi secara teknis **tidak bisa** melihat atau membocorkan catatan keuangan pengguna.
  - Biaya operasional server mendekati nol dan bebas risiko downtime database backend.
  - Onboarding instan (`US-001`).
- **Negatif / Trade-off**:
  - Tidak ada fitur "Lupa Password" atau "Login di HP baru langsung muncul data" secara otomatis; seluruh pemulihan lintas perangkat bergantung pada Backup JSON manual (`ADR-006`).
  - Fitur kolaboratif seperti dompet keluarga bersama tidak dimungkinkan pada arsitektur ini.
