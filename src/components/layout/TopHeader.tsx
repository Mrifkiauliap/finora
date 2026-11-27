'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Eye, EyeOff, Moon, Plus, Search, Sun } from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProviders';
import { FinoraLogo } from '@/components/shared/FinoraLogo';
import { Button } from '@/components/ui/Button';

const PAGE_TITLES: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/transactions': 'Transaksi',
  '/app/transactions/new': 'Catat Transaksi',
  '/app/categories': 'Kategori',
  '/app/budgets': 'Anggaran Bulanan',
  '/app/goals': 'Target Keuangan',
  '/app/recurring': 'Transaksi Berulang',
  '/app/analytics': 'Analitik Keuangan',
  '/app/reports': 'Laporan & Ekspor',
  '/app/settings': 'Pengaturan',
  '/app/settings/backup': 'Backup & Restore',
};

export function TopHeader({ onOpenCommand }: { onOpenCommand?: () => void }) {
  const pathname = usePathname();
  const { resolvedTheme, setThemePreference, isMasked, togglePrivacyMask } = useAppContext();
  const [shortcutLabel, setShortcutLabel] = React.useState('Ctrl K');

  React.useEffect(() => {
    if (
      typeof navigator !== 'undefined' &&
      /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent)
    ) {
      setShortcutLabel('⌘K');
    }
  }, []);

  const pageTitle =
    PAGE_TITLES[pathname] ??
    (pathname.startsWith('/app/transactions/') && pathname.endsWith('/edit')
      ? 'Ubah Transaksi'
      : 'Finora');

  const handleToggleTheme = () => {
    void setThemePreference(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="no-print sticky top-0 z-20 h-14 sm:h-16 bg-[var(--bg-canvas)]/85 backdrop-blur-md border-b border-[var(--border-subtle)] px-4 sm:px-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/"
          aria-label="Halaman Utama Finora"
          className="lg:hidden shrink-0"
        >
          <FinoraLogo size={32} className="rounded-lg" />
        </Link>
        <h1 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] truncate">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenCommand?.()}
          aria-label="Cari perintah atau fitur Finora"
          className="hidden sm:inline-flex items-center h-9 px-3 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-control)] gap-2.5 transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Cari perintah...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-secondary)]">
            {shortcutLabel}
          </kbd>
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          aria-label="Buka pencarian perintah"
          title="Cari perintah"
          onClick={() => onOpenCommand?.()}
        >
          <Search className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-pressed={isMasked}
          aria-label={isMasked ? 'Tampilkan nominal saldo' : 'Sembunyikan nominal saldo'}
          title={isMasked ? 'Tampilkan nominal' : 'Sembunyikan nominal'}
          onClick={() => void togglePrivacyMask()}
        >
          {isMasked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label={
            resolvedTheme === 'dark' ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'
          }
          title={resolvedTheme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          onClick={handleToggleTheme}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>

        <Link
          href="/app/transactions/new"
          aria-label="Catat Transaksi Baru"
          className="inline-flex sm:hidden items-center justify-center h-9 w-9 rounded-[10px] bg-[var(--accent-primary)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
        </Link>

        <Link
          href="/app/transactions/new"
          className="hidden sm:inline-flex lg:hidden items-center gap-1.5 h-10 px-3.5 rounded-[10px] bg-[var(--accent-primary)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] font-semibold text-sm transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Catat
        </Link>
      </div>
    </header>
  );
}
