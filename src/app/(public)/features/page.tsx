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
    'Kenali seluruh fitur Finora: catat transaksi harian, atur kategori, kontrol anggaran bulanan, pantau target tabungan, jadwal berulang, grafik analitik, laporan rapi, dan cadangan data.',
  alternates: { canonical: '/features' },
  openGraph: {
    title: 'Fitur Lengkap Finora',
    description:
      'Semua fitur pengelolaan keuangan pribadi yang rapi, cepat, dan menjaga penuh privasi Anda.',
    url: '/features',
  },
};

const FEATURE_MODULES = [
  {
    icon: Wallet,
    badge: 'Inti',
    title: 'Pencatatan Transaksi & Pencarian Cepat',
    points: [
      'Catat pemasukan dan pengeluaran Rupiah dengan angka bulat yang akurat.',
      'Pilih tanggal transaksi sesuai kalender harian lengkap dengan catatan dan metode pembayaran.',
      'Cari riwayat seketika serta saring berdasarkan tanggal, tipe transaksi, kategori, atau metode bayar.',
    ],
  },
  {
    icon: Tags,
    badge: 'Organisasi',
    title: 'Kategori Fleksibel & Aman Dikelola',
    points: [
      'Tersedia 13 kategori umum bawaan sejak pertama kali membuka aplikasi.',
      'Tambah kategori kustom sesuai kebiasaan belanja lengkap dengan pilihan ikon dan warna.',
      'Kategori yang sudah terpakai dapat diarsipkan atau dipindahkan ke kategori lain tanpa merusak riwayat transaksi.',
    ],
  },
  {
    icon: PieChart,
    badge: 'Kontrol',
    title: 'Anggaran Bulanan dengan Peringatan Dini',
    points: [
      'Atur batas pengeluaran per kategori tiap bulan beserta ambang pengingat sesuai kebutuhan.',
      'Pantau status belanja secara langsung mulai dari Aman, Mendekati Batas, hingga Melebihi Batas.',
      'Salin aturan anggaran dari bulan sebelumnya dalam sekali klik untuk menghemat waktu.',
    ],
  },
  {
    icon: Target,
    badge: 'Tabungan',
    title: 'Target Keuangan yang Jelas',
    points: [
      'Setoran tabungan dicatat terpisah sehingga tidak membuat total pengeluaran terlihat membengkak.',
      'Memisahkan Saldo Bersih dan Saldo Tersedia agar Anda tahu dana yang benar-benar bebas dipakai.',
      'Membantu memperkirakan kebutuhan nabung per bulan jika Anda menetapkan batas waktu.',
    ],
  },
  {
    icon: Repeat,
    badge: 'Otomatisasi',
    title: 'Transaksi Berulang Terjadwal',
    points: [
      'Atur pemasukan gaji, uang kos, atau tagihan rutin harian, mingguan, bulanan, maupun tahunan.',
      'Tanggal akhir bulan otomatis menyesuaikan panjang hari di setiap bulan secara akurat.',
      'Transaksi jatuh tempo dibuat otomatis tanpa duplikasi saat Anda membuka aplikasi.',
    ],
  },
  {
    icon: BarChart3,
    badge: 'Wawasan',
    title: 'Analitik Visual & Ringkasan Bulanan',
    points: [
      'Grafik perbandingan Pemasukan vs Pengeluaran dan porsi kategori pengeluaran yang mudah dibaca.',
      'Ringkasan kondisi keuangan otomatis yang menyorot perubahan belanja dan rasio tabungan Anda.',
      'Semua hitungan diolah langsung di perangkat tanpa mengirim data ke mana pun.',
    ],
  },
  {
    icon: FileSpreadsheet,
    badge: 'Laporan',
    title: 'Laporan Siap Cetak & Ekspor Tabel',
    points: [
      'Tampilan ringkasan periode bulanan yang rapi ketika dicetak atau disimpan menjadi PDF.',
      'Unduh data transaksi ke file tabel untuk dibuka langsung di Excel atau Google Sheets.',
      'Menyajikan ringkasan pemasukan, pengeluaran, dan kategori utama per periode.',
    ],
  },
  {
    icon: DatabaseBackup,
    badge: 'Portabilitas',
    title: 'Backup & Restore dengan Pratinjau',
    points: [
      'Unduh seluruh data transaksi, anggaran, target, dan kategori ke satu file cadangan kapan saja.',
      'Lihat ringkasan isi file dan potensi konflik sebelum memulihkan data ke perangkat lain.',
      'Pilih gabungkan data baru atau ganti seluruh isi aplikasi sesuai kebutuhan Anda.',
    ],
  },
  {
    icon: WifiOff,
    badge: 'Kemudahan',
    title: 'Nyaman Dipasang & Tetap Jalan Offline',
    points: [
      'Dapat dipasang di layar utama ponsel atau desktop layaknya aplikasi mandiri.',
      'Tetap bisa membuka aplikasi, mencatat transaksi, dan cek anggaran meski tanpa koneksi internet.',
      'Mendukung mode terang maupun mode gelap yang ramah di mata.',
    ],
  },
] as const;

export default function FeaturesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
      <div className="max-w-3xl space-y-4">
        <span className="inline-block px-3 py-1 rounded-full bg-[var(--brand-subtle)] border border-[var(--brand-soft)] text-[var(--accent-primary)] text-xs font-semibold">
          Fitur Produk Finora
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Semua yang Anda butuhkan untuk mengelola keuangan pribadi secara{' '}
          <span className="text-[var(--accent-primary)]">
            akurat dan privat
          </span>
        </h1>
        <p className="text-base text-[var(--text-secondary)] leading-relaxed">
          Setiap fitur Finora dirancang agar ringan dipakai di ponsel maupun laptop, jelas dalam perhitungan Rupiah, dan sepenuhnya menjadi milik Anda.
        </p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURE_MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <section
              key={mod.title}
              className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 flex flex-col gap-4 shadow-[var(--card-shadow)]"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-subtle)] border border-[var(--brand-soft)] text-[var(--accent-primary)] flex items-center justify-center">
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
