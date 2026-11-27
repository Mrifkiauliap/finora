import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Briefcase, GraduationCap, Shield, UserCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tentang Finora',
  description:
    'Mengenal visi dan komitmen Finora dalam menghadirkan pengelola keuangan pribadi yang mudah digunakan, akurat, dan menjaga penuh privasi pengguna.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'Tentang Finora — Your Money, Your Control',
    description:
      'Aplikasi pencatatan keuangan pribadi yang praktis, tenang, dan menjaga penuh kendali data di tangan Anda.',
    url: '/about',
  },
};

const PRODUCT_COMMITMENTS = [
  'Privasi Terjaga — Tanpa akun, tanpa login, dan tanpa pelacakan aktivitas Anda.',
  'Data di Perangkat Anda — Semua riwayat transaksi dan anggaran tersimpan langsung di perangkat Anda sendiri.',
  'Tetap Jalan Offline — Tetap dapat dibuka dan dipakai mencatat meskipun sinyal tidak stabil.',
  'Bebas Bawa Data Anda — Unduh cadangan data maupun ekspor laporan tabel kapan saja Anda perlukan.',
  'Nyaman di Semua Layar — Ringkas dipakai satu tangan di ponsel sekaligus lega di layar desktop.',
  'Perhitungan Rupiah yang Jelas — Nominal selalu presisi serta memisahkan tabungan dari pengeluaran.',
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
      <div className="space-y-4">
        <span className="inline-block px-3 py-1 rounded-full bg-[var(--brand-subtle)] border border-[var(--brand-soft)] text-[var(--accent-primary)] text-xs font-semibold">
          Tentang Finora
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Catatan keuangan pribadi seharusnya{' '}
          <span className="text-[var(--accent-primary)]">
            tetap menjadi milik Anda pribadi
          </span>
        </h1>
        <p className="text-base text-[var(--text-secondary)] leading-relaxed">
          Finora (<em className="not-italic font-semibold text-[var(--text-primary)]">Your Money, Your Control</em>) dibuat dari kebutuhan sederhana: untuk mencatat makan siang, gaji bulanan, atau target dana darurat, Anda tidak seharusnya repot membuat akun atau menyerahkan riwayat transaksi ke pihak lain.
        </p>
      </div>

      <section className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 space-y-4 shadow-[var(--card-shadow)]">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Untuk Siapa Finora Dibuat?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: GraduationCap,
              title: 'Mahasiswa',
              desc: 'Mengelola uang saku, biaya kos, dan tabungan jangka pendek secara cepat setiap hari.',
            },
            {
              icon: Briefcase,
              title: 'Karyawan',
              desc: 'Mengatur alokasi gaji bulanan, tagihan rutin, dan progres dana darurat tanpa ribet.',
            },
            {
              icon: UserCheck,
              title: 'Freelancer',
              desc: 'Mencatat pemasukan proyek yang dinamis, memantau tren bulanan, dan mengekspor laporan mandiri.',
            },
            {
              icon: Shield,
              title: 'Pengguna Peduli Privasi',
              desc: 'Menginginkan pencatat keuangan modern yang tidak meminta data pribadi atau pelacakan.',
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
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 space-y-4 shadow-[var(--card-shadow)]">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Komitmen Utama Finora</h2>
        <ol className="space-y-2.5 text-sm text-[var(--text-secondary)] list-decimal list-inside">
          {PRODUCT_COMMITMENTS.map((p) => (
            <li key={p} className="leading-relaxed">
              {p}
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[var(--accent-primary)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] font-semibold text-sm transition-colors shadow-xs"
        >
          <span>Open My Finance</span>
          <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
        </Link>
        <Link
          href="/privacy"
          className="inline-flex items-center h-11 px-5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-control)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
        >
          Baca Kebijakan Privasi
        </Link>
      </div>
    </div>
  );
}
