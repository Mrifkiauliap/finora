'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeftRight,
  BarChart3,
  ChevronRight,
  DatabaseBackup,
  FileSpreadsheet,
  Globe,
  LayoutDashboard,
  MoreHorizontal,
  PieChart,
  Plus,
  Repeat,
  Settings,
  Tags,
  Target,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface DrawerMenuItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  iconToneClass: string;
}

const BOTTOM_BAR_ITEMS = [
  { href: '/app', label: 'Beranda', icon: LayoutDashboard },
  { href: '/app/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { href: '/app/budgets', label: 'Anggaran', icon: PieChart },
  { href: '/app/goals', label: 'Target', icon: Target },
] as const;

const DRAWER_SECTIONS: Array<{ title: string; items: DrawerMenuItem[] }> = [
  {
    title: 'KEUANGAN & PERENCANAAN',
    items: [
      {
        href: '/app/transactions/new',
        label: 'Catat Transaksi',
        description: 'Tambah pemasukan atau pengeluaran baru',
        icon: Plus,
        iconToneClass: 'bg-emerald-500/15 text-[var(--accent-primary)]',
      },
      {
        href: '/app/recurring',
        label: 'Transaksi Berulang',
        description: 'Jadwal tagihan & pemasukan rutin otomatis',
        icon: Repeat,
        iconToneClass: 'bg-amber-500/15 text-[var(--status-warning)]',
      },
      {
        href: '/app/analytics',
        label: 'Analitik Keuangan',
        description: 'Grafik arus kas, rasio tabungan & insight',
        icon: BarChart3,
        iconToneClass: 'bg-sky-500/15 text-[var(--chart-3)]',
      },
      {
        href: '/app/reports',
        label: 'Laporan & Ekspor',
        description: 'Ringkasan bulanan, cetak PDF & ekspor CSV',
        icon: FileSpreadsheet,
        iconToneClass: 'bg-violet-500/15 text-[var(--chart-5)]',
      },
    ],
  },
  {
    title: 'PENGELOLAAN & SISTEM',
    items: [
      {
        href: '/app/categories',
        label: 'Kategori',
        description: 'Atur kategori pemasukan & pengeluaran',
        icon: Tags,
        iconToneClass: 'bg-teal-500/15 text-[var(--chart-6)]',
      },
      {
        href: '/app/settings/backup',
        label: 'Backup & Restore',
        description: 'Cadangkan atau pulihkan database JSON lokal',
        icon: DatabaseBackup,
        iconToneClass: 'bg-sky-500/15 text-[var(--chart-3)]',
      },
      {
        href: '/app/settings',
        label: 'Pengaturan',
        description: 'Tema tampilan, privasi nominal & reset data',
        icon: Settings,
        iconToneClass: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]',
      },
      {
        href: '/',
        label: 'Halaman Publik Finora',
        description: 'Lihat beranda produk, fitur & kebijakan privasi',
        icon: Globe,
        iconToneClass: 'bg-emerald-500/15 text-[var(--accent-primary)]',
      },
    ],
  },
];

const DRAWER_ROUTES = DRAWER_SECTIONS.flatMap((section) =>
  section.items.map((item) => item.href)
).filter((href) => href !== '/');

export function MobileBottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const isActive = (href: string) => {
    if (href === '/app' || href === '/') return pathname === href;
    if (href === '/app/settings') return pathname === '/app/settings';
    if (href === '/app/transactions') {
      return (
        pathname === '/app/transactions' ||
        (pathname.startsWith('/app/transactions/') && pathname !== '/app/transactions/new')
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isMoreActive =
    menuOpen || DRAWER_ROUTES.some((route) => isActive(route));

  return (
    <>
      <nav
        aria-label="Navigasi Mobile"
        className="no-print lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--bg-surface)]/95 backdrop-blur-md border-t border-[var(--border-subtle)] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 items-stretch h-16 px-1">
          {BOTTOM_BAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1 min-h-[48px] text-[11px] rounded-lg transition-colors',
                  active
                    ? 'text-[var(--accent-primary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
                )}
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full bg-[var(--accent-primary)]"
                  />
                ) : null}
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            className={cn(
              'relative flex flex-col items-center justify-center gap-1 min-h-[48px] text-[11px] rounded-lg transition-colors cursor-pointer',
              isMoreActive
                ? 'text-[var(--accent-primary)] font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
            )}
          >
            {isMoreActive ? (
              <span
                aria-hidden="true"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full bg-[var(--accent-primary)]"
              />
            ) : null}
            <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
            <span>Lainnya</span>
          </button>
        </div>
      </nav>

      <DialogPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs" />
          <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] rounded-t-3xl bg-[var(--bg-popover)] border-t border-[var(--border-subtle)] shadow-[var(--overlay-shadow)] flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]">
            <div
              aria-hidden="true"
              className="w-10 h-1.5 rounded-full bg-[var(--border-control)]/60 mx-auto mt-3 shrink-0"
            />

            <div className="px-5 pt-3 pb-4 border-b border-[var(--border-subtle)] flex items-start justify-between gap-3 shrink-0">
              <div>
                <DialogPrimitive.Title className="text-lg font-bold text-[var(--text-primary)] leading-tight">
                  Menu Aplikasi
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Finora • Keuangan Lokal
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close
                aria-label="Tutup menu aplikasi"
                className="h-9 w-9 rounded-full inline-flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </DialogPrimitive.Close>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              {DRAWER_SECTIONS.map((section) => (
                <section key={section.title} aria-label={section.title}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                    {section.title}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3.5 px-2.5 py-2.5 -mx-2.5 rounded-2xl transition-colors',
                            active
                              ? 'bg-emerald-500/10'
                              : 'hover:bg-[var(--bg-elevated)]'
                          )}
                        >
                          <div
                            className={cn(
                              'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0',
                              item.iconToneClass
                            )}
                          >
                            <Icon className="w-5 h-5" aria-hidden="true" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[15px] font-semibold text-[var(--text-primary)] leading-snug">
                              {item.label}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                              {item.description}
                            </p>
                          </div>
                          <ChevronRight
                            className="w-4 h-4 text-[var(--text-muted)] shrink-0"
                            aria-hidden="true"
                          />
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
