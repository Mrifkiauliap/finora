'use client';

import * as React from 'react';
import { BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

export function ChartContainerCard({
  title,
  subtitle,
  actions,
  loading = false,
  isEmpty = false,
  emptyMessage = 'Belum ada data untuk ditampilkan pada periode ini.',
  heightClass = 'h-[260px] sm:h-[300px]',
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  loading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  heightClass?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {subtitle ? (
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
          ) : null}
        </div>
        {actions}
      </CardHeader>
      <div className={`w-full ${heightClass}`}>
        {loading ? (
          <div className="w-full h-full rounded-xl bg-[var(--bg-elevated)] animate-pulse" />
        ) : isEmpty ? (
          <div className="w-full h-full rounded-xl border border-dashed border-[var(--border-subtle)] flex flex-col items-center justify-center text-center px-4">
            <BarChart3 className="w-8 h-8 text-[var(--text-muted)] mb-2" aria-hidden="true" />
            <p className="text-sm text-[var(--text-secondary)]">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </Card>
  );
}
