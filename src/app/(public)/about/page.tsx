import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Briefcase, GraduationCap, Shield, UserCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tentang Finora',
  description:
    'Mengenal visi, sembilan prinsip inti, dan filosofi arsitektur local-first tanpa backend di balik aplikasi manajemen keuangan pribadi Finora.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'Tentang Finora — Your Money, Your Control',
    description:
      'Filosofi Privacy-First dan Local-First untuk pengelolaan keuangan pribadi yang tenang.',
    url: '/about',
  },
};

const CORE_PRINCIPLES = [
  'Privacy First — Tanpa pelacakan analitik dan tanpa transmisi data finansial.',
  'Local-First — IndexedDB di perangkat Anda adalah satu-satunya sumber kebenaran.',
  'Offline-First — Tetap berfungsi penuh saat koneksi lambat atau terputus.',
  'User Data Ownership — Bebas ekspor JSON ber-checksum dan CSV kapan saja.',
  'Mobile-First — Nyaman digunakan satu tangan di layar ponsel maupun desktop.',
  'Financial Accuracy — Bilangan bulat aman IDR dan tanggal kalender lokal eksak.',
  'Maintainable Architecture — Pemisahan bersih antara UI, service layer, dan domain murni.',
  'Accessibility — Kontras warna WCAG 2.1 AA di mode gelap maupun terang.',
  'Production-Oriented Engineering — Keamanan header HTTP dan validasi skema ketat.',
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
      <div className="space-y-4">
        <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 text-[var(--accent-primary)] text-xs font-semibold">
          Tentang Finora
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
          Catatan keuangan pribadi seharusnya{' '}
          <span className="font-editorial italic font-normal text-[var(--accent-hover)]">
            tetap menjadi milik Anda pribadi
          </span>
        </h1>
        <p className="text-base text-[var(--text-secondary)] leading-relaxed">
          Finora (*Your Money, Your Control*) lahir dari kegelisahan sederhana: untuk mencatat makan siang, gaji bulanan, atau target dana darurat, pengguna tidak seharusnya dipaksa menyerahkan riwayat hidup finansial mereka ke server cloud.
        </p>
      </div>

      <section className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Untuk Siapa Finora Dibuat?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: GraduationCap,
              title: 'Mahasiswa',
              desc: 'Mengelola uang saku, biaya kos, dan tabungan jangka pendek secara cepat tanpa boros kuota.',
            },
            {
              icon: Briefcase,
              title: 'Karyawan',
              desc: 'Mengawal alokasi gaji bulanan, tagihan rutin berulang, dan progres dana darurat.',
            },
            {
              icon: UserCheck,
              title: 'Freelancer',
              desc: 'Mencatat arus kas tidak tetap, memantau tren bulanan, dan mengekspor laporan CSV mandiri.',
            },
            {
              icon: Shield,
              title: 'Pengguna Peduli Privasi',
              desc: 'Menginginkan alat pencatatan modern yang 100% bebas server backend dan bebas pelacakan.',
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

      <section className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">9 Prinsip Rekayasa &amp; Produk</h2>
        <ol className="space-y-2.5 text-sm text-[var(--text-secondary)] list-decimal list-inside">
          {CORE_PRINCIPLES.map((p) => (
            <li key={p} className="leading-relaxed">
              {p}
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[var(--accent-primary)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] font-semibold text-sm transition-colors"
        >
          <span>Open My Finance</span>
          <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
        </Link>
        <Link
          href="/privacy"
          className="inline-flex items-center h-11 px-5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
        >
          Baca Kebijakan Privasi
        </Link>
      </div>
    </div>
  );
}
