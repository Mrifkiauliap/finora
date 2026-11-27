import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowUpRight,
  BarChart3,
  DatabaseBackup,
  FileSpreadsheet,
  PieChart,
  Repeat,
  Tags,
  Target,
  Wallet,
  WifiOff,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Fitur Lengkap',
  description:
    'Pelajari seluruh fitur Finora: pencatatan transaksi IDR, kategori fleksibel, anggaran bulanan, target tabungan, transaksi berulang, analitik Recharts, laporan CSV, dan Backup JSON SHA-256.',
  alternates: { canonical: '/features' },
  openGraph: {
    title: 'Fitur Lengkap Finora',
    description:
      'Semua alat manajemen keuangan pribadi local-first dalam satu aplikasi PWA yang cepat dan privat.',
    url: '/features',
  },
};

const FEATURE_MODULES = [
  {
    icon: Wallet,
    badge: 'Inti',
    title: 'Manajemen Transaksi & Filter Multi-Kriteria',
    points: [
      'Nominal disimpan sebagai integer aman IDR (Rp 1 s.d. Rp 999.999.999.999) tanpa selisih pembulatan float.',
      'Tanggal kalender lokal YYYY-MM-DD bebas pergeseran hari akibat zona waktu.',
      'Pencarian teks real-time serta filter berdasarkan rentang tanggal, tipe, kategori, dan metode pembayaran lengkap dengan subtotal.',
    ],
  },
  {
    icon: Tags,
    badge: 'Organisasi',
    title: 'Kategori Fleksibel & Penghapusan Aman',
    points: [
      'Otomatis menyediakan 13 kategori sistem bawaan (5 pemasukan, 8 pengeluaran) saat pertama dibuka.',
      'Buat kategori kustom dengan nama unik, pilihan ikon Lucide terkurasi, dan warna penanda.',
      'Kategori yang sudah dipakai tidak dapat terhapus sembarangan: pilih Soft-Archive atau pindahkan seluruh referensinya (Reassignment) secara atomik.',
    ],
  },
  {
    icon: PieChart,
    badge: 'Kontrol',
    title: 'Anggaran Bulanan dengan Ambang Peringatan',
    points: [
      'Tetapkan batas pengeluaran per kategori per bulan YYYY-MM dengan ambang peringatan 50%–95%.',
      'Evaluasi realisasi otomatis: status Aman, Mendekati Batas, hingga Melebihi Batas (over-budget).',
      'Fitur "Salin dari Bulan Lalu" mempercepat penyiapan anggaran bulanan tanpa menimpa data yang sudah ada.',
    ],
  },
  {
    icon: Target,
    badge: 'Tabungan',
    title: 'Target Keuangan (Anti-Double Counting)',
    points: [
      'Setoran dan penarikan target dicatat sebagai earmark dana, bukan sebagai transaksi pengeluaran fiktif.',
      'Otomatis membedakan Saldo Bersih vs Saldo Tersedia bebas pakai.',
      'Menghitung estimasi kebutuhan tabungan bulanan ketika target memiliki tenggat waktu.',
    ],
  },
  {
    icon: Repeat,
    badge: 'Otomatisasi',
    title: 'Transaksi Berulang Lokal Idempoten',
    points: [
      'Mendukung siklus harian, mingguan, bulanan, dan tahunan dengan interval kustom.',
      'End-of-month clamping: tanggal 31 otomatis menyesuaikan akhir bulan Februari (28/29) lalu kembali ke 31 pada Maret.',
      'Materialisasi dilakukan aman tanpa duplikasi dan tanpa memerlukan server cron.',
    ],
  },
  {
    icon: BarChart3,
    badge: 'Wawasan',
    title: 'Analitik Visual & Insight Deterministik',
    points: [
      'Grafik batang tren Pemasukan vs Pengeluaran dan grafik Donut proporsi kategori pengeluaran.',
      'Kartu insight lokal menghitung perubahan pengeluaran antar-periode, pos terbesar, dan kesehatan rasio tabungan.',
      '100% dihitung di browser tanpa mengirim data ke server AI eksternal.',
    ],
  },
  {
    icon: FileSpreadsheet,
    badge: 'Laporan',
    title: 'Laporan Siap Cetak & Ekspor CSV Aman',
    points: [
      'Tampilan ringkasan periode siap cetak dengan stylesheet khusus @media print.',
      'Ekspor CSV ber-UTF-8 BOM agar langsung rapi dibuka di Microsoft Excel maupun Google Sheets.',
      'Dilengkapi proteksi anti CSV Formula Injection untuk sel teks berawalan karakter formula.',
    ],
  },
  {
    icon: DatabaseBackup,
    badge: 'Portabilitas',
    title: 'Backup JSON SHA-256 & Restore Preview',
    points: [
      'Ekspor seluruh 7 tabel FinoraDB ke format JSON berversi dengan checksum integritas SHA-256.',
      'Pratinjau isi dan deteksi konflik sebelum memulihkan data melalui mode Merge maupun Replace All.',
      'Dibatasi 25 MB dengan sanitasi prototipe dan validasi skema Zod ketat.',
    ],
  },
  {
    icon: WifiOff,
    badge: 'PWA',
    title: 'Installable & Berjalan Penuh Saat Offline',
    points: [
      'Dapat dipasang di Android, iOS, Windows, dan macOS sebagai aplikasi mandiri.',
      'Service Worker memisahkan cache aset antarmuka dari data keuangan Anda di IndexedDB.',
      'Halaman fallback /offline ramah saat mengakses rute yang belum ter-cache.',
    ],
  },
] as const;

export default function FeaturesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
      <div className="max-w-3xl space-y-4">
        <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 text-[var(--accent-primary)] text-xs font-semibold">
          Fitur Produk Finora
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
          Semua yang Anda butuhkan untuk mengelola keuangan pribadi secara{' '}
          <span className="font-editorial italic font-normal text-[var(--accent-hover)]">
            akurat dan privat
          </span>
        </h1>
        <p className="text-base text-[var(--text-secondary)] leading-relaxed">
          Setiap modul Finora dirancang agar ringan di perangkat seluler, presisi dalam kalkulasi Rupiah, dan sepenuhnya mandiri di browser Anda.
        </p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURE_MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <section
              key={mod.title}
              className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-[var(--accent-primary)] flex items-center justify-center">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                  {mod.badge}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{mod.title}</h2>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                {mod.points.map((pt) => (
                  <li key={pt} className="leading-relaxed">
                    • {pt}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
