# QA Release Checklist — Finora

**Versi Dokumen**: 1.0.0  
**Dokumen Terkait**: [TESTING.md](./TESTING.md) | [TEST_CASES.md](./TEST_CASES.md) | [RELEASE_CHECKLIST.md](../09-deployment/RELEASE_CHECKLIST.md)

---

## 1. Kualitas Kode & Pengujian Otomatis
- [ ] `npm run typecheck` (`tsc --noEmit`) lulus dengan 0 error.
- [ ] `npm run lint` lulus dengan 0 error.
- [ ] Seluruh unit test & integration test (`TC-001` s.d. `TC-036`) lulus 100% tanpa test yang di-skip.
- [ ] `npm run build` selesai bersih tanpa warning kritikal atau error bundler Service Worker.

## 2. Akurasi Finansial & Integritas Data
- [ ] Seluruh nominal IDR tersimpan sebagai integer aman dan diformat `Rp X.XXX` dengan `tabular-nums`.
- [ ] `SavingsRate` menampilkan `"—"` saat pemasukan `= 0`.
- [ ] Kontribusi Target (`goalContributions`) mengurangi `AvailableBalance` tanpa mengubah `TotalExpense`.
- [ ] Aturan berulang `anchorDay = 31` terjepit rapi di Februari lalu kembali ke 31 di Maret, serta idempoten saat reload berkali-kali.
- [ ] Penghapusan kategori terpakai memaksa *soft-archive* atau *reassignment* atomik.

## 3. Backup, Restore & Ekspor CSV
- [ ] Backup JSON mengandung ke-7 tabel dan `SHA-256` checksum valid.
- [ ] Modifikasi 1 karakter pada file backup ditolak oleh `inspectBackupFile`.
- [ ] Restore mode `Replace All` menuntut pengetikan `"TIMPA"`, dan mode `Merge` menangani bentrok `(categoryId, month)`.
- [ ] Ekspor CSV menyertakan UTF-8 BOM dan menetralkan karakter awal `=`, `+`, `-`, `@`, `\t`, `\r`.

## 4. UI/UX, Aksesibilitas & Responsivitas
- [ ] Tidak ada *horizontal overflow* di viewport `360px` pada seluruh 11 halaman + `/offline`.
- [ ] Dark Mode (`#0B1220`) dan Light Mode (`#F8FAFC`) terbaca jelas; tombol aksen Dark Mode memakai teks `#0B1220` di atas `#10B981`.
- [ ] Seluruh form memiliki pesan error tepat di bawah field terkait; *empty state* dan *loading skeleton* tersedia.
- [ ] Navigasi keyboard (`Tab`, `Enter`, `Escape`) berfungsi pada menu, tabel, dan modal dialog.

## 5. Keamanan, Privasi & PWA Offline
- [ ] Tab Network DevTools membuktikan **0** request ke domain pihak ketiga dan **0** pengiriman data finansial ke server.
- [ ] `CacheStorage` Service Worker bersih dari data JSON transaksi/backup pengguna.
- [ ] Aplikasi tetap dapat dimuat ulang dan mencatat transaksi baru dalam kondisi **Offline**.
- [ ] Rute yang tidak ada di cache menampilkan halaman `/offline` saat offline.
- [ ] 8 HTTP security headers aktif dan terverifikasi pada build produksi/preview.
