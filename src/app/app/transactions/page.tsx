'use client';

import * as React from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  ArrowLeftRight,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProviders';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { MoneyText } from '@/components/shared/MoneyText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { Input, NativeSelect } from '@/components/ui/Input';
import { db } from '@/db/database';
import type { PaymentMethod, TransactionType, TransactionView } from '@/db/types';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '@/domain/constants';
import {
  formatIndonesianDate,
  getLocalMonth,
  getMonthDateBounds,
} from '@/domain/dates';
import {
  deleteTransaction,
  queryTransactions,
  type TransactionQueryResult,
} from '@/services/transactionService';

export default function TransactionsPage() {
  const { bootstrapReady, isMasked, showToast } = useAppContext();
  const defaultBounds = React.useMemo(() => getMonthDateBounds(getLocalMonth()), []);

  const [searchInput, setSearchInput] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [startDate, setStartDate] = React.useState(defaultBounds.startDate);
  const [endDate, setEndDate] = React.useState(defaultBounds.endDate);
  const [typeFilter, setTypeFilter] = React.useState<TransactionType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [paymentFilter, setPaymentFilter] = React.useState<PaymentMethod | 'all'>('all');
  const [sortBy, setSortBy] = React.useState<'date' | 'amount'>('date');
  const [sortDir, setSortDir] = React.useState<'desc' | 'asc'>('desc');
  const [page, setPage] = React.useState(1);
  const pageSize = 25;

  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<TransactionView | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 200);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const categories = useLiveQuery(() => db.categories.toArray(), [], []);
  const totalDbCount = useLiveQuery(() => db.transactions.count(), [], 0);

  const queryState = useLiveQuery(async (): Promise<{
    ok: boolean;
    data?: TransactionQueryResult;
    errorMessage?: string;
  }> => {
    if (!bootstrapReady) return { ok: true };
    const res = await queryTransactions({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      type: typeFilter,
      categoryId: categoryFilter,
      paymentMethod: paymentFilter,
      search: debouncedSearch,
      sortBy,
      sortDir,
      page,
      pageSize,
    });
    if (!res.ok) return { ok: false, errorMessage: res.error.message };
    return { ok: true, data: res.data };
  }, [
    bootstrapReady,
    startDate,
    endDate,
    typeFilter,
    categoryFilter,
    paymentFilter,
    debouncedSearch,
    sortBy,
    sortDir,
    page,
    totalDbCount,
  ]);

  const resetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setStartDate(defaultBounds.startDate);
    setEndDate(defaultBounds.endDate);
    setTypeFilter('all');
    setCategoryFilter('all');
    setPaymentFilter('all');
    setSortBy('date');
    setSortDir('desc');
    setPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await deleteTransaction(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    if (!res.ok) {
      showToast(res.error.message, 'error');
      return;
    }
    showToast('Transaksi berhasil dihapus.');
  };

  const activeFilterCount =
    (typeFilter !== 'all' ? 1 : 0) +
    (categoryFilter !== 'all' ? 1 : 0) +
    (paymentFilter !== 'all' ? 1 : 0) +
    (startDate !== defaultBounds.startDate || endDate !== defaultBounds.endDate ? 1 : 0);

  const loading = !bootstrapReady || queryState === undefined;
  const result = queryState?.data;
  const totalPages = result ? Math.max(1, Math.ceil(result.totalCount / pageSize)) : 1;

  const filterControls = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <div>
        <label htmlFor="flt-start" className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
          Dari Tanggal
        </label>
        <Input
          id="flt-start"
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setPage(1);
          }}
        />
      </div>
      <div>
        <label htmlFor="flt-end" className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
          Sampai Tanggal
        </label>
        <Input
          id="flt-end"
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setPage(1);
          }}
        />
      </div>
      <div>
        <label htmlFor="flt-type" className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
          Tipe
        </label>
        <NativeSelect
          id="flt-type"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as TransactionType | 'all');
            setPage(1);
          }}
        >
          <option value="all">Semua Tipe</option>
          <option value="expense">Pengeluaran</option>
          <option value="income">Pemasukan</option>
        </NativeSelect>
      </div>
      <div>
        <label htmlFor="flt-cat" className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
          Kategori
        </label>
        <NativeSelect
          id="flt-cat"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.type === 'income' ? 'Masuk' : 'Keluar'})
            </option>
          ))}
        </NativeSelect>
      </div>
      <div>
        <label htmlFor="flt-pay" className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
          Metode
        </label>
        <NativeSelect
          id="flt-pay"
          value={paymentFilter}
          onChange={(e) => {
            setPaymentFilter(e.target.value as PaymentMethod | 'all');
            setPage(1);
          }}
        >
          <option value="all">Semua Metode</option>
          {PAYMENT_METHODS.map((pm) => (
            <option key={pm} value={pm}>
              {PAYMENT_METHOD_LABELS[pm]}
            </option>
          ))}
        </NativeSelect>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <Input
            aria-label="Cari catatan atau nama kategori"
            placeholder="Cari catatan atau kategori..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="lg:hidden"
            onClick={() => setMobileFilterOpen(true)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Button>
          <NativeSelect
            aria-label="Urutkan transaksi"
            value={`${sortBy}:${sortDir}`}
            onChange={(e) => {
              const [sb, sd] = e.target.value.split(':') as ['date' | 'amount', 'desc' | 'asc'];
              setSortBy(sb);
              setSortDir(sd);
            }}
            className="w-auto min-w-[155px]"
          >
            <option value="date:desc">Terbaru</option>
            <option value="date:asc">Terlama</option>
            <option value="amount:desc">Nominal Terbesar</option>
            <option value="amount:asc">Nominal Terkecil</option>
          </NativeSelect>
          <Button variant="ghost" onClick={resetFilters} title="Reset Filter">
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
          <Link
            href="/app/transactions/new"
            className="hidden sm:inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-[var(--accent-primary)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            Catat
          </Link>
        </div>
      </div>

      {/* Desktop Filter Panel */}
      <Card className="hidden lg:block p-4">{filterControls}</Card>

      {queryState && !queryState.ok ? (
        <div
          role="alert"
          className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-[var(--status-danger-text)]"
        >
          {queryState.errorMessage}
        </div>
      ) : null}

      {/* Filter Summary Strip */}
      {result ? (
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3.5 sm:p-4">
            <p className="text-xs text-[var(--text-secondary)]">Pemasukan Filter</p>
            <MoneyText
              amount={result.summary.totalIncome}
              variant="income"
              masked={isMasked}
              className="font-bold text-sm sm:text-base mt-1 block"
            />
          </Card>
          <Card className="p-3.5 sm:p-4">
            <p className="text-xs text-[var(--text-secondary)]">Pengeluaran Filter</p>
            <MoneyText
              amount={result.summary.totalExpense}
              variant="expense"
              masked={isMasked}
              className="font-bold text-sm sm:text-base mt-1 block"
            />
          </Card>
          <Card className="p-3.5 sm:p-4">
            <p className="text-xs text-[var(--text-secondary)]">
              Selisih ({result.totalCount} tx)
            </p>
            <MoneyText
              amount={result.summary.netCashflow}
              variant="balance"
              masked={isMasked}
              className="font-bold text-sm sm:text-base mt-1 block"
            />
          </Card>
        </div>
      ) : null}

      {/* List / Table */}
      {loading ? (
        <Card className="space-y-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-[var(--bg-elevated)]" />
          ))}
        </Card>
      ) : !result || result.items.length === 0 ? (
        totalDbCount === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="Belum ada transaksi tercatat"
            description="Mulai catat pemasukan dan pengeluaran harian Anda untuk memantau arus kas secara lokal."
            actionLabel="+ Catat Transaksi"
            onAction={() => {
              window.location.href = '/app/transactions/new';
            }}
          />
        ) : (
          <EmptyState
            icon={Search}
            title="Tidak ada transaksi yang cocok"
            description="Coba ubah kata kunci pencarian atau rentang tanggal pada filter."
            actionLabel="Reset Filter"
            onAction={resetFilters}
          />
        )
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="hidden md:block p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-xs font-semibold text-[var(--text-secondary)]">
                    <th className="py-3.5 px-4">Tanggal</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Catatan</th>
                    <th className="py-3.5 px-4">Metode</th>
                    <th className="py-3.5 px-4 text-right">Nominal</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] text-sm">
                  {result.items.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-[var(--bg-elevated)]/60 transition-colors"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap tabular-nums text-[var(--text-secondary)]">
                        {formatIndonesianDate(tx.date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <CategoryBadge
                          name={tx.categoryName}
                          icon={tx.categoryIcon}
                          color={tx.categoryColor}
                          isArchived={tx.categoryArchived}
                          size="sm"
                        />
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-[var(--text-secondary)]">
                        {tx.note || '—'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-[var(--text-secondary)]">
                        {PAYMENT_METHOD_LABELS[tx.paymentMethod]}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-semibold">
                        <MoneyText
                          amount={tx.amount}
                          variant={tx.type}
                          showSign
                          masked={isMasked}
                        />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            href={`/app/transactions/${tx.id}/edit`}
                            aria-label={`Ubah transaksi ${tx.categoryName}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-canvas)]"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Hapus transaksi ${tx.categoryName}`}
                            onClick={() => setDeleteTarget(tx)}
                          >
                            <Trash2 className="w-4 h-4 text-[var(--status-danger-text)]" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile Stacked List */}
          <div className="md:hidden space-y-2.5">
            {result.items.map((tx) => (
              <Card key={tx.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CategoryBadge
                      name={tx.categoryName}
                      icon={tx.categoryIcon}
                      color={tx.categoryColor}
                      isArchived={tx.categoryArchived}
                      size="sm"
                    />
                    <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                      {formatIndonesianDate(tx.date)} • {PAYMENT_METHOD_LABELS[tx.paymentMethod]}
                    </p>
                    {tx.note ? (
                      <p className="text-xs text-[var(--text-primary)] mt-1 break-words">
                        {tx.note}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right shrink-0 space-y-2">
                    <MoneyText
                      amount={tx.amount}
                      variant={tx.type}
                      showSign
                      masked={isMasked}
                      className="font-bold block"
                    />
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/app/transactions/${tx.id}/edit`}
                        aria-label={`Ubah transaksi ${tx.categoryName}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Hapus transaksi ${tx.categoryName}`}
                        onClick={() => setDeleteTarget(tx)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[var(--status-danger-text)]" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 ? (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-[var(--text-secondary)] tabular-nums">
                Halaman {page} dari {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Sebelumnya
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* Mobile Filter Dialog */}
      <Dialog open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
        <DialogContent title="Filter Transaksi">
          <div className="space-y-4">
            {filterControls}
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={resetFilters}>
                Reset
              </Button>
              <Button onClick={() => setMobileFilterOpen(false)}>Terapkan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Transaksi?"
        description={
          deleteTarget
            ? `Transaksi "${deleteTarget.categoryName}" pada ${formatIndonesianDate(deleteTarget.date)} akan dihapus permanen dari penyimpanan lokal.`
            : ''
        }
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
