'use client';

import * as React from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  DatabaseBackup,
  Percent,
  PiggyBank,
  Plus,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { BudgetProgressCard } from '@/components/budgets/BudgetProgressCard';
import { CashflowMiniChart } from '@/components/dashboard/CashflowMiniChart';
import { useAppContext } from '@/components/providers/AppProviders';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorFallback } from '@/components/shared/ErrorFallback';
import { KpiSummaryCard } from '@/components/shared/KpiSummaryCard';
import { MoneyText } from '@/components/shared/MoneyText';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { db } from '@/db/database';
import { PAYMENT_METHOD_LABELS } from '@/domain/constants';
import {
  formatIndonesianDate,
  formatIndonesianMonth,
  getLocalMonth,
  shiftMonth,
} from '@/domain/dates';
import { getDashboardSummary, type DashboardSummary } from '@/services/dashboardService';
import { loadDemoData } from '@/services/demoDataService';

export default function DashboardPage() {
  const { bootstrapReady, isMasked, showToast } = useAppContext();
  const [selectedMonth, setSelectedMonth] = React.useState<string>(() => getLocalMonth());
  const [dismissBackupBanner, setDismissBackupBanner] = React.useState(false);
  const [loadingDemo, setLoadingDemo] = React.useState(false);

  const handleLoadDemo = async () => {
    setLoadingDemo(true);
    const res = await loadDemoData();
    setLoadingDemo(false);
    if (!res.ok) {
      showToast(res.error.message, 'error');
      return;
    }
    showToast('Data contoh berhasil dimuat! Jelajahi dashboard, anggaran, target, dan analitik.');
  };

  const queryState = useLiveQuery(async (): Promise<{
    ok: boolean;
    data?: DashboardSummary;
    errorMessage?: string;
  }> => {
    if (!bootstrapReady) return { ok: true };
    const res = await getDashboardSummary(selectedMonth);
    if (!res.ok) return { ok: false, errorMessage: res.error.message };
    return { ok: true, data: res.data };
  }, [bootstrapReady, selectedMonth]);

  // Subscribe reaktif ke perubahan tabel agar dashboard langsung segar
  useLiveQuery(
    () =>
      Promise.all([
        db.transactions.count(),
        db.budgets.count(),
        db.financialGoals.count(),
        db.categories.count(),
      ]),
    []
  );

  const loading = !bootstrapReady || queryState === undefined || (queryState.ok && !queryState.data);

  if (queryState && !queryState.ok) {
    return (
      <div className="flex justify-center py-10">
        <ErrorFallback
          title="Gagal Memuat Dashboard"
          description={queryState.errorMessage ?? 'Terjadi kesalahan membaca data lokal.'}
        />
      </div>
    );
  }

  const summary = queryState?.data;
  const isEmptyState = summary && summary.totalTransactionCount === 0;

  return (
    <div className="space-y-6">
      {/* Month Selector & Quick Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Bulan sebelumnya"
            onClick={() => setSelectedMonth((m) => shiftMonth(m, -1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="px-3 text-sm font-semibold text-[var(--text-primary)] min-w-[136px] text-center capitalize">
            {formatIndonesianMonth(selectedMonth)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Bulan berikutnya"
            onClick={() => setSelectedMonth((m) => shiftMonth(m, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Link
          href="/app/transactions/new"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-[var(--accent-primary)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] font-semibold text-sm transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Catat Transaksi
        </Link>
      </div>

      {/* FR-023: Backup Reminder Banner */}
      {summary?.shouldRemindBackup && !dismissBackupBanner ? (
        <div
          role="status"
          className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <DatabaseBackup
              className="w-5 h-5 text-[var(--accent-primary)] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Amankan data keuangan Anda dengan Backup JSON
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Seluruh data Finora tersimpan lokal di browser. Buat cadangan berkala untuk berjaga-jaga.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/app/settings/backup"
              className="h-9 px-3.5 rounded-lg bg-[var(--accent-primary)] text-[var(--accent-foreground)] text-xs font-semibold inline-flex items-center"
            >
              Backup Sekarang
            </Link>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDismissBackupBanner(true)}
            >
              Nanti
            </Button>
          </div>
        </div>
      ) : null}

      {/* Hero + KPI Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <Card className="lg:col-span-4 flex flex-col justify-between bg-[var(--bg-surface)]">
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-32 rounded bg-[var(--bg-elevated)]" />
              <div className="h-9 w-48 rounded bg-[var(--bg-elevated)]" />
              <div className="h-4 w-44 rounded bg-[var(--bg-elevated)]" />
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
                    Saldo Tersedia
                  </span>
                  <Badge tone="accent">Lokal</Badge>
                </div>
                <div className="mt-2">
                  <MoneyText
                    amount={summary?.availableBalance ?? 0}
                    variant="balance"
                    masked={isMasked}
                    size="hero"
                  />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>
                  Saldo Bersih:{' '}
                  <MoneyText
                    amount={summary?.netBalance ?? 0}
                    masked={isMasked}
                    size="sm"
                    className="font-semibold text-[var(--text-primary)]"
                  />
                </span>
                <span>
                  Teralokasi:{' '}
                  <MoneyText
                    amount={summary?.totalAllocatedSavings ?? 0}
                    masked={isMasked}
                    size="sm"
                    className="font-semibold text-[var(--accent-primary)]"
                  />
                </span>
              </div>
            </>
          )}
        </Card>

        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          <KpiSummaryCard
            title="Pemasukan Bulan Ini"
            amount={summary?.monthlyIncome ?? 0}
            subtitle={formatIndonesianMonth(selectedMonth)}
            icon={ArrowDownLeft}
            tone="income"
            masked={isMasked}
            loading={loading}
          />
          <KpiSummaryCard
            title="Pengeluaran Bulan Ini"
            amount={summary?.monthlyExpense ?? 0}
            subtitle={formatIndonesianMonth(selectedMonth)}
            icon={ArrowUpRight}
            tone="expense"
            masked={isMasked}
            loading={loading}
          />
          <div className="col-span-2 sm:col-span-1">
            <KpiSummaryCard
              title="Rasio Tabungan"
              formattedValue={
                summary?.savingsRatePct === null || summary?.savingsRatePct === undefined
                  ? '—'
                  : `${summary.savingsRatePct.toLocaleString('id-ID')}%`
              }
              subtitle={
                summary?.savingsRatePct === null
                  ? 'Belum ada pemasukan periode ini'
                  : 'Dari pemasukan bulan aktif'
              }
              icon={Percent}
              tone={
                summary?.savingsRatePct !== null && (summary?.savingsRatePct ?? 0) < 0
                  ? 'warning'
                  : 'accent'
              }
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Empty Welcome CTA if 0 transactions */}
      {isEmptyState ? (
        <div className="space-y-3">
          <EmptyState
            icon={Wallet}
            title="Mulai Catat Keuanganmu — 100% Lokal & Privat"
            description="Belum ada transaksi tercatat. Tambahkan pemasukan atau pengeluaran pertama Anda, atau pulihkan data dari berkas Backup JSON."
            actionLabel="+ Catat Transaksi Pertama"
            onAction={() => {
              window.location.href = '/app/transactions/new';
            }}
            secondaryActionLabel="Impor Backup JSON"
            onSecondaryAction={() => {
              window.location.href = '/app/settings/backup';
            }}
          />
          <Card className="bg-[var(--brand-subtle)] border-[var(--brand-soft)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--brand-soft)] text-[var(--accent-primary)] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Ingin langsung coba fitur Finora dengan data contoh?
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Isi otomatis transaksi 3 bulan terakhir, anggaran bulanan, target tabungan, dan jadwal berulang. Dapat dihapus kapan saja dari Pengaturan.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => void handleLoadDemo()}
              disabled={loadingDemo}
              className="shrink-0 bg-[var(--bg-surface)]"
            >
              <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" aria-hidden="true" />
              {loadingDemo ? 'Memuat...' : 'Muat Data Contoh (Demo)'}
            </Button>
          </Card>
        </div>
      ) : null}

      {/* Row 2: Chart + Budget Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <CashflowMiniChart
            data={summary?.cashflowTrend6Months ?? []}
            loading={loading}
            masked={isMasked}
          />
        </div>

        <Card className="lg:col-span-5 flex flex-col">
          <CardHeader>
            <div>
              <CardTitle>Status Anggaran Bulan Ini</CardTitle>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Kategori yang perlu perhatian ditampilkan paling atas
              </p>
            </div>
            <Link
              href="/app/budgets"
              className="text-xs font-semibold text-[var(--accent-primary)] hover:underline inline-flex items-center gap-1 shrink-0"
            >
              Kelola <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-24 rounded-xl bg-[var(--bg-elevated)]" />
              <div className="h-24 rounded-xl bg-[var(--bg-elevated)]" />
            </div>
          ) : summary && summary.budgetAlerts.length > 0 ? (
            <div className="space-y-3">
              {summary.budgetAlerts.slice(0, 3).map((b) => (
                <BudgetProgressCard key={b.id} budget={b} masked={isMasked} />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-3 rounded-xl border border-dashed border-[var(--border-subtle)]">
              <AlertTriangle className="w-7 h-7 text-[var(--text-muted)] mb-2" aria-hidden="true" />
              <p className="text-sm text-[var(--text-secondary)]">
                Belum ada anggaran ditetapkan untuk {formatIndonesianMonth(selectedMonth)}.
              </p>
              <Link
                href="/app/budgets"
                className="mt-3 text-xs font-semibold text-[var(--accent-primary)] hover:underline"
              >
                + Tetapkan Anggaran
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Row 3: Recent Transactions + Active Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7">
          <CardHeader>
            <div>
              <CardTitle>5 Transaksi Terbaru</CardTitle>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Aktivitas pemasukan & pengeluaran terakhir
              </p>
            </div>
            <Link
              href="/app/transactions"
              className="text-xs font-semibold text-[var(--accent-primary)] hover:underline inline-flex items-center gap-1 shrink-0"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-[var(--bg-elevated)]" />
              ))}
            </div>
          ) : summary && summary.recentTransactions.length > 0 ? (
            <ul className="divide-y divide-[var(--border-subtle)]">
              {summary.recentTransactions.map((tx) => (
                <li key={tx.id}>
                  <Link
                    href={`/app/transactions/${tx.id}/edit`}
                    className="flex items-center justify-between gap-3 py-3 px-2 -mx-2 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <CategoryBadge
                        name={tx.categoryName}
                        icon={tx.categoryIcon}
                        color={tx.categoryColor}
                        isArchived={tx.categoryArchived}
                        size="sm"
                      />
                      <p className="text-xs text-[var(--text-secondary)] mt-1 truncate pl-9">
                        {formatIndonesianDate(tx.date)} • {PAYMENT_METHOD_LABELS[tx.paymentMethod]}
                        {tx.note ? ` • ${tx.note}` : ''}
                      </p>
                    </div>
                    <MoneyText
                      amount={tx.amount}
                      variant={tx.type}
                      showSign
                      masked={isMasked}
                      className="font-semibold shrink-0"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--text-secondary)] py-6 text-center">
              Belum ada transaksi terbaru.
            </p>
          )}
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <div>
              <CardTitle>Target Keuangan Aktif</CardTitle>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Alokasi tabungan terpisah dari pengeluaran
              </p>
            </div>
            <Link
              href="/app/goals"
              className="text-xs font-semibold text-[var(--accent-primary)] hover:underline inline-flex items-center gap-1 shrink-0"
            >
              Kelola Target <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-20 rounded-xl bg-[var(--bg-elevated)]" />
              <div className="h-20 rounded-xl bg-[var(--bg-elevated)]" />
            </div>
          ) : summary && summary.activeGoals.length > 0 ? (
            <div className="space-y-3">
              {summary.activeGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {goal.name}
                    </span>
                    <span className="text-xs font-semibold tabular-nums text-[var(--accent-primary)]">
                      {goal.progressPct.toLocaleString('id-ID')}%
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`Progres target ${goal.name}`}
                    aria-valuenow={Math.round(goal.progressPct)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="w-full h-2 rounded-full bg-[var(--bg-surface)] overflow-hidden"
                  >
                    <div
                      className="h-full rounded-full bg-[var(--accent-graphic)]"
                      style={{ width: `${goal.progressPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <MoneyText amount={goal.currentAmount} masked={isMasked} size="sm" />
                    <span>
                      Target: <MoneyText amount={goal.targetAmount} masked={isMasked} size="sm" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-8 px-3 rounded-xl border border-dashed border-[var(--border-subtle)]">
              <PiggyBank className="w-7 h-7 text-[var(--text-muted)] mb-2" aria-hidden="true" />
              <p className="text-sm text-[var(--text-secondary)]">
                Belum ada target tabungan aktif.
              </p>
              <Link
                href="/app/goals"
                className="mt-3 text-xs font-semibold text-[var(--accent-primary)] hover:underline"
              >
                + Buat Target Keuangan
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
