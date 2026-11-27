'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeftRight,
  LayoutDashboard,
  Menu,
  PieChart,
  Plus,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { cn } from '@/lib/cn';
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from './AppSidebar';

export function MobileBottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const isActive = (href: string) => {
    if (href === '/app') return pathname === '/app';
    if (href === '/app/settings') return pathname === '/app/settings';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const extraItems = [
    ...PRIMARY_NAV_ITEMS.filter(
      (i) => !['/app', '/app/transactions', '/app/budgets'].includes(i.href)
    ),
    ...SECONDARY_NAV_ITEMS,
  ];

  return (
    <>
      <nav
        aria-label="Navigasi Mobile"
        className="no-print lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--bg-surface)]/95 backdrop-blur-md border-t border-[var(--border-subtle)] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 items-center h-16 px-1">
          <Link
            href="/app"
            aria-current={isActive('/app') ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center justify-center gap-1 min-h-[48px] text-[11px] font-medium rounded-lg',
              isActive('/app')
                ? 'text-[var(--accent-primary)]'
                : 'text-[var(--text-secondary)]'
            )}
          >
            <LayoutDashboard className="w-5 h-5" aria-hidden="true" />
            <span>Beranda</span>
          </Link>

          <Link
            href="/app/transactions"
            aria-current={isActive('/app/transactions') ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center justify-center gap-1 min-h-[48px] text-[11px] font-medium rounded-lg',
              isActive('/app/transactions')
                ? 'text-[var(--accent-primary)]'
                : 'text-[var(--text-secondary)]'
            )}
          >
            <ArrowLeftRight className="w-5 h-5" aria-hidden="true" />
            <span>Transaksi</span>
          </Link>

          <div className="flex items-center justify-center">
            <Link
              href="/app/transactions/new"
              aria-label="Catat Transaksi Baru"
              className="w-12 h-12 rounded-full bg-[var(--accent-primary)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] flex items-center justify-center shadow-md transition-transform active:scale-95"
            >
              <Plus className="w-6 h-6" aria-hidden="true" />
            </Link>
          </div>

          <Link
            href="/app/budgets"
            aria-current={isActive('/app/budgets') ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center justify-center gap-1 min-h-[48px] text-[11px] font-medium rounded-lg',
              isActive('/app/budgets')
                ? 'text-[var(--accent-primary)]'
                : 'text-[var(--text-secondary)]'
            )}
          >
            <PieChart className="w-5 h-5" aria-hidden="true" />
            <span>Anggaran</span>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            className="flex flex-col items-center justify-center gap-1 min-h-[48px] text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
            <span>Menu</span>
          </button>
        </div>
      </nav>

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent
          title="Menu Finora"
          description="Pilih fitur pengelolaan keuangan lainnya."
        >
          <div className="grid grid-cols-2 gap-2.5">
            {extraItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 p-3.5 rounded-xl border text-sm font-medium min-h-[48px] transition-colors',
                    active
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-[var(--accent-primary)]'
                      : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-canvas)]'
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="pt-3 mt-2 border-t border-[var(--border-subtle)]">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              ← Kembali ke Halaman Publik Finora
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
