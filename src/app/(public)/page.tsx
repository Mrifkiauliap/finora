import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
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
  title: 'Finora — Kelola Keuangan Pribadi Lebih Tenang & Terkendali',
  description:
    'Catat pemasukan dan pengeluaran Rupiah, atur anggaran bulanan, pantau target tabungan, dan lihat ringkasan keuangan Anda tanpa daftar dan tetap jalan tanpa internet.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Finora — Your Money, Your Control',
    description:
      'Aplikasi keuangan pribadi yang praktis dan menjaga penuh privasi data di perangkat Anda sendiri.',
    url: '/',
  },
};

const CORE_FEATURES = [
  {
    icon: Wallet,
    title: 'Catat Transaksi Hitungan Detik',
    description:
      'Rekam pemasukan dan pengeluaran harian dengan rapi, cari riwayat transaksi seketika, dan saring berdasarkan tanggal, kategori, atau metode bayar.',
  },
  {
    icon: PieChart,
    title: 'Anggaran Bulanan Terkontrol',
    description:
      'Tetapkan batas belanja tiap kategori setiap bulan dengan pengingat otomatis sebelum anggaran terlewati, plus salin anggaran bulan sebelumnya.',
  },
  {
    icon: Target,
    title: 'Target Tabungan Lebih Jelas',
    description:
      'Sisihkan dana untuk tujuan tertentu tanpa membuat laporan pengeluaran terlihat membengkak. Bedakan total saldo dan saldo bebas pakai dengan mudah.',
  },
  {
    icon: Repeat,
    title: 'Jadwal Transaksi Rutin',
    description:
      'Catat gaji bulanan, uang kos, atau tagihan langganan sekali saja agar otomatis tercatat sesuai jadwal harian, mingguan, bulanan, atau tahunan.',
  },
  {
    icon: BarChart3,
    title: 'Ringkasan & Laporan Rapi',
    description:
      'Lihat grafik pemasukan vs pengeluaran, kategori belanja terbesar, dan insight bulanan, lalu cetak atau ekspor laporan ke spreadsheet kapan pun.',
  },
  {
    icon: DatabaseBackup,
    title: 'Cadangkan & Pindahkan Data',
    description:
      'Simpan file cadangan seluruh catatan Anda ke perangkat kapan saja dan pulihkan dengan pratinjau yang aman saat berpindah ponsel atau browser.',
  },
] as const;

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Apakah saya harus membuat akun atau login untuk memakai Finora?',
    answer:
      'Tidak perlu. Anda bisa langsung menekan "Open My Finance" untuk mulai mencatat. Kategori pemasukan dan pengeluaran umum sudah langsung tersedia sejak awal.',
  },
  {
    question: 'Di mana data transaksi keuangan saya disimpan?',
    answer:
      'Seluruh catatan keuangan disimpan langsung di browser pada perangkat Anda sendiri. Data Anda tidak dikirim ke server lain dan tidak dibaca oleh pihak ketiga.',
  },
  {
    question: 'Apakah Finora tetap bisa digunakan saat tidak ada internet?',
    answer:
      'Ya. Setelah pertama kali dibuka, Finora tetap bisa diakses dan digunakan penuh meskipun sinyal sedang lemah atau perangkat dalam mode offline.',
  },
  {
    question: 'Bagaimana jika saya berganti ponsel atau ingin pindah browser?',
    answer:
      'Anda dapat mengunduh file cadangan lewat menu Pengaturan → Backup & Restore, lalu mengunggahnya kembali di perangkat atau browser baru dengan pratinjau sebelum data digabung atau diganti.',
  },
  {
    question: 'Apa bedanya Saldo Bersih dan Saldo Tersedia di Finora?',
    answer:
      'Saldo Bersih adalah selisih seluruh pemasukan dan pengeluaran Anda. Saldo Tersedia adalah sisa dana yang benar-benar bebas dipakai setelah dikurangi tabungan yang sudah Anda sisihkan ke Target Keuangan.',
  },
  {
    question: 'Apakah data saya aman jika saya membersihkan data browser?',
    answer:
      'Karena data disimpan di perangkat Anda sendiri dan tidak otomatis dienkripsi dengan akun cloud, menghapus data situs atau memakai mode penyamaran (Incognito) akan menghapus catatan yang belum dicadangkan. Unduh file cadangan Anda secara berkala dan simpan di tempat aman.',
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section + Product Preview */}
      <section className="hero-emerald-glow border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-16 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--brand-subtle)] border border-[var(--brand-soft)] text-xs font-semibold text-[var(--accent-primary)]">
                <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)]" aria-hidden="true" />
                <span>Langsung Pakai • Tanpa Akun • Tetap Jalan Offline</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] text-[var(--text-primary)]">
                Kelola keuangan pribadi dengan{' '}
                <span className="text-[var(--accent-primary)]">
                  tenang &amp; kendali penuh
                </span>
              </h1>

              <p className="text-base sm:text-lg leading-relaxed text-[var(--text-secondary)] max-w-xl">
                Finora membantu Anda mencatat transaksi Rupiah, mengendalikan anggaran bulanan, dan memantau target tabungan langsung dari perangkat Anda—tanpa registrasi, tanpa pelacakan, dan tetap lancar saat luring.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link
                  href="/app"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[var(--accent-primary)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] font-semibold text-sm sm:text-base transition-colors shadow-xs"
                >
                  <span>Open My Finance</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/features"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-control)] hover:bg-[var(--bg-elevated)] font-medium text-sm sm:text-base transition-colors"
                >
                  Explore Features
                </Link>
              </div>

              <p className="text-xs text-[var(--text-secondary)]">
                Gratis digunakan • Catatan keuangan tetap tersimpan di perangkat Anda
              </p>
            </div>

            <div className="lg:col-span-6">
              <DashboardPreviewMockup />
            </div>
          </div>

          {/* Trust Pillars Strip */}
          <div className="mt-14 pt-8 border-t border-[var(--border-subtle)]">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-6">
              Dirancang agar Anda nyaman mencatat setiap hari
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Lock, label: 'Tanpa Daftar & Login' },
                { icon: HardDrive, label: 'Data di Perangkat Anda' },
                { icon: WifiOff, label: 'Tetap Jalan Tanpa Internet' },
                { icon: ShieldCheck, label: 'Backup & Ekspor Kapan Saja' },
              ].map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.label}
                    className="flex items-center justify-center gap-2.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] px-4 py-3 text-xs sm:text-sm font-semibold text-[var(--text-primary)]"
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

      {/* Problem & Solution Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-2xl mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Mengapa pencatatan keuangan sering berhenti di minggu pertama?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)]">
            Banyak orang berhenti mencatat bukan karena malas, melainkan karena aplikasi terasa merepotkan sejak awal dipakai.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-4 shadow-[var(--card-shadow)]">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[var(--status-danger-text)]">
              Masalah yang Sering Dialami
            </span>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Proses Rumit dan Privasi Tidak Jelas
            </h3>
            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
              {[
                'Harus daftar akun, isi email, dan buat kata sandi sebelum bisa mencatat.',
                'Data pengeluaran dikirim ke pihak luar sehingga terasa kurang nyaman.',
                'Tidak bisa membuka atau mencatat saat sinyal internet sedang sulit.',
                'Uang yang disisihkan untuk menabung sering tercampur dengan pengeluaran.',
              ].map((txt) => (
                <li key={txt} className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-[var(--status-danger-text)] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{txt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--brand-primary)]/35 p-6 space-y-4 shadow-[var(--card-shadow)]">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[var(--accent-primary)]">
              Solusi dari Finora
            </span>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Ringkas, Privat, dan Siap Dipakai Kapan Saja
            </h3>
            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
              {[
                'Buka aplikasi dan langsung catat transaksi pertama Anda tanpa registrasi.',
                'Seluruh catatan keuangan tetap tinggal di perangkat Anda, bebas pelacakan.',
                'Tetap responsif dan berfungsi normal walau koneksi sedang offline.',
                'Tabungan target dipisahkan dari pengeluaran agar saldo bebas pakai tetap akurat.',
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

      {/* Core Features Showcase */}
      <section className="border-y border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                Lengkap untuk catatan harian hingga perencanaan jangka panjang
              </h2>
              <p className="mt-2.5 text-sm sm:text-base text-[var(--text-secondary)]">
                Dirancang dengan perhitungan Rupiah yang presisi dan tampilan yang bersih agar mudah dipahami sekilas.
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
                  className="rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-6 space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--brand-subtle)] border border-[var(--brand-soft)] text-[var(--accent-primary)] flex items-center justify-center">
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

      {/* Privacy & Offline Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 space-y-5 shadow-[var(--card-shadow)]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-subtle)] text-[var(--accent-primary)] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Privasi Sejak Awal
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Data keuangan Anda tetap berada di perangkat sendiri
            </h2>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              Finora tidak meminta akun dan tidak mengunggah catatan transaksi Anda ke server mana pun. Semua ringkasan, anggaran, dan laporan diolah langsung di perangkat Anda.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[
                { title: 'Tanpa Pelacakan', desc: 'Tidak ada pelacak aktivitas atau cookie iklan yang mengikuti Anda.' },
                { title: 'Sembunyikan Saldo', desc: 'Samarkan nominal angka satu ketukan saat membuka aplikasi di tempat umum.' },
                { title: 'Cadangan Portabel', desc: 'Unduh file cadangan kapan saja untuk disimpan atau dipindah perangkat.' },
                { title: 'Kendali Hapus Penuh', desc: 'Anda bebas menghapus seluruh catatan kapan pun dari Pengaturan.' },
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
              Baca Kebijakan Privasi Finora
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 space-y-5 shadow-[var(--card-shadow)]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-semibold">
              <Smartphone className="w-3.5 h-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
              Nyaman di Ponsel &amp; Desktop
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Bisa dipasang seperti aplikasi, lancar tanpa sinyal
            </h2>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              Pasang Finora ke layar utama ponsel atau desktop Anda agar terasa seperti aplikasi bawaan—cepat dibuka kapan saja, termasuk saat jaringan terputus.
            </p>
            <div className="space-y-3 pt-1">
              {[
                {
                  icon: Smartphone,
                  title: 'Tampilan Rapi Satu Tangan',
                  desc: 'Navigasi bawah mobile memudahkan Anda berpindah antar ringkasan, transaksi, anggaran, dan target dalam sekali sentuh.',
                },
                {
                  icon: WifiOff,
                  title: 'Tetap Berjalan Saat Offline',
                  desc: 'Catat pengeluaran, cek sisa anggaran, hingga ekspor laporan tetap bekerja normal tanpa harus menunggu koneksi kembali.',
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

      {/* How It Works */}
      <section className="border-y border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Mulai dalam tiga langkah sederhana
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-[var(--text-secondary)]">
              Tanpa formulir pendaftaran, tanpa verifikasi email, langsung siap digunakan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Buka Aplikasi',
                desc: 'Tekan "Open My Finance". Kategori pemasukan dan pengeluaran umum sudah langsung disiapkan agar Anda tinggal pakai.',
              },
              {
                step: '02',
                title: 'Catat & Atur Anggaran',
                desc: 'Rekam transaksi harian, tetapkan batas pengeluaran tiap kategori, dan sisihkan dana ke target tabungan Anda.',
              },
              {
                step: '03',
                title: 'Pantau & Cadangkan',
                desc: 'Lihat grafik arus kas bulanan, unduh laporan rapi, dan simpan file cadangan data secara mandiri kapan saja.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-6 space-y-3"
              >
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--brand-subtle)] border border-[var(--brand-soft)] text-[var(--accent-primary)] font-mono text-sm font-bold">
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

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[var(--text-secondary)]">
            Penjelasan singkat mengenai cara kerja Finora, privasi data, dan penyimpanan cadangan.
          </p>
        </div>
        <FaqAccordion items={FAQ_ITEMS} />
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--brand-primary)]/30 p-8 sm:p-12 text-center hero-emerald-glow space-y-5 shadow-[var(--card-shadow)]">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] max-w-2xl mx-auto">
            Siap mengambil kendali penuh atas{' '}
            <span className="text-[var(--accent-primary)]">
              keuangan pribadi Anda?
            </span>
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto">
            Mulai catat hari ini secara gratis, cepat, dan sepenuhnya berada di bawah kepemilikan Anda sendiri.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-[var(--accent-primary)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] font-semibold text-sm sm:text-base transition-colors shadow-xs"
            >
              <span>Open My Finance</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[var(--bg-canvas)] text-[var(--text-primary)] border border-[var(--border-control)] hover:bg-[var(--bg-elevated)] font-medium text-sm sm:text-base transition-colors"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
