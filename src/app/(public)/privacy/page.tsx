import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description:
    'Komitmen privasi Finora: data keuangan disimpan langsung di perangkat Anda sendiri tanpa akun, tanpa pelacakan, serta panduan menjaga cadangan data secara berkala.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Kebijakan Privasi Finora',
    description:
      'Data keuangan Anda 100% berada di perangkat Anda sendiri tanpa akun maupun pelacakan.',
    url: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-subtle)] border border-[var(--brand-soft)] text-[var(--accent-primary)] text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          Kebijakan Privasi
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Kepemilikan Data Penuh di Tangan Anda
        </h1>
        <p className="text-base text-[var(--text-secondary)] leading-relaxed">
          Finora dirancang agar catatan finansial pribadi tetap berada di tangan Anda sendiri. Kami tidak menyediakan akun cloud, sehingga tidak pernah mengumpulkan, membaca, atau menyimpan data keuangan Anda.
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-[var(--text-secondary)]">
        <section className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-2.5 shadow-[var(--card-shadow)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            1. Data Disimpan Langsung di Perangkat Anda
          </h2>
          <p>
            Seluruh transaksi, kategori, anggaran bulanan, target tabungan, jadwal transaksi berulang, dan pengaturan tampilan disimpan secara lokal di browser pada perangkat yang sedang Anda gunakan.
          </p>
        </section>

        <section className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-2.5 shadow-[var(--card-shadow)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            2. Tanpa Akun, Tanpa Server Penyimpan Data, dan Tanpa Pelacakan
          </h2>
          <p>
            Finora tidak mewajibkan registrasi, tidak memiliki server penyimpan catatan transaksi pengguna, dan tidak memasang pelacak analitik atau cookie iklan yang memantau aktivitas keuangan Anda.
          </p>
        </section>

        <section className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-2.5 shadow-[var(--card-shadow)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            3. Hal Penting tentang Penyimpanan Browser &amp; Backup
          </h2>
          <ul className="list-disc list-inside space-y-1.5">
            <li>
              Penyimpanan browser bersifat terikat pada perangkat dan browser tempat Anda mencatat; tidak ada sinkronisasi otomatis antar perangkat.
            </li>
            <li>
              Penyimpanan browser dan file cadangan yang Anda unduh tidak otomatis dienkripsi dengan kata sandi, sehingga simpanlah file cadangan Anda di folder pribadi yang aman.
            </li>
            <li>
              Membuka aplikasi lewat jendela Incognito/Private atau menghapus data situs di pengaturan browser akan menghapus catatan keuangan Anda. Biasakan membuat cadangan secara berkala lewat menu <strong className="text-[var(--text-primary)]">Backup &amp; Restore</strong>.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-2.5 shadow-[var(--card-shadow)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            4. Kontrol Privasi Layar &amp; Penghapusan Data
          </h2>
          <p>
            Anda dapat menyamarkan seluruh angka saldo dalam satu klik lewat tombol mata di bagian atas aplikasi saat berada di tempat umum, atau menghapus seluruh catatan kapan saja melalui menu <strong className="text-[var(--text-primary)]">Pengaturan</strong>.
          </p>
        </section>
      </div>

      <div className="pt-2">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[var(--accent-primary)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] font-semibold text-sm transition-colors shadow-xs"
        >
          <span>Open My Finance</span>
          <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
