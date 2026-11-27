'use client';

import * as React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AlertTriangle, Calendar, Pencil, Plus, Repeat, Trash2 } from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProviders';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { EmptyState } from '@/components/shared/EmptyState';
import { MoneyText } from '@/components/shared/MoneyText';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { Input, NativeSelect } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { db } from '@/db/database';
import type {
  PaymentMethod,
  RecurringFrequency,
  RecurringRuleView,
  TransactionType,
} from '@/db/types';
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  RECURRING_FREQUENCY_LABELS,
} from '@/domain/constants';
import {
  extractDayOfMonth,
  formatIndonesianDate,
  getLocalToday,
  isValidCalendarDate,
  previewNextOccurrences,
} from '@/domain/dates';
import { cn } from '@/lib/cn';
import {
  createRecurringRule,
  deleteRecurringRule,
  listRecurringRules,
  materializeDueTransactions,
  toggleRecurringRule,
  updateRecurringRule,
} from '@/services/recurringService';

export default function RecurringPage() {
  const { bootstrapReady, isMasked, showToast, cappedRuleIds } = useAppContext();
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'active' | 'paused'>('all');

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingRule, setEditingRule] = React.useState<RecurringRuleView | null>(null);
  const [rType, setRType] = React.useState<TransactionType>('expense');
  const [rAmount, setRAmount] = React.useState<number | null>(null);
  const [rCategoryId, setRCategoryId] = React.useState('');
  const [rPayment, setRPayment] = React.useState<PaymentMethod>('bank_transfer');
  const [rFreq, setRFreq] = React.useState<RecurringFrequency>('monthly');
  const [rInterval, setRInterval] = React.useState<number>(1);
  const [rStartDate, setRStartDate] = React.useState(getLocalToday());
  const [rEndDate, setREndDate] = React.useState('');
  const [rNote, setRNote] = React.useState('');
  const [formErr, setFormErr] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [deleteTarget, setDeleteTarget] = React.useState<RecurringRuleView | null>(null);

  React.useEffect(() => {
    if (!bootstrapReady) return;
    void materializeDueTransactions();
  }, [bootstrapReady]);

  const ruleCount = useLiveQuery(() => db.recurringTransactions.count(), [], 0);
  const categories = useLiveQuery(() => db.categories.toArray(), [], []);

  const rulesState = useLiveQuery(async () => {
    if (!bootstrapReady) return null;
    const res = await listRecurringRules();
    return res.ok ? res.data : [];
  }, [bootstrapReady, ruleCount]);

  const activeCategoriesForType = React.useMemo(() => {
    return categories
      .filter((c) => c.type === rType && !c.isArchived)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories, rType]);

  React.useEffect(() => {
    if (activeCategoriesForType.length === 0) return;
    if (!activeCategoriesForType.some((c) => c.id === rCategoryId)) {
      setRCategoryId(activeCategoriesForType[0]?.id ?? '');
    }
  }, [activeCategoriesForType, rCategoryId]);

  const previewDates = React.useMemo(() => {
    if (!isValidCalendarDate(rStartDate)) return [];
    const safeEnd = rEndDate && isValidCalendarDate(rEndDate) ? rEndDate : null;
    if (safeEnd && safeEnd < rStartDate) return [];
    return previewNextOccurrences(
      {
        frequency: rFreq,
        interval: Math.max(1, rInterval || 1),
        anchorDay: rFreq === 'monthly' ? extractDayOfMonth(rStartDate) : null,
        startDate: rStartDate,
        endDate: safeEnd,
      },
      3
    );
  }, [rFreq, rInterval, rStartDate, rEndDate]);

  const filteredRules = React.useMemo(() => {
    const list = rulesState ?? [];
    if (filterStatus === 'active') return list.filter((r) => r.isActive);
    if (filterStatus === 'paused') return list.filter((r) => !r.isActive);
    return list;
  }, [rulesState, filterStatus]);

  const openCreate = () => {
    setEditingRule(null);
    setRType('expense');
    setRAmount(null);
    setRCategoryId('');
    setRPayment('bank_transfer');
    setRFreq('monthly');
    setRInterval(1);
    setRStartDate(getLocalToday());
    setREndDate('');
    setRNote('');
    setFormErr(null);
    setModalOpen(true);
  };

  const openEdit = (r: RecurringRuleView) => {
    setEditingRule(r);
    setRType(r.type);
    setRAmount(r.amount);
    setRCategoryId(r.categoryId);
    setRPayment(r.paymentMethod);
    setRFreq(r.frequency);
    setRInterval(r.interval);
    setRStartDate(r.startDate);
    setREndDate(r.endDate ?? '');
    setRNote(r.note);
    setFormErr(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr(null);
    if (!rAmount || rAmount <= 0) {
      setFormErr('Nominal harus lebih dari Rp 0.');
      return;
    }

    setSaving(true);
    const payload = {
      type: rType,
      amount: rAmount,
      categoryId: rCategoryId,
      note: rNote.trim(),
      paymentMethod: rPayment,
      frequency: rFreq,
      interval: rInterval,
      startDate: rStartDate,
      endDate: rEndDate ? rEndDate : null,
    };

    const res = editingRule
      ? await updateRecurringRule(editingRule.id, payload)
      : await createRecurringRule(payload);

    if (!res.ok) {
      setSaving(false);
      setFormErr(res.error.message);
      return;
    }

    await materializeDueTransactions();
    setSaving(false);
    setModalOpen(false);
    showToast(editingRule ? 'Aturan berulang diperbarui.' : 'Aturan berulang dibuat.');
  };

  const handleToggle = async (r: RecurringRuleView, nextActive: boolean) => {
    const res = await toggleRecurringRule(r.id, nextActive);
    if (!res.ok) {
      showToast(res.error.message, 'error');
      return;
    }
    if (nextActive) {
      await materializeDueTransactions();
    }
    showToast(nextActive ? 'Aturan diaktifkan.' : 'Aturan dijeda.');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await deleteRecurringRule(deleteTarget.id);
    setDeleteTarget(null);
    if (!res.ok) {
      showToast(res.error.message, 'error');
      return;
    }
    showToast('Aturan berulang dihapus. Transaksi masa lalu tetap aman.');
  };

  const loading = !bootstrapReady || rulesState === undefined;

  return (
    <div className="space-y-6">
      {cappedRuleIds.length > 0 ? (
        <div
          role="status"
          className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-start gap-3 text-xs sm:text-sm text-[var(--status-warning)]"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            Beberapa aturan berulang mencapai batas aman 366 generasi sekaligus. Periksa tanggal mulai aturan Anda jika jadwal terlalu jauh di masa lalu.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-1 gap-1">
          {(
            [
              ['all', 'Semua'],
              ['active', 'Aktif'],
              ['paused', 'Dijeda'],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setFilterStatus(val)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium cursor-pointer',
                filterStatus === val
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
          Tambah Jadwal Berulang
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          <Card className="h-44" />
          <Card className="h-44" />
        </div>
      ) : filteredRules.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="Belum ada transaksi berulang"
          description="Otomatiskan pencatatan gaji bulanan, sewa kos, atau tagihan internet secara lokal setiap kali Anda membuka Finora."
          actionLabel="+ Buat Aturan Berulang"
          onAction={openCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map((rule) => (
            <Card key={rule.id} className="flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <CategoryBadge
                    name={rule.categoryName}
                    icon={rule.categoryIcon}
                    color={rule.categoryColor}
                  />
                  <div className="flex items-center gap-2.5">
                    <Badge tone={rule.isActive ? 'success' : 'neutral'}>
                      {rule.isActive ? 'Aktif' : 'Dijeda'}
                    </Badge>
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={(checked) => void handleToggle(rule, checked)}
                      aria-label={`Aktifkan transaksi berulang ${rule.categoryName}`}
                    />
                  </div>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <MoneyText
                    amount={rule.amount}
                    variant={rule.type}
                    showSign
                    masked={isMasked}
                    size="lg"
                  />
                  <span className="text-xs text-[var(--text-secondary)]">
                    Setiap {rule.interval} {RECURRING_FREQUENCY_LABELS[rule.frequency]}
                  </span>
                </div>

                {rule.note ? (
                  <p className="text-xs text-[var(--text-secondary)] truncate">{rule.note}</p>
                ) : null}

                <div className="rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[var(--text-secondary)]">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                      Jadwal Berikutnya:
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {rule.isActive ? formatIndonesianDate(rule.nextRunDate) : '—'}
                    </span>
                  </div>
                  {rule.lastGeneratedDate ? (
                    <div className="flex items-center justify-between text-[var(--text-secondary)]">
                      <span>Terakhir Dicatat:</span>
                      <span>{formatIndonesianDate(rule.lastGeneratedDate)}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>{PAYMENT_METHOD_LABELS[rule.paymentMethod]}</span>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Ubah aturan ${rule.categoryName}`}
                    onClick={() => openEdit(rule)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Hapus aturan ${rule.categoryName}`}
                    onClick={() => setDeleteTarget(rule)}
                  >
                    <Trash2 className="w-4 h-4 text-[var(--status-danger-text)]" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Create / Edit */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent title={editingRule ? 'Ubah Jadwal Berulang' : 'Buat Jadwal Berulang'}>
          <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
            {formErr ? (
              <div
                role="alert"
                className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-[var(--status-danger-text)]"
              >
                {formErr}
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setRType('expense')}
                className={cn(
                  'h-9 rounded-lg text-sm font-semibold cursor-pointer',
                  rType === 'expense'
                    ? 'bg-[var(--danger-solid)] text-white'
                    : 'text-[var(--text-secondary)]'
                )}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setRType('income')}
                className={cn(
                  'h-9 rounded-lg text-sm font-semibold cursor-pointer',
                  rType === 'income'
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-foreground)]'
                    : 'text-[var(--text-secondary)]'
                )}
              >
                Pemasukan
              </button>
            </div>

            <CurrencyInput
              id="rec-amount"
              label="Nominal (IDR)"
              value={rAmount}
              onChange={setRAmount}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="rec-cat" className="block text-sm font-medium">
                  Kategori
                </label>
                <NativeSelect
                  id="rec-cat"
                  value={rCategoryId}
                  onChange={(e) => setRCategoryId(e.target.value)}
                >
                  {activeCategoriesForType.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="rec-pay" className="block text-sm font-medium">
                  Metode
                </label>
                <NativeSelect
                  id="rec-pay"
                  value={rPayment}
                  onChange={(e) => setRPayment(e.target.value as PaymentMethod)}
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>
                      {PAYMENT_METHOD_LABELS[pm]}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="rec-freq" className="block text-sm font-medium">
                  Frekuensi
                </label>
                <NativeSelect
                  id="rec-freq"
                  value={rFreq}
                  onChange={(e) => setRFreq(e.target.value as RecurringFrequency)}
                >
                  <option value="daily">Harian</option>
                  <option value="weekly">Mingguan</option>
                  <option value="monthly">Bulanan</option>
                  <option value="yearly">Tahunan</option>
                </NativeSelect>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="rec-int" className="block text-sm font-medium">
                  Interval
                </label>
                <Input
                  id="rec-int"
                  type="number"
                  min={1}
                  max={365}
                  value={rInterval}
                  onChange={(e) => setRInterval(Math.max(1, Number(e.target.value)))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="rec-start" className="block text-sm font-medium">
                  Tanggal Mulai
                </label>
                <Input
                  id="rec-start"
                  type="date"
                  value={rStartDate}
                  onChange={(e) => setRStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="rec-end" className="block text-sm font-medium">
                  Berakhir (Opsional)
                </label>
                <Input
                  id="rec-end"
                  type="date"
                  value={rEndDate}
                  onChange={(e) => setREndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="rec-note" className="block text-sm font-medium">
                Catatan
              </label>
              <Input
                id="rec-note"
                maxLength={500}
                value={rNote}
                onChange={(e) => setRNote(e.target.value)}
                placeholder="Contoh: Sewa kos bulanan"
              />
            </div>

            {previewDates.length > 0 ? (
              <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-3 text-xs space-y-1">
                <p className="font-semibold text-[var(--text-primary)]">
                  Pratinjau 3 Jadwal Terdekat:
                </p>
                <p className="text-[var(--text-secondary)]">
                  {previewDates.map((d) => formatIndonesianDate(d)).join(' → ')}
                </p>
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Aturan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Aturan Berulang?"
        description="Aturan jadwal otomatis ini akan dihapus. Seluruh transaksi yang sudah terbuat di masa lalu TIDAK akan terhapus."
        onConfirm={handleDelete}
      />
    </div>
  );
}
