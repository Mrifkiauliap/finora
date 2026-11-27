'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppContext } from '@/components/providers/AppProviders';
import { ChartContainerCard } from '@/components/shared/ChartContainerCard';
import { formatCompactIdr, formatIdr } from '@/domain/money';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { MonthlyCashflowPoint } from '@/services/dashboardService';

export function CashflowMiniChart({
  data,
  loading = false,
  masked = false,
}: {
  data: MonthlyCashflowPoint[];
  loading?: boolean;
  masked?: boolean;
}) {
  const { resolvedTheme } = useAppContext();
  const reducedMotion = usePrefersReducedMotion();

  const hasAnyValue = data.some((d) => d.income > 0 || d.expense > 0);
  const incomeColor = resolvedTheme === 'dark' ? '#10B981' : '#059669';
  const expenseColor = resolvedTheme === 'dark' ? '#FB7185' : '#E11D48';
  const gridColor = resolvedTheme === 'dark' ? '#263449' : '#E2E8F0';
  const tickColor = resolvedTheme === 'dark' ? '#94A3B8' : '#475569';

  return (
    <ChartContainerCard
      title="Tren Arus Kas (6 Bulan Terakhir)"
      subtitle="Perbandingan pemasukan dan pengeluaran bulanan"
      loading={loading}
      isEmpty={!hasAnyValue}
      emptyMessage="Catat transaksi pertama Anda untuk melihat grafik tren arus kas bulanan."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: tickColor, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: tickColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={68}
            tickFormatter={(v: number) => (masked ? '•••' : formatCompactIdr(v))}
          />
          <Tooltip
            cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
            content={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) return null;
              return (
                <div className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-3.5 py-2.5 text-xs shadow-[var(--overlay-shadow)] space-y-1">
                  <p className="font-semibold text-[var(--text-primary)]">{label}</p>
                  {payload.map((entry) => (
                    <p
                      key={String(entry.dataKey)}
                      className="flex items-center justify-between gap-4 tabular-nums"
                    >
                      <span className="text-[var(--text-secondary)]">
                        {entry.dataKey === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {masked ? 'Rp •••••••' : formatIdr(Number(entry.value ?? 0))}
                      </span>
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Bar
            dataKey="income"
            name="Pemasukan"
            fill={incomeColor}
            radius={[6, 6, 0, 0]}
            isAnimationActive={!reducedMotion}
          />
          <Bar
            dataKey="expense"
            name="Pengeluaran"
            fill={expenseColor}
            radius={[6, 6, 0, 0]}
            isAnimationActive={!reducedMotion}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainerCard>
  );
}
