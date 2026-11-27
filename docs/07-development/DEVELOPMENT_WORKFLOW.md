# Development Workflow — Finora

**Versi Dokumen**: 1.0.0  
**Dokumen Terkait**: [CODING_STANDARDS.md](./CODING_STANDARDS.md) | [TESTING.md](../08-testing/TESTING.md) | [DEPLOYMENT.md](../09-deployment/DEPLOYMENT.md)

---

## 1. Strategi Branching (*Git Workflow*)

> Catatan Awal Repositori: Saat paket dokumentasi ini dibuat, repositori lokal belum diinisialisasi Git (`.git` belum ada). Inisialisasi Git dan hubungkan ke remote GitHub pada langkah awal Phase 1 (`TASK-001`).

- **`main`**: Branch produksi yang selalu dalam kondisi *deployable* dan terhubung langsung ke Vercel Production. Dilarang push langsung tanpa melewati verifikasi lokal/PR.
- **`feat/<task-id>-<slug>`**: Branch pengembangan fitur baru (contoh: `feat/task-011-transaction-crud`).
- **`fix/<id>-<slug>`**: Branch perbaikan bug disertai regression test (contoh: `fix/eom-clamping-feb`).
- **`docs/<slug>`** / **`chore/<slug>`**: Pembaruan dokumentasi, dependensi, atau konfigurasi build/CI.

---

## 2. Konvensi Commit (*Conventional Commits*)

Gunakan format Conventional Commits:
```text
<type>(<scope>): <ringkasan singkat imperatif>
```
- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `security`, `perf`.
- **Scopes Umum**: `db`, `domain`, `transactions`, `budgets`, `goals`, `recurring`, `analytics`, `backup`, `pwa`, `security`, `ui`, `docs`.
- **Contoh**:
  - `feat(transactions): implement create and edit form with Zod IDR validation`
  - `fix(recurring): preserve anchorDay 31 after February clamping`
  - `security(backup): enforce SHA-256 checksum and prototype key check`

---

## 3. Alur Pull Request & Code Review

1. **Prasyarat Sebelum Membuka PR**:
   - Jalankan `npm run typecheck` (`tsc --noEmit`).
   - Jalankan `npm run lint`.
   - Jalankan `npm run test` (seluruh unit & integration tests lulus).
   - Jalankan `npm run build` untuk memastikan build Next.js produksi & Service Worker sukses.
2. **Deskripsi PR Wajib Memuat**:
   - Referensi ID tugas (`STORY-XXX`, `TASK-XXX`) dan `FR`/`RULE` terkait.
   - Bukti verifikasi (hasil test + screenshot desktop/mobile untuk perubahan UI, termasuk Dark & Light mode).
   - Konfirmasi bahwa tidak ada endpoint backend baru, tracking eksternal, atau melemahkan CSP.
3. **Checklist Code Review**:
   - Apakah logika bisnis tetap murni di `src/domain/` dan mutasi lewat `src/services/`?
   - Apakah mutasi multi-tabel dibungkus `db.transaction('rw', ...)`?
   - Apakah kontras warna (terutama teks `#0B1220` di tombol `#10B981` dark mode) diikuti?
   - Apakah dokumen di `/docs` diperbarui jika terjadi perubahan kontrak?

---

## 4. Proses Rilis (*Release Process*)

1. Seluruh `STORY`/`TASK` untuk milestone terkait berstatus selesai dan lulus [QA_CHECKLIST.md](../08-testing/QA_CHECKLIST.md).
2. Buat PR dari branch fitur/release ke `main` dan verifikasi **Vercel Preview Deployment** (uji offline PWA, 8 HTTP security headers, dan zero network leakage).
3. Setelah PR di-merge ke `main`, Vercel otomatis membangun dan men-deploy ke produksi.
4. Jalankan verifikasi pasca-deployment sesuai [RELEASE_CHECKLIST.md](../09-deployment/RELEASE_CHECKLIST.md) dan tandai tag versi Git (mis. `v1.0.0`).
