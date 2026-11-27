'use client';

import * as React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronLeft, ChevronRight, Copy, PieChart, Plus } from 'lucide-react';
import { BudgetProgressCard } from '@/components/budgets/BudgetProgressCard';
import { useAppContext } from '@/components/providers/AppProviders';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { EmptyState } from '@/components/shared/EmptyState';
import { KpiSummaryCard } from '@/components/shared/KpiSummaryCard';
import { MoneyText } from '@/components/shared/MoneyText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { Input, NativeSelect } from '@/components/ui/Input';
import { db } from '@/db/database';
import type { BudgetEvaluationView, TransactionView } from '@/db/types';
import {
  formatIndonesianDate,
  formatIndonesianMonth,
  getLocalMonth,
  getMonthDateBounds,
  shiftMonth,
} from '@/domain/dates';
import {
  copyBudgetsFromPreviousMonth,
  deleteBudget,
  listMonthlyBudgets,
  upsertBudget,
  type MonthlyBudgetSummary,
} from '@/services/budgetService';
import { queryTransactions } from '@/services/transactionService';

export default function BudgetsPage() {
  const { bootstrapReady, settings, isMasked, showToast } = useAppContext();
  const [selectedMonth, setSelectedMonth] = React.useState(() => getLocalMonth());

  // Upsert Modal
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingBudget, setEditingBudget] = React.useState<BudgetEvaluationView | null>(null);
  const [categoryId, setCategoryId] = React.useState('');
  const [limitAmount, setLimitAmount] = React.useState<number | null>(null);
  const [thresholdPct, setThresholdPct] = React.useState<number>(80);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  // Inspect transactions modal
  const [inspectBudget, setInspectBudget] = React.useState<BudgetEvaluationView | null>(null);
  const [inspectTxs, setInspectTxs] = React.useState<TransactionView[]>([]);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = React.useState<BudgetEvaluationView | null>(null);

  const txTrigger = useLiveQuery(() => db.transactions.count(), [], 0);
  const budgetTrigger = useLiveQuery(() => db.budgets.count(), [], 0);
  const allCategories = useLiveQuery(() => db.categories.toArray(), [], []);

  const summaryState = useLiveQuery(async (): Promise<MonthlyBudgetSummary | null> => {
    if (!bootstrapReady) return null;
    const res = await listMonthlyBudgets(selectedMonth);
    return res.ok ? res.data : null;
  }, [bootstrapReady, selectedMonth, txTrigger, budgetTrigger]);

  const expenseCategories = React.useMemo(
    () =>
      allCategories
        .filter((c) => c.type === 'expense' && !c.isArchived)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [allCategories]
  );

  const budgetedCategoryIds = React.useMemo(
    () => new Set((summaryState?.budgets ?? []).map((b) => b.categoryId)),
    [summaryState?.budgets]
  );

  const availableCategoriesForNew = React.useMemo(
    () => expenseCategories.filter((c) => !budgetedCategoryIds.has(c.id)),
    [expenseCategories, budgetedCategoryIds]
  );

  const openCreateModal = () => {
    setEditingBudget(null);
    setCategoryId(availableCategoriesForNew[0]?.id ?? '');
    setLimitAmount(null);
    setThresholdPct(settings?.defaultWarningThresholdPct ?? 80);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (b: BudgetEvaluationView) => {
    setEditingBudget(b);
    setCategoryId(b.categoryId);
    setLimitAmount(b.limitAmount);
    setThresholdPct(b.warningThresholdPct);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!categoryId) {
      setFormError('Pilih kategori pengeluaran.');
      return;
    }
    if (!limitAmount || limitAmount <= 0) {
      setFormError('Batas anggaran harus lebih dari Rp 0.');
      return;
    }

    setSaving(true);
    const res = await upsertBudget({
      categoryId,
      month: selectedMonth,
      limitAmount,
      warningThresholdPct: thresholdPct,
    });
    setSaving(false);

    if (!res.ok) {
      setFormError(res.error.message);
      return;
    }
    setModalOpen(false);
    showToast('Anggaran bulanan berhasil disimpan.');
  };

  const handleCopyPrevMonth = async () => {
    const res = await copyBudgetsFromPreviousMonth(selectedMonth);
    if (!res.ok) {
      showToast(res.error.message, 'error');
      return;
    }
    if (res.data.copiedCount === 0) {
      showToast('Tidak ada anggaran baru yang dapat disalin dari bulan sebelumnya.', 'info');
    } else {
      showToast(
        `${res.data.copiedCount} anggaran disalin (${res.data.skippedCount} dilewati).`
      );
    }
  };

  const handleInspect = async (b: BudgetEvaluationView) => {
    setInspectBudget(b);
    const bounds = getMonthDateBounds(selectedMonth);
    const res = await queryTransactions({
      startDate: bounds.startDate,
      endDate: bounds.endDate,
      type: 'expense',
      categoryId: b.categoryId,
    });
    setInspectTxs(res.ok ? res.data.items : []);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const res = await deleteBudget(deleteTarget.id);
    setDeleteTarget(null);
    if (!res.ok) {
      showToast(res.error.message, 'error');
      return;
    }
    showToast('Anggaran berhasil dihapus.');
  };

  const loading = !bootstrapReady || summaryState === undefined;

  return (
    <div className="space-y-6">
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
          <span className="px-3 text-sm font-semibold min-w-[136px] text-center capitalize">
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

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => void handleCopyPrevMonth()}>
            <Copy className="w-4 h-4" />
            Salin Bulan Lalu
          </Button>
          <Button
            onClick={openCreateModal}
            disabled={availableCategoriesForNew.length === 0}
          >
            <Plus className="w-4 h-4" />
            Tambah Anggaran
          </Button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiSummaryCard
          title="Total Dianggarkan"
          amount={summaryState?.totalLimit ?? 0}
          icon={PieChart}
          masked={isMasked}
          loading={loading}
        />
        <KpiSummaryCard
          title="Terpakai (Kategori Beranggaran)"
          amount={summaryState?.totalSpentOnBudgeted ?? 0}
          icon={PieChart}
          tone="expense"
          masked={isMasked}
          loading={loading}
        />
        <KpiSummaryCard
          title="Sisa Total Anggaran"
          amount={summaryState?.totalRemaining ?? 0}
          icon={PieChart}
          tone={(summaryState?.totalRemaining ?? 0) < 0 ? 'warning' : 'accent'}
          masked={isMasked}
          loading={loading}
        />
      </div>

      {/* Budgets Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          <Card className="h-44" />
          <Card className="h-44" />
        </div>
      ) : !summaryState || summaryState.budgets.length === 0 ? (
        <EmptyState
          icon={PieChart}
          title={`Belum ada anggaran untuk ${formatIndonesianMonth(selectedMonth)}`}
          description="Tetapkan batas pengeluaran per kategori agar Finora dapat memberi peringatan dini sebelum pengeluaran Anda melampaui batas."
          actionLabel="+ Tambah Anggaran"
          onAction={openCreateModal}
          secondaryActionLabel="Salin dari Bulan Lalu"
          onSecondaryAction={() => void handleCopyPrevMonth()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summaryState.budgets.map((b) => (
            <BudgetProgressCard
              key={b.id}
              budget={b}
              masked={isMasked}
              onEdit={() => openEditModal(b)}
              onDelete={() => setDeleteTarget(b)}
              onInspectTransactions={() => void handleInspect(b)}
            />
          ))}
        </div>
      )}

      {/* Upsert Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          title={editingBudget ? `Ubah Anggaran ${editingBudget.categoryName}` : 'Tambah Anggaran Bulanan'}
          description={`Periode: ${formatIndonesianMonth(selectedMonth)}`}
        >
          <form onSubmit={(e) => void handleSaveBudget(e)} className="space-y-4">
            {formError ? (
              <div
                role="alert"
                className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-[var(--status-danger-text)]"
              >
                {formError}
              </div>
            ) : null}

            {!editingBudget ? (
              <div className="space-y-1.5">
                <label htmlFor="bdg-cat" className="block text-sm font-medium text-[var(--text-primary)]">
                  Kategori Pengeluaran
                </label>
                <NativeSelect
                  id="bdg-cat"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  {availableCategoriesForNew.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            ) : null}

            <CurrencyInput
              id="bdg-limit"
              label="Batas Pengeluaran Bulanan (IDR)"
              value={limitAmount}
              onChange={setLimitAmount}
              required
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="bdg-thresh" className="text-sm font-medium text-[var(--text-primary)]">
                  Ambang Peringatan (%)
                </label>
                <span className="text-sm font-semibold tabular-nums text-[var(--accent-primary)]">
                  {thresholdPct}%
                </span>
              </div>
              <Input
                id="bdg-thresh"
                type="number"
                min={50}
                max={95}
                value={thresholdPct}
                onChange={(e) => setThresholdPct(Number(e.target.value))}
              />
              <p className="text-xs text-[var(--text-secondary)]">
                Rentang valid 50% hingga 95% (default 80%).
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Anggaran'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Inspect Transactions Modal */}
      <Dialog
        open={Boolean(inspectBudget)}
        onOpenChange={(open) => !open && setInspectBudget(null)}
      >
        <DialogContent
          title={`Pengeluaran: ${inspectBudget?.categoryName ?? ''}`}
          description={formatIndonesianMonth(selectedMonth)}
        >
          {inspectTxs.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] py-4 text-center">
              Belum ada transaksi pengeluaran pada kategori dan bulan ini.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border-subtle)] max-h-80 overflow-y-auto">
              {inspectTxs.map((tx) => (
                <li key={tx.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-[var(--text-primary)] truncate">{tx.note || 'Tanpa catatan'}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {formatIndonesianDate(tx.date)}
                    </p>
                  </div>
                  <MoneyText amount={tx.amount} variant="expense" masked={isMasked} className="font-semibold shrink-0" />
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Anggaran?"
        description={`Anggaran untuk kategori "${deleteTarget?.categoryName ?? ''}" pada ${formatIndonesianMonth(selectedMonth)} akan dihapus. Transaksi Anda tetap aman.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
