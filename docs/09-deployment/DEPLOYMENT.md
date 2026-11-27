# Deployment & Hosting Guide — Finora

**Versi Dokumen**: 1.0.0  
**Platform Hosting**: GitHub + Vercel  
**Dokumen Terkait**: [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) | [SECURITY.md](../05-security/SECURITY.md) | [PWA_STRATEGY.md](../06-pwa/PWA_STRATEGY.md)

---

## 1. Pengembangan Lokal (*Local Development*)

1. **Prasyarat Lingkungan**:
   - Node.js LTS (`>= 20.x` direkomendasikan) dan `npm` (atau package manager sesuai lockfile saat Phase 1).
   - Browser modern (Chrome/Edge/Firefox) dengan akses `http://localhost:3000` (konteks aman untuk IndexedDB & Web Crypto).
2. **Alur Perintah Standar**:
   - `npm ci` — Instalasi dependensi deterministik dari lockfile.
   - `npm run dev` — Menjalankan server pengembangan lokal (catatan: Service Worker sebaiknya dinonaktifkan di `dev` agar hot-reload tidak terganggu cache lama).
   - `npm run typecheck && npm run lint && npm run test` — Validasi kualitas sebelum commit.
   - `npm run build && npm run start` — Menguji bundel produksi dan Service Worker secara lokal.

---

## 2. Konfigurasi Environment (*Environment Configuration*)

Karena Finora tidak memiliki backend, database eksternal, atau API keys pihak ketiga (`ADR-005`), **tidak ada secret atau kredensial server yang diperlukan**.

- **Variabel Opsional Non-Sensitif (Public Build Metadata)**:
  - `NEXT_PUBLIC_APP_VERSION`: Versi aplikasi tampilan di `/settings` (mis. `1.0.0`).
- **Larangan Environment**:
  - Jangan menambahkan `DATABASE_URL`, `AUTH_SECRET`, atau API key layanan eksternal apa pun ke Vercel Environment Variables untuk MVP.

---

## 3. Build Produksi & Integrasi GitHub → Vercel

1. **Integrasi GitHub**:
   - Hubungkan repositori GitHub ke proyek Vercel.
   - Jika Next.js diletakkan di subdirektori `finora/` (lihat `OQ-01` di [PROJECT_STRUCTURE.md](../07-development/PROJECT_STRUCTURE.md)), atur **Root Directory** pada pengaturan proyek Vercel ke `finora`; jika di root, biarkan default `./`.
   - Aktifkan **Preview Deployments** untuk setiap Pull Request dan **Production Deployment** hanya dari branch `main`.
2. **Perintah Build Vercel**:
   - Install Command: `npm ci`
   - Build Command: `npm run build`
   - Output Directory: `.next` (default Next.js)

---

## 4. HTTPS & Konfigurasi 8 HTTP Security Headers

Vercel menyediakan sertifikat TLS/HTTPS otomatis untuk domain `*.vercel.app` dan custom domain (syarat mutlak instalasi PWA & Web Crypto).

Kedelapan header keamanan dari [SECURITY.md](../05-security/SECURITY.md) diterapkan melalui `headers()` pada `next.config.*` (atau `middleware.ts` untuk `Content-Security-Policy` jika menggunakan Opsi A Nonce per-request):
- **Header Wajib**: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`.
- **Header Cache Khusus Service Worker (`sw.js`)**: Set `Cache-Control: public, max-age=0, must-revalidate` pada `/sw.js` agar browser selalu memeriksa pembaruan Service Worker secara tepat waktu dan tidak men-cache skrip SW lama secara agresif.

---

## 5. Verifikasi PWA & Pengujian Pasca-Deployment

Setelah deployment ke Preview atau Production URL (`https://<domain>`):
1. **Inspeksi HTTP Headers**: Jalankan `curl -sI https://<domain>/` dan pastikan kedelapan security headers muncul dengan nilai benar.
2. **Verifikasi Manifest & SW**: Buka Chrome DevTools → *Application* → *Manifest* dan *Service Workers*; pastikan ikon `192×192`, `512×512`, `maskable` berstatus `200`, dan SW berstatus *activated and running*.
3. **Verifikasi Offline**: Centang *Offline* di DevTools Network/Application, muat ulang `/`, catat 1 transaksi uji, buka `/budgets`, lalu buka URL tidak terdaftar untuk mengonfirmasi fallback `/offline`.
4. **Verifikasi Zero Leakage**: Pastikan tab *Network* tidak pernah mengirim permintaan ke domain pihak ketiga atau payload transaksi ke server Vercel.
5. **Lighthouse Audit**: Jalankan Lighthouse (Navigation mode, Mobile & Desktop) untuk Performance, Accessibility, Best Practices, dan PWA checks.

---

## 6. Strategi Rollback (*Rollback Strategy*)

1. **Instant Rollback di Vercel**: Jika rilis produksi terbaru ditemukan membawa regresi UI, bug Service Worker, atau masalah CSP, lakukan **Instant Rollback** ke deployment stabil sebelumnya melalui Vercel Dashboard atau CLI (`vercel rollback`).
2. **Pertimbangan Cache Service Worker saat Rollback**:
   - Karena browser pengguna mungkin telah menginstal SW versi bermasalah, deployment pengganti/rollback harus memiliki `sw.js` baru dengan `Cache-Control: max-age=0, must-revalidate` agar klien segera mendeteksi pembaruan SW dan membersihkan cache bundel bermasalah.
3. **Keselamatan Data Pengguna**: Rollback kode aplikasi di Vercel **tidak menghapus `FinoraDB`** di perangkat pengguna—kecuali skema IndexedDB telanjur dinaikkan ke versi lebih tinggi tanpa kompatibilitas mundur (oleh karena itu kenaikan `version()` Dexie harus diuji matang di Preview sebelum masuk `main`).
