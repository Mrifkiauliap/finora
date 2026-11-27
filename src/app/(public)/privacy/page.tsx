import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description:
    'Komitmen privasi Finora: penyimpanan eksklusif di IndexedDB lokal browser, nol transmisi data keuangan ke server, nol pelacakan analitik, dan batasan penyimpanan browser.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Kebijakan Privasi Finora',
    description:
      'Data keuangan Anda 100% berada di perangkat Anda sendiri tanpa server backend maupun pelacakan.',
    url: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-[var(--accent-primary)] text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          Kebijakan Privasi
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
          Kepemilikan Data Penuh di Tangan Anda
        </h1>
        <p className="text-base text-[var(--text-secondary)] leading-relaxed">
          Finora dibangun dengan arsitektur <strong className="text-[var(--text-primary)]">Local-First tanpa backend</strong>. Pengembang dan penyedia hosting tidak pernah mengumpulkan, membaca, atau menyimpan catatan keuangan Anda.
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-[var(--text-secondary)]">
        <section className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-2.5">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            1. Penyimpanan Lokal Eksklusif (IndexedDB)
          </h2>
          <p>
            Seluruh transaksi, kategori, anggaran bulanan, target tabungan, jadwal berulang, dan pengaturan aplikasi disimpan di dalam basis data browser lokal (<code className="text-[var(--text-primary)]">FinoraDB</code>) pada perangkat Anda.
          </p>
        </section>

        <section className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-2.5">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            2. Nol Transmisi Data &amp; Nol Telemetri
          </h2>
          <p>
            Finora tidak memakai layanan analitik pihak ketiga (seperti Google Analytics atau Meta Pixel), tidak memasang cookie pelacakan iklan, dan memuat font secara mandiri (self-hosted) sehingga tidak ada permintaan runtime ke CDN pihak ketiga.
          </p>
          <p>
            Server hosting Vercel hanya menyajikan berkas statis aplikasi melalui HTTPS; log standar edge server hanya mencakup permintaan aset web umum dan tidak pernah memuat payload transaksi keuangan Anda.
          </p>
        </section>

        <section className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-2.5">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            3. Batasan Penyimpanan Browser &amp; Tanggung Jawab Backup
          </h2>
          <ul className="list-disc list-inside space-y-1.5">
            <li>
              Data terikat pada profil browser dan perangkat tempat Anda mencatatnya; tidak ada sinkronisasi cloud otomatis antar-perangkat.
            </li>
            <li>
              Menggunakan jendela Incognito/Private atau membersihkan &ldquo;Site Data / Cookies&rdquo; di browser akan menghapus basis data lokal Finora.
            </li>
            <li>
              Gunakan fitur <strong className="text-[var(--text-primary)]">Backup JSON</strong> di dalam aplikasi secara berkala dan simpan berkas tersebut di tempat aman karena berkas cadangan MVP tidak dienkripsi kata sandi.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-2.5">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            4. Penghapusan Data &amp; Privasi Layar
          </h2>
          <p>
            Anda dapat menyamarkan angka saldo secara instan dengan tombol <strong className="text-[var(--text-primary)]">Privacy Mask</strong> di header aplikasi, atau menghapus seluruh catatan keuangan lokal kapan saja melalui menu <strong className="text-[var(--text-primary)]">Pengaturan → Zona Bahaya</strong>.
          </p>
        </section>
      </div>

      <div className="pt-2">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[var(--accent-primary)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] font-semibold text-sm transition-colors"
        >
          <span>Open My Finance</span>
          <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
