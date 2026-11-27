'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { cn } from '@/lib/cn';

const NAV_LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/features', label: 'Fitur' },
  { href: '/about', label: 'Tentang' },
  { href: '/privacy', label: 'Privasi' },
] as const;

export function PublicNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)]/70 bg-[var(--bg-canvas)]/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)] font-bold text-lg">
            F
          </div>
          <span className="text-base font-bold tracking-tight text-[var(--text-primary)]">
            Finora
          </span>
        </Link>

        {/* Center Floating Pill Nav (Desktop) */}
        <nav
          aria-label="Navigasi Publik"
          className="hidden md:flex items-center gap-1 rounded-full bg-[var(--bg-surface)]/90 border border-[var(--border-subtle)] p-1"
        >
          {NAV_LINKS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                  active
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-foreground)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Primary CTA */}
        <div className="flex items-center gap-2">
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 h-10 px-4 sm:px-5 rounded-full bg-[var(--accent-primary)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] font-semibold text-xs sm:text-sm transition-colors shadow-sm"
          >
            <span>Open My Finance</span>
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Nav */}
      {mobileOpen ? (
        <nav
          aria-label="Navigasi Publik Mobile"
          className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 space-y-1"
        >
          {NAV_LINKS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'block px-3.5 py-2.5 rounded-xl text-sm font-medium',
                  active
                    ? 'bg-emerald-500/15 text-[var(--accent-primary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}
