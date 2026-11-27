'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftRight,
  BarChart3,
  DatabaseBackup,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Globe,
  LayoutDashboard,
  Moon,
  PieChart,
  Plus,
  Repeat,
  Search,
  Settings,
  Sun,
  Tags,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProviders';
import { cn } from '@/lib/cn';

type CommandGroup = 'Aksi Cepat' | 'Navigasi' | 'Pengaturan';

interface CommandItem {
  id: string;
  group: CommandGroup;
  label: string;
  keywords: string[];
  icon: LucideIcon;
  shortcut?: string;
  onSelect: () => void;
}

const GROUP_ORDER: CommandGroup[] = ['Aksi Cepat', 'Navigasi', 'Pengaturan'];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { resolvedTheme, setThemePreference, isMasked, togglePrivacyMask } = useAppContext();
  const [query, setQuery] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const itemRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  React.useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  const items = React.useMemo<CommandItem[]>(
    () => [
      {
        id: 'quick-new-tx',
        group: 'Aksi Cepat',
        label: 'Catat Transaksi Baru',
        keywords: ['tambah', 'pemasukan', 'pengeluaran', 'new', 'add'],
        icon: Plus,
        shortcut: 'N',
        onSelect: () => router.push('/app/transactions/new'),
      },
      {
        id: 'quick-privacy-mask',
        group: 'Aksi Cepat',
        label: isMasked ? 'Tampilkan Nominal Saldo' : 'Sembunyikan Nominal Saldo',
        keywords: ['privasi', 'mask', 'saldo', 'blur'],
        icon: isMasked ? Eye : EyeOff,
        onSelect: () => void togglePrivacyMask(),
      },
      {
        id: 'quick-theme',
        group: 'Aksi Cepat',
        label: resolvedTheme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap',
        keywords: ['tema', 'theme', 'dark', 'light'],
        icon: resolvedTheme === 'dark' ? Sun : Moon,
        onSelect: () => void setThemePreference(resolvedTheme === 'dark' ? 'light' : 'dark'),
      },
      {
        id: 'quick-backup',
        group: 'Aksi Cepat',
        label: 'Backup & Restore Data',
        keywords: ['cadangan', 'ekspor', 'impor', 'json'],
        icon: DatabaseBackup,
        onSelect: () => router.push('/app/settings/backup'),
      },
      {
        id: 'nav-dashboard',
        group: 'Navigasi',
        label: 'Dashboard',
        keywords: ['beranda', 'ringkasan', 'home'],
        icon: LayoutDashboard,
        onSelect: () => router.push('/app'),
      },
      {
        id: 'nav-transactions',
        group: 'Navigasi',
        label: 'Transaksi',
        keywords: ['riwayat', 'mutasi', 'daftar'],
        icon: ArrowLeftRight,
        onSelect: () => router.push('/app/transactions'),
      },
      {
        id: 'nav-budgets',
        group: 'Navigasi',
        label: 'Anggaran Bulanan',
        keywords: ['budget', 'batas'],
        icon: PieChart,
        onSelect: () => router.push('/app/budgets'),
      },
      {
        id: 'nav-goals',
        group: 'Navigasi',
        label: 'Target Keuangan',
        keywords: ['tabungan', 'impian', 'goal'],
        icon: Target,
        onSelect: () => router.push('/app/goals'),
      },
      {
        id: 'nav-recurring',
        group: 'Navigasi',
        label: 'Transaksi Berulang',
        keywords: ['rutin', 'tagihan', 'langganan'],
        icon: Repeat,
        onSelect: () => router.push('/app/recurring'),
      },
      {
        id: 'nav-analytics',
        group: 'Navigasi',
        label: 'Analitik Keuangan',
        keywords: ['grafik', 'chart', 'insight'],
        icon: BarChart3,
        onSelect: () => router.push('/app/analytics'),
      },
      {
        id: 'nav-reports',
        group: 'Navigasi',
        label: 'Laporan & Ekspor',
        keywords: ['csv', 'pdf', 'cetak'],
        icon: FileSpreadsheet,
        onSelect: () => router.push('/app/reports'),
      },
      {
        id: 'set-categories',
        group: 'Pengaturan',
        label: 'Kategori',
        keywords: ['label', 'jenis'],
        icon: Tags,
        onSelect: () => router.push('/app/categories'),
      },
      {
        id: 'set-preferences',
        group: 'Pengaturan',
        label: 'Pengaturan',
        keywords: ['preferensi', 'reset', 'akun'],
        icon: Settings,
        onSelect: () => router.push('/app/settings'),
      },
      {
        id: 'set-public',
        group: 'Pengaturan',
        label: 'Halaman Publik Finora',
        keywords: ['landing', 'beranda publik', 'tentang'],
        icon: Globe,
        onSelect: () => router.push('/'),
      },
    ],
    [isMasked, resolvedTheme, router, setThemePreference, togglePrivacyMask]
  );

  const filteredItems = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q) ||
        item.keywords.some((kw) => kw.toLowerCase().includes(q))
    );
  }, [items, query]);

  const groupedSections = React.useMemo(() => {
    const sections: Array<{ group: CommandGroup; items: Array<{ item: CommandItem; index: number }> }> = [];
    let runningIndex = 0;

    for (const group of GROUP_ORDER) {
      const matches = filteredItems.filter((item) => item.group === group);
      if (matches.length > 0) {
        sections.push({
          group,
          items: matches.map((item) => ({ item, index: runningIndex++ })),
        });
      }
    }

    return sections;
  }, [filteredItems]);

  const orderedItems = React.useMemo(
    () => groupedSections.flatMap((section) => section.items.map((entry) => entry.item)),
    [groupedSections]
  );

  const selectedItem = orderedItems[activeIndex];

  React.useEffect(() => {
    if (!selectedItem) return;
    const el = itemRefs.current[selectedItem.id];
    el?.scrollIntoView?.({ block: 'nearest' });
  }, [selectedItem]);

  const runItem = React.useCallback(
    (item: CommandItem) => {
      item.onSelect();
      onOpenChange(false);
    },
    [onOpenChange]
  );

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (orderedItems.length === 0) return;
      setActiveIndex((prev) => (prev + 1) % orderedItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (orderedItems.length === 0) return;
      setActiveIndex((prev) => (prev - 1 + orderedItems.length) % orderedItems.length);
    } else if (e.key === 'Enter') {
      if (selectedItem) {
        e.preventDefault();
        runItem(selectedItem);
      }
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
          className="fixed z-50 left-1/2 top-[15%] sm:top-[20%] -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-[var(--bg-popover)] border border-[var(--border-subtle)] shadow-[var(--overlay-shadow)] overflow-hidden"
        >
          <DialogPrimitive.Title className="sr-only">Command Palette</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Cari fitur atau jalankan perintah cepat Finora.
          </DialogPrimitive.Description>

          <div className="flex items-center gap-2.5 px-3.5 h-12 border-b border-[var(--border-subtle)]">
            <Search className="w-4 h-4 text-[var(--text-secondary)] shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="Ketik perintah atau cari fitur..."
              role="combobox"
              aria-label="Cari perintah"
              aria-expanded={true}
              aria-controls="finora-command-list"
              aria-activedescendant={selectedItem ? `cmd-opt-${selectedItem.id}` : undefined}
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-2 py-0.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer shrink-0"
            >
              Esc
            </button>
          </div>

          <div
            id="finora-command-list"
            role="listbox"
            aria-label="Daftar perintah Finora"
            className="max-h-[55dvh] overflow-y-auto p-2 space-y-2"
          >
            {orderedItems.length === 0 ? (
              <div className="py-10 px-4 text-center text-sm text-[var(--text-secondary)]">
                Perintah tidak ditemukan untuk &ldquo;{query.trim()}&rdquo;.
              </div>
            ) : (
              groupedSections.map((section) => (
                <div key={section.group}>
                  <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    {section.group}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map(({ item, index }) => {
                      const Icon = item.icon;
                      const isSelected = index === activeIndex;
                      return (
                        <button
                          key={item.id}
                          id={`cmd-opt-${item.id}`}
                          ref={(node) => {
                            itemRefs.current[item.id] = node;
                          }}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => runItem(item)}
                          className={cn(
                            'w-full flex items-center justify-between gap-3 px-2.5 py-2.5 rounded-xl text-left text-sm transition-colors cursor-pointer',
                            isSelected
                              ? 'bg-emerald-500/15 text-[var(--accent-primary)] font-medium'
                              : 'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                          )}
                        >
                          <span className="flex items-center gap-3 min-w-0">
                            <Icon
                              className={cn(
                                'w-4 h-4 shrink-0',
                                isSelected
                                  ? 'text-[var(--accent-primary)]'
                                  : 'text-[var(--text-secondary)]'
                              )}
                              aria-hidden="true"
                            />
                            <span className="truncate">{item.label}</span>
                          </span>
                          {item.shortcut ? (
                            <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-secondary)] shrink-0">
                              {item.shortcut}
                            </kbd>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-3.5 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60 flex items-center justify-between gap-3 text-[11px] text-[var(--text-secondary)]">
            <div className="flex items-center gap-3">
              <span>↑↓ Navigasi</span>
              <span>↵ Pilih</span>
              <span>Esc Tutup</span>
            </div>
            <span className="hidden sm:inline">Finora Command</span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
