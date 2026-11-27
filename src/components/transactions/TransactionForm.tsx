'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { subDays, format } from 'date-fns';
import { db } from '@/db/database';
import type { PaymentMethod, TransactionRecord, TransactionType } from '@/db/types';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '@/domain/constants';
import { getLocalToday } from '@/domain/dates';
import { createTransaction, updateTransaction } from '@/services/transactionService';
import { useAppContext } from '@/components/providers/AppProviders';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, NativeSelect, Textarea } from '@/components/ui/Input';
import { cn } from '@/lib/cn';

export function TransactionForm({
  mode,
  initialTransaction,
  onSaved,
}: {
  mode: 'create' | 'edit';
  initialTransaction?: TransactionRecord;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const { showToast } = useAppContext();

  const [type, setType] = React.useState<TransactionType>(
    initialTransaction?.type ?? 'expense'
  );
  const [amount, setAmount] = React.useState<number | null>(
    initialTransaction?.amount ?? null
  );
  const [categoryId, setCategoryId] = React.useState<string>(
    initialTransaction?.categoryId ?? ''
  );
  const [date, setDate] = React.useState<string>(
    initialTransaction?.date ?? getLocalToday()
  );
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(
    initialTransaction?.paymentMethod ?? 'cash'
  );
  const [note, setNote] = React.useState<string>(initialTransaction?.note ?? '');
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const allCategories = useLiveQuery(() => db.categories.toArray(), [], []);

  const availableCategories = React.useMemo(() => {
    return allCategories
      .filter((c) => {
        if (c.type !== type) return false;
        if (!c.isArchived) return true;
        // Pada mode edit, tetap tampilkan kategori arsip jika itu kategori awal transaksi ini
        return mode === 'edit' && initialTransaction?.categoryId === c.id;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'id-ID'));
  }, [allCategories, type, mode, initialTransaction?.categoryId]);

  React.useEffect(() => {
    if (availableCategories.length === 0) return;
    const stillValid = availableCategories.some((c) => c.id === categoryId);
    if (!stillValid) {
      setCategoryId(availableCategories[0]?.id ?? '');
    }
  }, [availableCategories, categoryId]);

  const handleTypeChange = (nextType: TransactionType) => {
    if (nextType === type) return;
    setType(nextType);
    setCategoryId('');
    setFieldErrors((prev) => ({ ...prev, categoryId: [] }));
  };

  const submitInternal = async (addAnother: boolean) => {
    setFormError(null);
    setFieldErrors({});

    if (amount === null || amount <= 0) {
      setFieldErrors({ amount: ['Nominal transaksi wajib lebih dari Rp 0.'] });
      return;
    }
    if (!categoryId) {
      setFieldErrors({ categoryId: ['Pilih kategori transaksi.'] });
      return;
    }

    setSubmitting(true);
    const payload = {
      type,
      amount,
      categoryId,
      date,
      note: note.trim(),
      paymentMethod,
    };

    const res =
      mode === 'create'
        ? await createTransaction(payload)
        : await updateTransaction(initialTransaction!.id, payload);

    setSubmitting(false);

    if (!res.ok) {
      setFormError(res.error.message);
      if (res.error.fieldErrors) setFieldErrors(res.error.fieldErrors);
      return;
    }

    showToast(
      mode === 'create' ? 'Transaksi berhasil disimpan.' : 'Transaksi berhasil diperbarui.'
    );

    if (addAnother && mode === 'create') {
      setAmount(null);
      setNote('');
      return;
    }

    if (onSaved) {
      onSaved();
    } else {
      router.push('/app/transactions');
    }
  };

  const today = getLocalToday();
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  return (
    <Card className="max-w-xl mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submitInternal(false);
        }}
        className="space-y-5"
      >
        {formError ? (
          <div
            role="alert"
            className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-[var(--status-danger-text)]"
          >
            {formError}
          </div>
        ) : null}

        {/* Segmented Type Control */}
        <div>
          <span className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Tipe Transaksi
          </span>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={cn(
                'h-10 rounded-lg text-sm font-semibold transition-colors cursor-pointer',
                type === 'expense'
                  ? 'bg-[var(--danger-solid)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={cn(
                'h-10 rounded-lg text-sm font-semibold transition-colors cursor-pointer',
                type === 'income'
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-foreground)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              Pemasukan
            </button>
          </div>
        </div>

        <CurrencyInput
          id="tx-amount"
          label="Nominal (IDR)"
          value={amount}
          onChange={setAmount}
          error={fieldErrors.amount?.[0]}
          placeholder="Contoh: 35.000"
          required
        />

        {/* Category Picker */}
        <div className="space-y-1.5">
          <label
            htmlFor="tx-category"
            className="block text-sm font-medium text-[var(--text-primary)]"
          >
            Kategori <span className="text-[var(--status-danger-text)]">*</span>
          </label>
          <NativeSelect
            id="tx-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            hasError={Boolean(fieldErrors.categoryId?.[0])}
          >
            {availableCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.isArchived ? ' (Arsip)' : ''}
              </option>
            ))}
          </NativeSelect>
          {fieldErrors.categoryId?.[0] ? (
            <p className="text-xs text-[var(--status-danger-text)]">
              {fieldErrors.categoryId[0]}
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {availableCategories.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-colors cursor-pointer',
                    categoryId === c.id
                      ? 'bg-emerald-500/15 border-[var(--accent-primary)] text-[var(--accent-primary)] font-semibold'
                      : 'bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  )}
                >
                  <CategoryIcon name={c.icon} className="w-3 h-3" />
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date + Quick Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="tx-date"
              className="block text-sm font-medium text-[var(--text-primary)]"
            >
              Tanggal <span className="text-[var(--status-danger-text)]">*</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDate(today)}
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs border cursor-pointer',
                  date === today
                    ? 'bg-emerald-500/15 border-[var(--accent-primary)] text-[var(--accent-primary)] font-medium'
                    : 'border-[var(--border-subtle)] text-[var(--text-secondary)]'
                )}
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => setDate(yesterday)}
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs border cursor-pointer',
                  date === yesterday
                    ? 'bg-emerald-500/15 border-[var(--accent-primary)] text-[var(--accent-primary)] font-medium'
                    : 'border-[var(--border-subtle)] text-[var(--text-secondary)]'
                )}
              >
                Kemarin
              </button>
            </div>
          </div>
          <Input
            id="tx-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            hasError={Boolean(fieldErrors.date?.[0])}
          />
          {fieldErrors.date?.[0] ? (
            <p className="text-xs text-[var(--status-danger-text)]">
              {fieldErrors.date[0]}
            </p>
          ) : null}
        </div>

        {/* Payment Method */}
        <div className="space-y-1.5">
          <label
            htmlFor="tx-payment"
            className="block text-sm font-medium text-[var(--text-primary)]"
          >
            Metode Pembayaran
          </label>
          <NativeSelect
            id="tx-payment"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          >
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>
                {PAYMENT_METHOD_LABELS[pm]}
              </option>
            ))}
          </NativeSelect>
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="tx-note"
              className="block text-sm font-medium text-[var(--text-primary)]"
            >
              Catatan (Opsional)
            </label>
            <span className="text-xs tabular-nums text-[var(--text-secondary)]">
              {note.length}/500
            </span>
          </div>
          <Textarea
            id="tx-note"
            rows={3}
            maxLength={500}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: Makan siang bersama tim, transfer gaji, dll."
            hasError={Boolean(fieldErrors.note?.[0])}
          />
          {fieldErrors.note?.[0] ? (
            <p className="text-xs text-[var(--status-danger-text)]">
              {fieldErrors.note[0]}
            </p>
          ) : null}
        </div>

        <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <Button variant="outline" onClick={() => router.back()} disabled={submitting}>
            Batal
          </Button>
          <div className="flex flex-col sm:flex-row gap-2.5">
            {mode === 'create' ? (
              <Button
                variant="secondary"
                disabled={submitting}
                onClick={() => void submitInternal(true)}
              >
                Simpan & Tambah Lagi
              </Button>
            ) : null}
            <Button type="submit" disabled={submitting}>
              {submitting
                ? 'Menyimpan...'
                : mode === 'create'
                  ? 'Simpan Transaksi'
                  : 'Simpan Perubahan'}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
