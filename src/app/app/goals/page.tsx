'use client';

import * as React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  Info,
  Pencil,
  PiggyBank,
  Plus,
  Target,
  Trash2,
} from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProviders';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { EmptyState } from '@/components/shared/EmptyState';
import { KpiSummaryCard } from '@/components/shared/KpiSummaryCard';
import { MoneyText } from '@/components/shared/MoneyText';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { Input, NativeSelect, Textarea } from '@/components/ui/Input';
import { db } from '@/db/database';
import type { GoalContributionRecord, GoalStatus, GoalView } from '@/db/types';
import { CATEGORY_COLORS, CATEGORY_ICONS, type CategoryIconKey } from '@/domain/constants';
import { formatIndonesianDate, getLocalMonth, getLocalToday } from '@/domain/dates';
import { cn } from '@/lib/cn';
import { getDashboardSummary } from '@/services/dashboardService';
import {
  createGoal,
  deleteGoal,
  listGoalContributions,
  listGoals,
  recordGoalContribution,
  updateGoal,
} from '@/services/goalService';

export default function GoalsPage() {
  const { bootstrapReady, isMasked, showToast } = useAppContext();
  const [statusFilter, setStatusFilter] = React.useState<'all' | GoalStatus>('all');

  // Create / Edit Goal modal
  const [goalModalOpen, setGoalModalOpen] = React.useState(false);
  const [editingGoal, setEditingGoal] = React.useState<GoalView | null>(null);
  const [gName, setGName] = React.useState('');
  const [gTarget, setGTarget] = React.useState<number | null>(null);
  const [gDeadline, setGDeadline] = React.useState('');
  const [gIcon, setGIcon] = React.useState<CategoryIconKey>('target');
  const [gColor, setGColor] = React.useState<string>(CATEGORY_COLORS[0]);
  const [gNote, setGNote] = React.useState('');
  const [gStatus, setGStatus] = React.useState<GoalStatus>('active');
  const [goalFormErr, setGoalFormErr] = React.useState<string | null>(null);
  const [savingGoal, setSavingGoal] = React.useState(false);

  // Contribution modal
  const [contribGoal, setContribGoal] = React.useState<GoalView | null>(null);
  const [contribMode, setContribMode] = React.useState<'deposit' | 'withdraw'>('deposit');
  const [cAmount, setCAmount] = React.useState<number | null>(null);
  const [cDate, setCDate] = React.useState(getLocalToday());
  const [cNote, setCNote] = React.useState('');
  const [contribErr, setContribErr] = React.useState<string | null>(null);
  const [savingContrib, setSavingContrib] = React.useState(false);

  // History modal
  const [historyGoal, setHistoryGoal] = React.useState<GoalView | null>(null);
  const [historyRows, setHistoryRows] = React.useState<GoalContributionRecord[]>([]);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = React.useState<GoalView | null>(null);

  const txTrigger = useLiveQuery(() => db.transactions.count(), [], 0);
  const goalTrigger = useLiveQuery(() => db.financialGoals.count(), [], 0);
  const contribTrigger = useLiveQuery(() => db.goalContributions.count(), [], 0);

  const goalsState = useLiveQuery(async () => {
    if (!bootstrapReady) return null;
    const [goalsRes, dashRes] = await Promise.all([
      listGoals(),
      getDashboardSummary(getLocalMonth()),
    ]);
    return {
      goals: goalsRes.ok ? goalsRes.data : [],
      availableBalance: dashRes.ok ? dashRes.data.availableBalance : 0,
      totalAllocated: dashRes.ok ? dashRes.data.totalAllocatedSavings : 0,
    };
  }, [bootstrapReady, txTrigger, goalTrigger, contribTrigger]);

  const filteredGoals = React.useMemo(() => {
    const list = goalsState?.goals ?? [];
    if (statusFilter === 'all') return list;
    return list.filter((g) => g.status === statusFilter);
  }, [goalsState?.goals, statusFilter]);

  const openCreate = () => {
    setEditingGoal(null);
    setGName('');
    setGTarget(null);
    setGDeadline('');
    setGIcon('target');
    setGColor(CATEGORY_COLORS[0]);
    setGNote('');
    setGStatus('active');
    setGoalFormErr(null);
    setGoalModalOpen(true);
  };

  const openEdit = (g: GoalView) => {
    setEditingGoal(g);
    setGName(g.name);
    setGTarget(g.targetAmount);
    setGDeadline(g.deadline ?? '');
    setGIcon((CATEGORY_ICONS.includes(g.icon as CategoryIconKey) ? g.icon : 'target') as CategoryIconKey);
    setGColor(g.color);
    setGNote(g.note);
    setGStatus(g.status);
    setGoalFormErr(null);
    setGoalModalOpen(true);
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoalFormErr(null);
    if (!gTarget || gTarget <= 0) {
      setGoalFormErr('Target nominal harus lebih dari Rp 0.');
      return;
    }

    setSavingGoal(true);
    const payload = {
      name: gName,
      targetAmount: gTarget,
      deadline: gDeadline ? gDeadline : null,
      icon: gIcon,
      color: gColor,
      note: gNote,
    };

    const res = editingGoal
      ? await updateGoal(editingGoal.id, { ...payload, status: gStatus })
      : await createGoal(payload);

    setSavingGoal(false);
    if (!res.ok) {
      setGoalFormErr(res.error.message);
      return;
    }

    setGoalModalOpen(false);
    showToast(editingGoal ? 'Target berhasil diperbarui.' : 'Target keuangan baru dibuat.');
  };

  const openContribute = (g: GoalView, mode: 'deposit' | 'withdraw') => {
    setContribGoal(g);
    setContribMode(mode);
    setCAmount(null);
    setCDate(getLocalToday());
    setCNote('');
    setContribErr(null);
  };

  const handleSaveContrib = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contribGoal) return;
    setContribErr(null);
    if (!cAmount || cAmount <= 0) {
      setContribErr('Nominal harus lebih dari Rp 0.');
      return;
    }

    setSavingContrib(true);
    const signedAmount = contribMode === 'deposit' ? cAmount : -cAmount;
    const res = await recordGoalContribution({
      goalId: contribGoal.id,
      amount: signedAmount,
      date: cDate,
      note: cNote,
    });
    setSavingContrib(false);

    if (!res.ok) {
      setContribErr(res.error.message);
      return;
    }
    setContribGoal(null);
    showToast(
      contribMode === 'deposit'
        ? 'Setoran alokasi target dicatat.'
        : 'Penarikan alokasi target dicatat.'
    );
  };

  const openHistory = async (g: GoalView) => {
    setHistoryGoal(g);
    const res = await listGoalContributions(g.id);
    setHistoryRows(res.ok ? res.data : []);
  };

  const handleDeleteGoal = async () => {
    if (!deleteTarget) return;
    const res = await deleteGoal(deleteTarget.id);
    setDeleteTarget(null);
    if (!res.ok) {
      showToast(res.error.message, 'error');
      return;
    }
    showToast('Target keuangan dihapus dan dana alokasi dilepas ke Saldo Tersedia.');
  };

  const loading = !bootstrapReady || goalsState === undefined;

  return (
    <div className="space-y-6">
      {/* Info Banner Anti-Double Counting */}
      <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-[var(--accent-primary)] shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          Setoran ke target tabungan dicatat sebagai <strong className="text-[var(--text-primary)]">alokasi dana (earmark)</strong>. Hal ini mengurangi <strong className="text-[var(--text-primary)]">Saldo Tersedia</strong> tanpa menggelembungkan total pengeluaran bulanan Anda.
        </p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiSummaryCard
          title="Total Dana Teralokasi"
          amount={goalsState?.totalAllocated ?? 0}
          icon={PiggyBank}
          tone="accent"
          masked={isMasked}
          loading={loading}
        />
        <KpiSummaryCard
          title="Saldo Tersedia Bebas Pakai"
          amount={goalsState?.availableBalance ?? 0}
          icon={Target}
          masked={isMasked}
          loading={loading}
        />
        <KpiSummaryCard
          title="Target Aktif"
          formattedValue={String(
            (goalsState?.goals ?? []).filter((g) => g.status === 'active').length
          )}
          subtitle={`Total ${(goalsState?.goals ?? []).length} target`}
          icon={Target}
          loading={loading}
        />
      </div>

      {/* Filter & CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-1 gap-1">
          {(
            [
              ['all', 'Semua'],
              ['active', 'Aktif'],
              ['completed', 'Tercapai'],
              ['paused', 'Dijeda'],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setStatusFilter(val)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition-colors',
                statusFilter === val
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-foreground)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Buat Target
        </Button>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          <Card className="h-56" />
          <Card className="h-56" />
        </div>
      ) : filteredGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Belum ada target keuangan"
          description="Buat target dana darurat, liburan, atau pembelian impian dan pantau progres bulanannya."
          actionLabel="+ Buat Target Pertama"
          onAction={openCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((goal) => (
            <Card key={goal.id} className="flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center border shrink-0"
                      style={{
                        backgroundColor: `${goal.color}20`,
                        borderColor: `${goal.color}40`,
                        color: goal.color,
                      }}
                    >
                      <CategoryIcon name={goal.icon} className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-[var(--text-primary)] truncate">
                        {goal.name}
                      </h3>
                      {goal.deadline ? (
                        <p className="text-xs text-[var(--text-secondary)]">
                          Tenggat: {formatIndonesianDate(goal.deadline)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge
                      tone={
                        goal.status === 'completed'
                          ? 'accent'
                          : goal.status === 'paused'
                            ? 'neutral'
                            : 'success'
                      }
                    >
                      {goal.status === 'completed'
                        ? 'Tercapai'
                        : goal.status === 'paused'
                          ? 'Dijeda'
                          : 'Aktif'}
                    </Badge>
                    {goal.isOverdue ? <Badge tone="danger">Melewati Tenggat</Badge> : null}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-baseline justify-between text-sm">
                    <MoneyText
                      amount={goal.currentAmount}
                      masked={isMasked}
                      className="font-bold text-[var(--text-primary)]"
                    />
                    <span className="tabular-nums font-semibold text-[var(--accent-primary)]">
                      {goal.progressPct.toLocaleString('id-ID')}%
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`Progres target ${goal.name}`}
                    aria-valuenow={Math.round(goal.progressPct)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="w-full h-2.5 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] overflow-hidden"
                  >
                    <div
                      className="h-full rounded-full bg-[var(--accent-graphic)] transition-all"
                      style={{ width: `${goal.progressPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span>
                      Target: <MoneyText amount={goal.targetAmount} masked={isMasked} size="sm" />
                    </span>
                    <span>
                      Sisa: <MoneyText amount={goal.remainingTarget} masked={isMasked} size="sm" />
                    </span>
                  </div>
                  {goal.requiredMonthlySaving !== null ? (
                    <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-canvas)] rounded-lg px-2.5 py-1.5 border border-[var(--border-subtle)]">
                      Estimasi sisihan:{' '}
                      <MoneyText
                        amount={goal.requiredMonthlySaving}
                        masked={isMasked}
                        size="sm"
                        className="font-semibold text-[var(--text-primary)]"
                      />
                      /bulan ({goal.remainingMonths} bln)
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" onClick={() => openContribute(goal, 'deposit')}>
                    <ArrowUpCircle className="w-3.5 h-3.5" />
                    Setor
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={goal.currentAmount <= 0}
                    onClick={() => openContribute(goal, 'withdraw')}
                  >
                    <ArrowDownCircle className="w-3.5 h-3.5" />
                    Tarik
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <Button size="sm" variant="ghost" onClick={() => void openHistory(goal)}>
                    <History className="w-3.5 h-3.5" />
                    Riwayat
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Ubah target ${goal.name}`}
                      onClick={() => openEdit(goal)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Hapus target ${goal.name}`}
                      onClick={() => setDeleteTarget(goal)}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[var(--status-danger-text)]" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Goal Create / Edit Modal */}
      <Dialog open={goalModalOpen} onOpenChange={setGoalModalOpen}>
        <DialogContent title={editingGoal ? 'Ubah Target Keuangan' : 'Buat Target Keuangan'}>
          <form onSubmit={(e) => void handleSaveGoal(e)} className="space-y-4">
            {goalFormErr ? (
              <div
                role="alert"
                className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-[var(--status-danger-text)]"
              >
                {goalFormErr}
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label htmlFor="goal-name" className="block text-sm font-medium text-[var(--text-primary)]">
                Nama Target
              </label>
              <Input
                id="goal-name"
                maxLength={80}
                value={gName}
                onChange={(e) => setGName(e.target.value)}
                placeholder="Contoh: Dana Darurat 6 Bulan"
                required
              />
            </div>

            <CurrencyInput
              id="goal-target"
              label="Nominal Target (IDR)"
              value={gTarget}
              onChange={setGTarget}
              required
            />

            <div className="space-y-1.5">
              <label htmlFor="goal-deadline" className="block text-sm font-medium text-[var(--text-primary)]">
                Tenggat Waktu (Opsional)
              </label>
              <Input
                id="goal-deadline"
                type="date"
                value={gDeadline}
                onChange={(e) => setGDeadline(e.target.value)}
              />
            </div>

            {editingGoal ? (
              <div className="space-y-1.5">
                <label htmlFor="goal-status" className="block text-sm font-medium text-[var(--text-primary)]">
                  Status Target
                </label>
                <NativeSelect
                  id="goal-status"
                  value={gStatus}
                  onChange={(e) => setGStatus(e.target.value as GoalStatus)}
                >
                  <option value="active">Aktif</option>
                  <option value="paused">Dijeda</option>
                  <option value="completed">Tercapai</option>
                </NativeSelect>
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label htmlFor="goal-note" className="block text-sm font-medium text-[var(--text-primary)]">
                Catatan (Opsional)
              </label>
              <Textarea
                id="goal-note"
                rows={2}
                maxLength={500}
                value={gNote}
                onChange={(e) => setGNote(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setGoalModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={savingGoal}>
                {savingGoal ? 'Menyimpan...' : 'Simpan Target'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contribution Modal */}
      <Dialog
        open={Boolean(contribGoal)}
        onOpenChange={(open) => !open && setContribGoal(null)}
      >
        <DialogContent
          title={
            contribMode === 'deposit'
              ? `Setor ke "${contribGoal?.name ?? ''}"`
              : `Tarik dari "${contribGoal?.name ?? ''}"`
          }
          description={
            contribGoal
              ? `Saldo target saat ini: ${isMasked ? 'Rp •••••••' : `Rp ${contribGoal.currentAmount.toLocaleString('id-ID')}`}`
              : ''
          }
        >
          <form onSubmit={(e) => void handleSaveContrib(e)} className="space-y-4">
            {contribErr ? (
              <div
                role="alert"
                className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-[var(--status-danger-text)]"
              >
                {contribErr}
              </div>
            ) : null}

            <CurrencyInput
              id="contrib-amount"
              label={contribMode === 'deposit' ? 'Nominal Setoran' : 'Nominal Penarikan'}
              value={cAmount}
              onChange={setCAmount}
              required
            />

            <div className="space-y-1.5">
              <label htmlFor="contrib-date" className="block text-sm font-medium text-[var(--text-primary)]">
                Tanggal
              </label>
              <Input
                id="contrib-date"
                type="date"
                value={cDate}
                onChange={(e) => setCDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contrib-note" className="block text-sm font-medium text-[var(--text-primary)]">
                Catatan (Opsional)
              </label>
              <Input
                id="contrib-note"
                maxLength={250}
                value={cNote}
                onChange={(e) => setCNote(e.target.value)}
                placeholder="Contoh: Sisihan gaji bulan ini"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setContribGoal(null)}>
                Batal
              </Button>
              <Button type="submit" disabled={savingContrib}>
                {savingContrib ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contribution History Modal */}
      <Dialog
        open={Boolean(historyGoal)}
        onOpenChange={(open) => !open && setHistoryGoal(null)}
      >
        <DialogContent title={`Riwayat Alokasi: ${historyGoal?.name ?? ''}`}>
          {historyRows.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] py-4 text-center">
              Belum ada riwayat setoran atau penarikan pada target ini.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border-subtle)] max-h-80 overflow-y-auto">
              {historyRows.map((row) => (
                <li key={row.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-[var(--text-primary)] truncate">
                      {row.note || (row.amount > 0 ? 'Setoran alokasi' : 'Penarikan alokasi')}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {formatIndonesianDate(row.date)}
                    </p>
                  </div>
                  <MoneyText
                    amount={Math.abs(row.amount)}
                    variant={row.amount > 0 ? 'income' : 'expense'}
                    showSign
                    masked={isMasked}
                    className="font-semibold shrink-0"
                  />
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Target Keuangan?"
        description={`Target "${deleteTarget?.name ?? ''}" dan seluruh riwayat kontribusinya akan dihapus. Dana yang teralokasi akan kembali ke Saldo Tersedia Anda.`}
        onConfirm={handleDeleteGoal}
      />
    </div>
  );
}
