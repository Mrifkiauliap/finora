import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)] font-bold">
                F
              </div>
              <span className="text-base font-bold text-[var(--text-primary)]">Finora</span>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              Your Money, Your Control. Aplikasi manajemen keuangan pribadi local-first dan offline-first untuk menjaga kendali penuh atas data finansial Anda.
            </p>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Aplikasi
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
                  Backup & Restore
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
              Komitmen Arsitektur
            </h3>
            <div className="rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3.5 text-xs text-[var(--text-secondary)] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[var(--accent-primary)] font-semibold">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                <span>Zero Server Storage</span>
              </div>
              <p>
                Seluruh transaksi tersimpan di IndexedDB perangkat Anda tanpa pelacakan atau sinkronisasi cloud tersembunyi.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
          <p>© {new Date().getFullYear()} Finora. Dibangun dengan prinsip Privacy-First & Local-First.</p>
          <p>Mata uang default: IDR • Bahasa Indonesia</p>
        </div>
      </div>
    </footer>
  );
}
