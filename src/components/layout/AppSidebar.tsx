'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeftRight,
  BarChart3,
  DatabaseBackup,
  FileSpreadsheet,
  Globe,
  LayoutDashboard,
  PieChart,
  Plus,
  Repeat,
  Settings,
  ShieldCheck,
  Tags,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export const PRIMARY_NAV_ITEMS = [
  { href: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { href: '/app/budgets', label: 'Anggaran', icon: PieChart },
  { href: '/app/goals', label: 'Target', icon: Target },
  { href: '/app/recurring', label: 'Berulang', icon: Repeat },
  { href: '/app/analytics', label: 'Analitik', icon: BarChart3 },
  { href: '/app/reports', label: 'Laporan', icon: FileSpreadsheet },
] as const;

export const SECONDARY_NAV_ITEMS = [
  { href: '/app/categories', label: 'Kategori', icon: Tags },
  { href: '/app/settings/backup', label: 'Backup & Restore', icon: DatabaseBackup },
  { href: '/app/settings', label: 'Pengaturan', icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/app') return pathname === '/app';
    if (href === '/app/settings') return pathname === '/app/settings';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="no-print hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] z-30">
      <div className="h-16 px-5 flex items-center justify-between gap-3 border-b border-[var(--border-subtle)]">
        <Link href="/app" className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)] font-bold text-lg shrink-0">
            F
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold text-[var(--text-primary)] leading-tight">Finora</p>
            <p className="text-[11px] text-[var(--text-secondary)] truncate">
              Your Money, Your Control
            </p>
          </div>
        </Link>
        <Link
          href="/"
          title="Kembali ke halaman utama Finora"
          aria-label="Kembali ke halaman utama Finora"
          className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] shrink-0"
        >
          <Globe className="w-4 h-4" />
        </Link>
      </div>

      <div className="p-4">
        <Link
          href="/app/transactions/new"
          className="w-full h-10 px-4 rounded-[10px] bg-[var(--accent-primary)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Catat Transaksi
        </Link>
      </div>

      <nav aria-label="Navigasi Utama" className="flex-1 overflow-y-auto px-3 space-y-6 pb-4">
        <ul className="space-y-1">
          {PRIMARY_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors',
                    active
                      ? 'bg-emerald-500/15 text-[var(--accent-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                  )}
                >
                  {active ? (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-[var(--accent-primary)]"
                    />
                  ) : null}
                  <Icon className="w-5 h-5 shrink-0" aria-hidden="true" strokeWidth={1.75} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="pt-4 border-t border-[var(--border-subtle)]">
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Pengelolaan
          </p>
          <ul className="space-y-1">
            {SECONDARY_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors',
                      active
                        ? 'bg-emerald-500/15 text-[var(--accent-primary)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                    )}
                  >
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-[var(--accent-primary)]"
                      />
                    ) : null}
                    <Icon className="w-5 h-5 shrink-0" aria-hidden="true" strokeWidth={1.75} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <ShieldCheck className="w-4 h-4 text-[var(--accent-primary)] shrink-0" aria-hidden="true" />
          <span>Penyimpanan Lokal • Offline Siap</span>
        </div>
      </div>
    </aside>
  );
}
