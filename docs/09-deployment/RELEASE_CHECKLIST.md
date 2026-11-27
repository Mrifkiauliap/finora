# Release Checklist — Finora

**Versi Dokumen**: 1.0.0  
**Dokumen Terkait**: [DEPLOYMENT.md](./DEPLOYMENT.md) | [QA_CHECKLIST.md](../08-testing/QA_CHECKLIST.md) | [SECURITY.md](../05-security/SECURITY.md)

---

## 1. Pre-Release Checklist (Sebelum Merge ke `main`)

- [ ] Seluruh task pada milestone rilis selesai dan berstatus Done (`MILESTONES.md`).
- [ ] `npm run typecheck`, `npm run lint`, dan `npm run test` lulus 100%.
- [ ] `npm audit --omit=dev` tidak menunjukkan kerentanan kritikal yang belum dimitigasi.
- [ ] Seluruh fitur P0 dan P1 lulus verifikasi di **Vercel Preview Deployment** (`QA_CHECKLIST.md`).
- [ ] Pemeriksaan `curl -I <preview-url>` mengonfirmasi kedelapan HTTP security headers hadir lengkap, termasuk `Content-Security-Policy` tanpa `'unsafe-eval'`.
- [ ] Uji instalasi PWA berhasil di Chrome Desktop dan minimal satu perangkat Android/iOS.
- [ ] Uji mode Offline penuh pasca-instalasi berhasil untuk seluruh halaman inti dan fallback `/offline`.
- [ ] Audit DevTools `CacheStorage` mengonfirmasi 0 data finansial tersimpan di cache Service Worker.
- [ ] Audit DevTools `Network` mengonfirmasi 0 request keluar ke analitik/CDN eksternal.
- [ ] `CHANGELOG` / tag rilis disiapkan dan dokumen `/docs` selaras dengan perilaku build akhir.

## 2. Release Execution

- [ ] Merge Pull Request ke branch `main` melalui mekanisme review yang disepakati.
- [ ] Pantau log Vercel Production Build hingga status **Ready**.
- [ ] Buat tag Git rilis (contoh: `git tag -a v1.0.0 -m "Release Finora MVP v1.0.0"`).

## 3. Post-Release Checklist (Pada URL Produksi Final)

- [ ] Buka URL produksi `https://...` pada profil browser baru (incognito non-terbatas atau profil bersih) dan pastikan onboarding `UC-001` berjalan mulus.
- [ ] Jalankan kembali pemeriksaan 8 HTTP security headers terhadap URL produksi.
- [ ] Jalankan Lighthouse audit pada URL produksi (target: Performance `>= 90`, Accessibility `>= 95`, Best Practices `>= 95`).
- [ ] Uji siklus lengkap Backup JSON → Wipe/Reset → Restore Preview → Restore `Replace All` pada domain produksi.
- [ ] Pastikan Service Worker di produksi menerima `Cache-Control: max-age=0, must-revalidate` dan berfungsi saat koneksi dimatikan.
- [ ] Konfirmasi tidak ada error konsol runtime atau halaman 404/500 pada seluruh 11 rute inti + `/offline`.
