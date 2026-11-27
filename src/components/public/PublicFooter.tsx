import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--brand-subtle)] border border-[var(--brand-soft)] flex items-center justify-center text-[var(--accent-primary)] font-extrabold">
                F
              </div>
              <span className="text-base font-extrabold text-[var(--text-primary)]">Finora</span>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              Your Money, Your Control. Aplikasi pengelola keuangan pribadi yang praktis, jelas, dan menjaga kendali penuh atas data finansial Anda.
            </p>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Produk
            </h3>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li>
                <Link href="/app" className="hover:text-[var(--text-primary)]">
                  Open My Finance
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-[var(--text-primary)]">
                  Fitur Utama
                </Link>
              </li>
              <li>
                <Link href="/app/settings/backup" className="hover:text-[var(--text-primary)]">
                  Backup &amp; Restore
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Informasi
            </h3>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li>
                <Link href="/about" className="hover:text-[var(--text-primary)]">
                  Tentang Finora
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--text-primary)]">
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Privasi Terjaga
            </h3>
            <div className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3.5 text-xs text-[var(--text-secondary)] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[var(--accent-primary)] font-semibold">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                <span>Data Milik Anda Sepenuhnya</span>
              </div>
              <p>
                Catatan keuangan Anda tersimpan langsung di perangkat Anda sendiri, tanpa akun dan tanpa pelacakan.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
          <p>© {new Date().getFullYear()} Finora. Pengelola keuangan pribadi yang menjaga privasi.</p>
          <p>Rupiah (IDR) • Bahasa Indonesia</p>
        </div>
      </div>
    </footer>
  );
}
