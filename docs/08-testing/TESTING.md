# Testing Strategy — Finora

**Versi Dokumen**: 1.0.0  
**Dokumen Terkait**: [TEST_CASES.md](./TEST_CASES.md) | [QA_CHECKLIST.md](./QA_CHECKLIST.md) | [BUSINESS_RULES.md](../02-requirements/BUSINESS_RULES.md)

---

## 1. Piramida Pengujian Finora

Karena Finora memproses seluruh logika akuntansi pribadi dan persistensi basis data di sisi klien, prioritas pengujian tertingginya berada pada **Domain Logic**, **Service + IndexedDB Integration**, dan **Backup/Offline Resilience**.

| Lapisan Uji | Alat Rekomendasi | Fokus Utama | Target Cakupan |
|---|---|---|---|
| **Unit Testing** | Vitest | `domain/*` (rumus IDR, saldo, budget, goal, clamping, insights, CSV sanitizer), `schemas/*` (Zod `.strict()`), canonical JSON + SHA-256 | 100% cabang rumus `RULE-001`–`RULE-020` & validasi batas input |
| **Integration Testing** | Vitest + `fake-indexeddb` | `services/*` berinteraksi dengan `FinoraDB` asli: transaksi atomik, rollback, reassign kategori, idempotensi recurring, Replace/Merge backup, benchmark 5.000 transaksi (`NFR-001`) | Semua alur `UC-001`–`UC-012` |
| **Component Testing** | Vitest + React Testing Library + `@testing-library/user-event` | `CurrencyInput`, `TransactionForm`, `TypedConfirmDialog`, `BudgetProgressCard`, state loading/empty/error, atribut ARIA | Komponen interaktif & form kritis |
| **PWA & Offline Testing** | Playwright + Production Build (`next build && next start`) | Registrasi SW, caching app shell, simulasi offline, halaman `/offline`, banner update SW | `PWA-001`–`PWA-007` |
| **Security & Header Testing** | Playwright / `curl -I` / Audit Statis | 8 HTTP security headers, XSS escaping pada input/CSV/JSON, prototype pollution check, nol request eksternal (`NFR-009`), `npm audit` | `SEC-001`–`SEC-010` |
| **Responsive & Accessibility** | Playwright / Lighthouse / DevTools | Viewport `360×800`, `768×1024`, `1440×900`, zero horizontal scroll, tab keyboard navigation, kontras Dark & Light mode | `NFR-004`, `NFR-005` |

---

## 2. Pengujian Integritas Data & Keandalan

1. **Uji Anti-Double Counting**: Verifikasi bahwa menambah kontribusi target `Rp 500.000` menurunkan `AvailableBalance` sebesar `Rp 500.000` sementara `TotalExpense` dan `NetBalance` tidak berubah sepersen pun.
2. **Uji Atomisitas & Rollback**: Gunakan mock kegagalan pada langkah kedua di transaksi multi-tabel (misal kegagalan setelah insert `goalContributions` sebelum update `financialGoals`) untuk memastikan `fake-indexeddb` membatalkan seluruh transaksi tanpa menyisakan data parsial (`NFR-003`).
3. **Uji Pergeseran Zona Waktu**: Jalankan unit test `dates.ts` dengan `TZ=Asia/Jakarta`, `TZ=UTC`, dan `TZ=America/Los_Angeles` untuk memastikan tanggal kalender `YYYY-MM-DD` tidak bergeser 1 hari (`DATA-003`).
4. **Uji Kinerja 5.000 Transaksi**: Seed 5.000 transaksi acak di `fake-indexeddb` / browser headless dan ukur waktu eksekusi `getDashboardSummary` serta `queryTransactions` (`NFR-001`).

---

## 3. Verifikasi Build Produksi

Setiap perubahan yang menyentuh konfigurasi PWA, CSP, atau routing wajib diuji terhadap **production build** (`npm run build && npm run start`), bukan hanya `next dev`, karena:
- Service Worker biasanya dinonaktifkan atau berperilaku berbeda di mode `dev`.
- Kebijakan CSP tanpa `'unsafe-eval'` hanya dapat divalidasi secara sah pada bundle produksi.
