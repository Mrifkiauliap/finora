import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Database,
  DatabaseBackup,
  HardDrive,
  Lock,
  PieChart,
  Repeat,
  ShieldCheck,
  Smartphone,
  Target,
  Wallet,
  WifiOff,
  XCircle,
} from 'lucide-react';
import { DashboardPreviewMockup } from '@/components/public/DashboardPreviewMockup';
import { FaqAccordion, type FaqItem } from '@/components/public/FaqAccordion';

export const metadata: Metadata = {
  title: 'Finora — Manajemen Keuangan Pribadi Local-First & Offline-First',
  description:
    'Kelola transaksi IDR, anggaran bulanan, target tabungan, dan analitik keuangan langsung di browser Anda tanpa login, tanpa server, dan tetap jalan saat offline.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Finora — Your Money, Your Control',
    description:
      'Aplikasi keuangan pribadi privacy-first dan offline-first di perangkat Anda sendiri.',
    url: '/',
  },
};

const CORE_FEATURES = [
  {
    icon: Wallet,
    title: 'Pencatatan Arus Kas IDR Cepat',
    description:
      'Catat pemasukan dan pengeluaran harian dalam hitungan detik dengan validasi bilangan bulat IDR yang presisi, pencarian instan, dan filter multi-kriteria.',
  },
  {
    icon: PieChart,
    title: 'Anggaran Bulanan & Sinyal Dini',
    description:
      'Tetapkan batas pengeluaran per kategori tiap bulan dengan ambang peringatan 50%–95%, salin anggaran bulan lalu, dan pantau status Aman hingga Melebihi Batas.',
  },
  {
    icon: Target,
    title: 'Target Tabungan Anti-Double Counting',
    description:
      'Sisihkan dana ke target tabungan tanpa mengacaukan total pengeluaran bulanan. Ketahui Saldo Bersih vs Saldo Tersedia bebas pakai secara transparan.',
  },
  {
    icon: Repeat,
    title: 'Transaksi Berulang Lokal',
    description:
      'Jadwalkan gaji, sewa kos, atau tagihan rutin secara harian, mingguan, bulanan (dengan end-of-month clamping tanggal 31), maupun tahunan tanpa server cron.',
  },
  {
    icon: BarChart3,
    title: 'Analitik & Ekspor CSV Aman',
    description:
      'Grafik tren arus kas, komposisi kategori, ringkasan insight deterministik lokal, laporan siap cetak, serta ekspor CSV UTF-8 BOM yang terlindung dari formula injection.',
  },
  {
    icon: DatabaseBackup,
    title: 'Backup JSON SHA-256 & Restore Preview',
    description:
      'Ekspor seluruh basis data lokal ke berkas JSON berversi dengan checksum SHA-256, pratinjau konflik sebelum pemulihan, dan pilihan mode Merge atau Replace.',
  },
] as const;

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Apakah saya harus membuat akun atau login untuk memakai Finora?',
    answer:
      'Tidak perlu. Finora dirancang zero-signup. Begitu Anda menekan "Open My Finance" untuk masuk ke /app, basis data lokal di browser Anda langsung disiapkan lengkap dengan 13 kategori bawaan agar Anda bisa langsung mencatat.',
  },
  {
    question: 'Di mana data transaksi keuangan saya disimpan?',
    answer:
      'Seluruh data disimpan eksklusif di dalam IndexedDB (FinoraDB) pada browser dan perangkat Anda sendiri. Server hosting hanya mengirimkan aset tampilan aplikasi dan tidak pernah menerima atau menyimpan catatan keuangan Anda.',
  },
  {
    question: 'Apakah Finora benar-benar bisa digunakan tanpa koneksi internet?',
    answer:
      'Ya. Setelah kunjungan pertama, Service Worker menyimpan kerangka aplikasi dan aset statis secara lokal. Anda tetap dapat membuka aplikasi, mencatat transaksi, mengevaluasi anggaran, hingga mengunduh CSV/Backup saat offline.',
  },
  {
    question: 'Bagaimana jika saya berganti ponsel atau ingin memindahkan data ke browser lain?',
    answer:
      'Gunakan menu Backup & Restore di dalam aplikasi (/app/settings/backup) untuk mengunduh berkas JSON terverifikasi SHA-256, lalu unggah berkas tersebut di perangkat atau browser baru Anda dengan pratinjau pemulihan yang aman.',
  },
  {
    question: 'Apa bedanya Saldo Bersih dan Saldo Tersedia di Finora?',
    answer:
      'Saldo Bersih adalah total pemasukan dikurangi total pengeluaran riil. Saldo Tersedia adalah Saldo Bersih setelah dikurangi dana yang sudah Anda alokasikan ke Target Keuangan, sehingga tabungan tidak tercampur dengan pengeluaran.',
  },
  {
    question: 'Apakah berkas Backup JSON saya dienkripsi kata sandi?',
    answer:
      'Pada versi MVP saat ini, berkas Backup JSON dilengkapi checksum SHA-256 untuk memastikan keutuhan berkas dari kerusakan, bukan enkripsi kata sandi. Simpan berkas cadangan Anda di folder pribadi yang aman.',
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* 2, 3, 4, 5. Hero Section + CTAs + Product Dashboard Preview */}
      <section className="hero-emerald-glow border-b border-[var(--border-subtle)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-16 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)]">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" aria-hidden="true" />
                <span>Local-First • Offline-First • Zero Signup</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight leading-[1.08] text-[var(--text-primary)]">
                Kelola keuangan pribadi dengan{' '}
                <span className="font-editorial italic font-normal text-[var(--accent-hover)]">
                  tenang &amp; kendali penuh
                </span>
              </h1>

              <p className="text-base sm:text-lg leading-relaxed text-[var(--text-secondary)] max-w-xl">
                Finora membantu Anda mencatat transaksi Rupiah, mengendalikan anggaran bulanan, dan memantau target tabungan langsung di browser—tanpa akun, tanpa pelacakan, dan tetap bekerja saat luring.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link
                  href="/app"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[var(--accent-primary)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] font-semibold text-sm sm:text-base transition-colors shadow-sm"
                >
                  <span>Open My Finance</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/features"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] font-medium text-sm sm:text-base transition-colors"
                >
                  Explore Features
                </Link>
              </div>

              <p className="text-xs text-[var(--text-secondary)]">
                Akses instan tanpa registrasi • Data tersimpan lokal di perangkat Anda
              </p>
            </div>

            <div className="lg:col-span-6">
              <DashboardPreviewMockup />
            </div>
          </div>

          {/* Trust Architecture Pillars Strip */}
          <div className="mt-14 pt-8 border-t border-[var(--border-subtle)]">
            <p className="text-center text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-6">
              Dirancang untuk Kedaulatan Data Pribadi Anda
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Database, label: '100% IndexedDB Lokal' },
                { icon: Lock, label: 'Zero Backend & Login' },
                { icon: WifiOff, label: 'Offline-First PWA' },
                { icon: ShieldCheck, label: 'Backup SHA-256 Checksum' },
              ].map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.label}
                    className="flex items-center justify-center gap-2.5 rounded-2xl bg-[var(--bg-surface)]/80 border border-[var(--border-subtle)] px-4 py-3 text-xs sm:text-sm font-semibold text-[var(--text-primary)]"
                  >
                    <Icon className="w-4 h-4 text-[var(--accent-primary)] shrink-0" aria-hidden="true" />
                    <span>{pillar.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Problem & Solution Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-2xl mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Mengapa pencatatan keuangan sering berhenti di minggu pertama?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)]">
            Bukan karena Anda tidak disiplin, melainkan karena banyak aplikasi membebani pengguna dengan akun cloud, jeda jaringan, dan privasi yang kabur.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-4">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[var(--status-danger-text)]">
              Hambatan Konvensional
            </span>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Aplikasi Keuangan Berbasis Server
            </h3>
            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
              {[
                'Wajib registrasi email, kata sandi, dan verifikasi sebelum bisa mencatat.',
                'Riwayat transaksi diunggah ke server pihak ketiga dan rentan analitik.',
                'Gagal membuka atau menyimpan saat berada di lokasi tanpa sinyal.',
                'Alokasi tabungan sering tercampur sehingga mengacaukan angka pengeluaran.',
              ].map((txt) => (
                <li key={txt} className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-[var(--status-danger-text)] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{txt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-[var(--bg-surface)] border border-emerald-500/35 p-6 space-y-4">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[var(--accent-primary)]">
              Pendekatan Finora
            </span>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Local-First &amp; Offline-First di Perangkat Anda
            </h3>
            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
              {[
                'Zero-signup: buka /app dan langsung catat transaksi pertama Anda.',
                'Nol transmisi data finansial ke jaringan, nol pelacak iklan atau cookie.',
                'Service Worker menjaga aplikasi tetap aktif dan responsif saat luring.',
                'Pemisahan tegas Saldo Bersih vs Saldo Tersedia dengan target earmark.',
              ].map((txt) => (
                <li key={txt} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--status-success)] shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-[var(--text-primary)]">{txt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 7. Core Features Showcase */}
      <section className="border-y border-[var(--border-subtle)] bg-[var(--bg-surface)]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                Lengkap untuk arus kas harian hingga perencanaan jangka panjang
              </h2>
              <p className="mt-2.5 text-sm sm:text-base text-[var(--text-secondary)]">
                Setiap fitur dihitung secara deterministik dengan nominal integer IDR bebas pembulatan keliru.
              </p>
            </div>
            <Link
              href="/features"
              className="text-sm font-semibold text-[var(--accent-primary)] hover:underline inline-flex items-center gap-1 shrink-0"
            >
              Lihat semua detail fitur
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CORE_FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-[var(--accent-primary)] flex items-center justify-center">
                    <Icon className="w-5 h-5" aria-hidden="true" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">
                    {feat.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8 & 9. Privacy-First Architecture & Offline-First PWA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 8. Privacy-First Architecture */}
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-[var(--accent-primary)] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Arsitektur Privacy-First
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Data keuangan tidak pernah meninggalkan perangkat Anda
            </h2>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              Finora tidak memiliki database server maupun endpoint API pengguna. Server hosting hanya mengirimkan kode antarmuka statis dengan 8 HTTP security headers wajib dan Content Security Policy ketat.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[
                { title: 'Zero Telemetry', desc: 'Tanpa analytics tracker, cookie pelacakan, atau font CDN eksternal.' },
                { title: 'Privacy Mask', desc: 'Sembunyikan angka saldo satu klik di tempat umum.' },
                { title: 'Validasi Zod Ketat', desc: 'Setiap input dan file impor backup divalidasi skema ketat.' },
                { title: 'Kontrol Hapus Penuh', desc: 'Bersihkan seluruh data lokal kapan saja dari Pengaturan.' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3.5"
                >
                  <p className="text-xs font-semibold text-[var(--text-primary)]">{item.title}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent-primary)] hover:underline"
            >
              Baca Kebijakan Privasi &amp; Batasan Lokal
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {/* 9. Offline-First PWA */}
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-semibold">
              <Smartphone className="w-3.5 h-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
              Progressive Web Application (PWA)
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Pasang di ponsel atau desktop, tetap lancar tanpa sinyal
            </h2>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              Setelah kunjungan pertama, Service Worker menyimpan aset aplikasi agar Anda bisa membuka Finora layaknya aplikasi native—bahkan saat mode pesawat aktif.
            </p>
            <div className="space-y-3 pt-1">
              {[
                {
                  icon: HardDrive,
                  title: 'Isolasi Cache Ketat',
                  desc: 'CacheStorage Service Worker hanya menyimpan kerangka aplikasi; catatan transaksi Anda tidak pernah masuk ke cache SW.',
                },
                {
                  icon: WifiOff,
                  title: 'Operasional Offline Penuh',
                  desc: 'Catat transaksi, cek anggaran, ekspor CSV, dan buat backup JSON tetap berjalan normal tanpa internet.',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-4 flex items-start gap-3"
                  >
                    <Icon className="w-5 h-5 text-[var(--accent-primary)] shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 10. How It Works */}
      <section className="border-y border-[var(--border-subtle)] bg-[var(--bg-surface)]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Mulai dalam tiga langkah sederhana
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-[var(--text-secondary)]">
              Tanpa formulir pendaftaran, tanpa verifikasi email, langsung produktif.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Buka Aplikasi (/app)',
                desc: 'Tekan "Open My Finance". Finora otomatis menyiapkan FinoraDB lokal dan 13 kategori default siap pakai di browser Anda.',
              },
              {
                step: '02',
                title: 'Catat, Anggarkan & Alokasikan',
                desc: 'Rekam transaksi harian IDR, pasang batas anggaran bulanan, dan sisihkan dana ke target tabungan tanpa double counting.',
              },
              {
                step: '03',
                title: 'Evaluasi & Cadangkan Mandiri',
                desc: 'Tinjau grafik analitik lokal, unduh laporan CSV untuk spreadsheet, dan simpan cadangan JSON terverifikasi SHA-256 kapan saja.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-3"
              >
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/15 text-[var(--accent-primary)] font-mono text-sm font-bold">
                  {item.step}
                </span>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[var(--text-secondary)]">
            Jawaban jujur mengenai privasi lokal, operasional offline, dan portabilitas data Finora.
          </p>
        </div>
        <FaqAccordion items={FAQ_ITEMS} />
      </section>

      {/* 12. Final CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-emerald-500/35 p-8 sm:p-12 text-center hero-emerald-glow space-y-5">
          <h2 className="text-2xl sm:text-4xl font-bold text-[var(--text-primary)] max-w-2xl mx-auto">
            Siap mengambil kendali penuh atas{' '}
            <span className="font-editorial italic font-normal text-[var(--accent-hover)]">
              keuangan pribadi Anda?
            </span>
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto">
            Mulai catat hari ini secara gratis, cepat, dan sepenuhnya berada di bawah kepemilikan Anda sendiri.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-[var(--accent-primary)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] font-semibold text-sm sm:text-base transition-colors"
            >
              <span>Open My Finance</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[var(--bg-canvas)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] font-medium text-sm sm:text-base transition-colors"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
