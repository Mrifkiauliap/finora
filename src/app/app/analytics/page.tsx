'use client';

import * as React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProviders';
import { ChartContainerCard } from '@/components/shared/ChartContainerCard';
import { KpiSummaryCard } from '@/components/shared/KpiSummaryCard';
import { MoneyText } from '@/components/shared/MoneyText';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { db } from '@/db/database';
import {
  getLocalMonth,
  getLocalToday,
  getMonthDateBounds,
  shiftMonth,
} from '@/domain/dates';
import { formatCompactIdr, formatIdr } from '@/domain/money';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';
import { getAnalyticsReport } from '@/services/analyticsService';

type PresetPeriod = '1m' | '3m' | '6m' | 'ytd' | 'custom';

export default function AnalyticsPage() {
  const { bootstrapReady, resolvedTheme, isMasked } = useAppContext();
  const reducedMotion = usePrefersReducedMotion();

  const currentMonth = React.useMemo(() => getLocalMonth(), []);
  const [preset, setPreset] = React.useState<PresetPeriod>('6m');
  const [customStart, setCustomStart] = React.useState(
    () => getMonthDateBounds(shiftMonth(getLocalMonth(), -5)).startDate
  );
  const [customEnd, setCustomEnd] = React.useState(() => getLocalToday());

  const { startDate, endDate } = React.useMemo(() => {
    const today = getLocalToday();
    if (preset === '1m') {
      return getMonthDateBounds(currentMonth);
    }
    if (preset === '3m') {
      return {
        startDate: getMonthDateBounds(shiftMonth(currentMonth, -2)).startDate,
        endDate: getMonthDateBounds(currentMonth).endDate,
      };
    }
    if (preset === '6m') {
      return {
        startDate: getMonthDateBounds(shiftMonth(currentMonth, -5)).startDate,
        endDate: getMonthDateBounds(currentMonth).endDate,
      };
    }
    if (preset === 'ytd') {
      return {
        startDate: `${currentMonth.slice(0, 4)}-01-01`,
        endDate: today,
      };
    }
    return { startDate: customStart, endDate: customEnd };
  }, [preset, currentMonth, customStart, customEnd]);

  const txTrigger = useLiveQuery(() => db.transactions.count(), [], 0);

  const reportState = useLiveQuery(async () => {
    if (!bootstrapReady) return null;
    const res = await getAnalyticsReport({ startDate, endDate });
    return res;
  }, [bootstrapReady, startDate, endDate, txTrigger]);

  const loading = !bootstrapReady || reportState === undefined || reportState === null;
  const report = reportState && reportState.ok ? reportState.data : null;
  const errorMsg = reportState && !reportState.ok ? reportState.error.message : null;

  const seriesPalette =
    resolvedTheme === 'dark'
      ? ['#10B981', '#38BDF8', '#F59E0B', '#A78BFA', '#FB7185', '#2DD4BF']
      : ['#059669', '#0284C7', '#D97706', '#7C3AED', '#E11D48', '#0D9488'];

  const incomeColor = resolvedTheme === 'dark' ? '#10B981' : '#059669';
  const expenseColor = resolvedTheme === 'dark' ? '#FB7185' : '#E11D48';
  const gridColor = resolvedTheme === 'dark' ? '#263449' : '#E2E8F0';
  const tickColor = resolvedTheme === 'dark' ? '#94A3B8' : '#475569';

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-1 gap-1">
          {(
            [
              ['1m', 'Bulan Ini'],
              ['3m', '3 Bulan'],
              ['6m', '6 Bulan'],
              ['ytd', 'Tahun Ini'],
              ['custom', 'Kustom'],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setPreset(val)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium cursor-pointer',
                preset === val
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-foreground)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {preset === 'custom' ? (
          <div className="flex flex-wrap items-center gap-2">
            <Input
              aria-label="Tanggal mulai analitik"
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-auto"
            />
            <span className="text-xs text-[var(--text-secondary)]">s.d.</span>
            <Input
              aria-label="Tanggal akhir analitik"
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-auto"
            />
          </div>
        ) : null}
      </div>

      {errorMsg ? (
        <div
          role="alert"
          className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-[var(--status-danger-text)]"
        >
          {errorMsg}
        </div>
      ) : null}

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiSummaryCard
          title="Total Pemasukan Periode"
          amount={report?.currentSummary.totalIncome ?? 0}
          icon={TrendingUp}
          tone="income"
          masked={isMasked}
          loading={loading}
        />
        <KpiSummaryCard
          title="Total Pengeluaran Periode"
          amount={report?.currentSummary.totalExpense ?? 0}
          icon={TrendingDown}
          tone="expense"
          masked={isMasked}
          loading={loading}
        />
        <KpiSummaryCard
          title="Arus Kas Bersih Periode"
          amount={report?.currentSummary.netCashflow ?? 0}
          subtitle={
            report?.currentSummary.savingsRatePct === null ||
            report?.currentSummary.savingsRatePct === undefined
              ? 'Rasio tabungan: —'
              : `Rasio tabungan: ${report.currentSummary.savingsRatePct.toLocaleString('id-ID')}%`
          }
          icon={Lightbulb}
          tone="accent"
          masked={isMasked}
          loading={loading}
        />
      </div>

      {/* Deterministic Local Insights */}
      {report && report.insights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {report.insights.map((ins) => (
            <Card key={ins.id} className="p-4 flex items-start gap-3">
              <div
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                  ins.tone === 'positive'
                    ? 'bg-emerald-500/15 text-[var(--status-success)]'
                    : ins.tone === 'warning'
                      ? 'bg-amber-500/15 text-[var(--status-warning)]'
                      : ins.tone === 'danger'
                        ? 'bg-red-500/15 text-[var(--status-danger-text)]'
                        : 'bg-[var(--bg-elevated)] text-[var(--accent-primary)]'
                )}
              >
                {ins.tone === 'positive' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : ins.tone === 'warning' || ins.tone === 'danger' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Lightbulb className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">{ins.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{ins.description}</p>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainerCard
          title="Tren Pemasukan vs Pengeluaran"
          subtitle="Agregasi bulanan pada rentang terpilih"
          loading={loading}
          isEmpty={!report || report.transactionCount === 0}
          heightClass="h-[280px] sm:h-[320px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={report?.monthlySeries ?? []}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
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
                tickFormatter={(v: number) => (isMasked ? '•••' : formatCompactIdr(v))}
              />
              <Tooltip
                cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  return (
                    <div className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-3.5 py-2.5 text-xs shadow-[var(--overlay-shadow)] space-y-1">
                      <p className="font-semibold text-[var(--text-primary)]">{label}</p>
                      {payload.map((entry) => (
                        <p key={String(entry.dataKey)} className="flex justify-between gap-4 tabular-nums">
                          <span className="text-[var(--text-secondary)]">
                            {entry.dataKey === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                          </span>
                          <span className="font-semibold text-[var(--text-primary)]">
                            {isMasked ? 'Rp •••••••' : formatIdr(Number(entry.value ?? 0))}
                          </span>
                        </p>
                      ))}
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="income"
                fill={incomeColor}
                radius={[6, 6, 0, 0]}
                isAnimationActive={!reducedMotion}
              />
              <Bar
                dataKey="expense"
                fill={expenseColor}
                radius={[6, 6, 0, 0]}
                isAnimationActive={!reducedMotion}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainerCard>

        <ChartContainerCard
          title="Komposisi Pengeluaran per Kategori"
          subtitle="Proporsi pos pengeluaran periode terpilih"
          loading={loading}
          isEmpty={!report || report.expenseByCategory.length === 0}
          emptyMessage="Belum ada pengeluaran pada rentang ini."
          heightClass="h-[280px] sm:h-[320px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={report?.expenseByCategory ?? []}
                dataKey="amount"
                nameKey="categoryName"
                innerRadius="55%"
                outerRadius="82%"
                paddingAngle={2}
                isAnimationActive={!reducedMotion}
              >
                {(report?.expenseByCategory ?? []).map((entry, idx) => (
                  <Cell
                    key={entry.categoryId}
                    fill={seriesPalette[idx % seriesPalette.length] ?? entry.color}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const item = payload[0]?.payload as {
                    categoryName: string;
                    amount: number;
                    percentage: number;
                  };
                  return (
                    <div className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-3.5 py-2.5 text-xs shadow-[var(--overlay-shadow)]">
                      <p className="font-semibold text-[var(--text-primary)]">{item.categoryName}</p>
                      <p className="tabular-nums text-[var(--text-secondary)] mt-0.5">
                        {isMasked ? 'Rp •••••••' : formatIdr(item.amount)} (
                        {item.percentage.toLocaleString('id-ID')}%)
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainerCard>
      </div>

      {/* Category Breakdown Table */}
      {report && report.expenseByCategory.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Rincian Pengeluaran per Kategori</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                  <th className="py-2.5 pr-4">Kategori</th>
                  <th className="py-2.5 px-4 text-right">Persentase</th>
                  <th className="py-2.5 pl-4 text-right">Total Pengeluaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {report.expenseByCategory.map((item, idx) => (
                  <tr key={item.categoryId}>
                    <td className="py-3 pr-4 flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            seriesPalette[idx % seriesPalette.length] ?? item.color,
                        }}
                      />
                      <span className="font-medium text-[var(--text-primary)]">
                        {item.categoryName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-[var(--text-secondary)]">
                      {item.percentage.toLocaleString('id-ID')}%
                    </td>
                    <td className="py-3 pl-4 text-right font-semibold">
                      <MoneyText amount={item.amount} variant="expense" masked={isMasked} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
