'use client';

import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { MoneyText } from './MoneyText';
import { cn } from '@/lib/cn';

export function KpiSummaryCard({
  title,
  amount,
  formattedValue,
  subtitle,
  icon: Icon,
  tone = 'default',
  masked = false,
  loading = false,
}: {
  title: string;
  amount?: number;
  formattedValue?: string;
  subtitle?: string;
  icon: LucideIcon;
  tone?: 'default' | 'accent' | 'income' | 'expense' | 'warning';
  masked?: boolean;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="h-4 w-28 rounded bg-[var(--bg-elevated)] mb-3" />
        <div className="h-7 w-40 rounded bg-[var(--bg-elevated)] mb-2" />
        <div className="h-3 w-32 rounded bg-[var(--bg-elevated)]" />
      </Card>
    );
  }

  const iconToneClass =
    tone === 'accent'
      ? 'text-[var(--accent-primary)] bg-emerald-500/15'
      : tone === 'income'
        ? 'text-[var(--status-success)] bg-green-500/15'
        : tone === 'expense'
          ? 'text-[var(--status-danger-text)] bg-red-500/15'
          : tone === 'warning'
            ? 'text-[var(--status-warning)] bg-amber-500/15'
            : 'text-[var(--text-secondary)] bg-[var(--bg-elevated)]';

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            {title}
          </p>
          <div className="mt-2">
            {amount !== undefined ? (
              <MoneyText
                amount={amount}
                variant={
                  tone === 'income'
                    ? 'income'
                    : tone === 'expense'
                      ? 'expense'
                      : 'balance'
                }
                masked={masked}
                size="lg"
                className="text-xl sm:text-2xl font-bold"
              />
            ) : (
              <span className="tabular-nums text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                {formattedValue ?? '—'}
              </span>
            )}
          </div>
          {subtitle ? (
            <p className="mt-1.5 text-xs text-[var(--text-secondary)] truncate">{subtitle}</p>
          ) : null}
        </div>
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            iconToneClass
          )}
        >
          <Icon className="w-5 h-5" aria-hidden="true" strokeWidth={1.75} />
        </div>
      </div>
    </Card>
  );
}
