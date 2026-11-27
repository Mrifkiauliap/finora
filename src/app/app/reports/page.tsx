'use client';

import * as React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProviders';
import { EmptyState } from '@/components/shared/EmptyState';
import { MoneyText } from '@/components/shared/MoneyText';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, NativeSelect } from '@/components/ui/Input';
import { db } from '@/db/database';
import type { TransactionType } from '@/db/types';
import { PAYMENT_METHOD_LABELS } from '@/domain/constants';
import {
  formatIndonesianDate,
  getLocalMonth,
  getMonthDateBounds,
} from '@/domain/dates';
import { triggerBlobDownload } from '@/lib/download';
import { getAnalyticsReport } from '@/services/analyticsService';
import { exportTransactionsCsv } from '@/services/exportService';
import { queryTransactions } from '@/services/transactionService';

export default function ReportsPage() {
  const { bootstrapReady, isMasked, showToast } = useAppContext();
  const bounds = React.useMemo(() => getMonthDateBounds(getLocalMonth()), []);

  const [startDate, setStartDate] = React.useState(bounds.startDate);
  const [endDate, setEndDate] = React.useState(bounds.endDate);
  const [typeFilter, setTypeFilter] = React.useState<TransactionType | 'all'>('all');
  const [exporting, setExporting] = React.useState(false);

  const txCount = useLiveQuery(() => db.transactions.count(), [], 0);

  const dataState = useLiveQuery(async () => {
    if (!bootstrapReady) return null;
    const [reportRes, txRes] = await Promise.all([
      getAnalyticsReport({ startDate, endDate }),
      queryTransactions({ startDate, endDate, type: typeFilter }),
    ]);
    return { reportRes, txRes };
  }, [bootstrapReady, startDate, endDate, typeFilter, txCount]);

  const handleExportCsv = async () => {
    setExporting(true);
    const res = await exportTransactionsCsv({ startDate, endDate, type: typeFilter });
    setExporting(false);

    if (!res.ok) {
      showToast(res.error.message, 'error');
      return;
    }
    triggerBlobDownload(res.data.blob, res.data.filename);
    showToast(`Laporan CSV berhasil diunduh (${res.data.rowCount} transaksi).`);
  };

  const loading = !bootstrapReady || dataState === undefined || dataState === null;
  const txResult = dataState?.txRes.ok ? dataState.txRes.data : null;
  const report = dataState?.reportRes.ok ? dataState.reportRes.data : null;
  const hasError = dataState && (!dataState.txRes.ok || !dataState.reportRes.ok);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card className="no-print p-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            <div>
              <label htmlFor="rep-start" className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Dari Tanggal
              </label>
              <Input
                id="rep-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="rep-end" className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Sampai Tanggal
              </label>
              <Input
                id="rep-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="rep-type" className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Tipe Transaksi
              </label>
              <NativeSelect
                id="rep-type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'all')}
              >
                <option value="all">Semua Tipe</option>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </NativeSelect>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              disabled={!txResult || txResult.items.length === 0}
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4" />
              Cetak Laporan
            </Button>
            <Button
              disabled={exporting || !txResult || txResult.items.length === 0}
              onClick={() => void handleExportCsv()}
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Mengekspor...' : 'Ekspor CSV'}
            </Button>
          </div>
        </div>
      </Card>

      {hasError ? (
        <div
          role="alert"
          className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-[var(--status-danger-text)]"
        >
          Rentang tanggal laporan tidak valid. Pastikan tanggal mulai tidak lebih besar dari tanggal akhir.
        </div>
      ) : null}

      {/* Print Heading */}
      <div className="hidden print:block pb-3 border-b border-slate-300">
        <h1 className="text-xl font-bold">Laporan Keuangan Finora</h1>
        <p className="text-sm">
          Periode: {formatIndonesianDate(startDate)} s.d. {formatIndonesianDate(endDate)}
        </p>
      </div>

      {loading ? (
        <Card className="h-64 animate-pulse" />
      ) : !txResult || txResult.items.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="Tidak ada data pada periode laporan ini"
          description="Sesuaikan rentang tanggal atau catat transaksi baru untuk menghasilkan laporan dan ekspor CSV."
        />
      ) : (
        <>
          {/* Summary Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-xs text-[var(--text-secondary)]">Pemasukan</p>
              <MoneyText
                amount={txResult.summary.totalIncome}
                variant="income"
                masked={isMasked}
                size="lg"
                className="mt-1 block"
              />
            </Card>
            <Card className="p-4">
              <p className="text-xs text-[var(--text-secondary)]">Pengeluaran</p>
              <MoneyText
                amount={txResult.summary.totalExpense}
                variant="expense"
                masked={isMasked}
                size="lg"
                className="mt-1 block"
              />
            </Card>
            <Card className="p-4">
              <p className="text-xs text-[var(--text-secondary)]">Arus Kas Bersih</p>
              <MoneyText
                amount={txResult.summary.netCashflow}
                variant="balance"
                masked={isMasked}
                size="lg"
                className="mt-1 block"
              />
            </Card>
            <Card className="p-4">
              <p className="text-xs text-[var(--text-secondary)]">Rasio Tabungan</p>
              <p className="text-lg font-semibold tabular-nums mt-1">
                {report?.currentSummary.savingsRatePct === null ||
                report?.currentSummary.savingsRatePct === undefined
                  ? '—'
                  : `${report.currentSummary.savingsRatePct.toLocaleString('id-ID')}%`}
              </p>
            </Card>
          </div>

          {/* Transaction Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Transaksi Laporan ({txResult.totalCount})</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                    <th className="py-2.5 pr-3">Tanggal</th>
                    <th className="py-2.5 px-3">Tipe</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Metode</th>
                    <th className="py-2.5 px-3">Catatan</th>
                    <th className="py-2.5 pl-3 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {txResult.items.map((tx) => (
                    <tr key={tx.id}>
                      <td className="py-2.5 pr-3 whitespace-nowrap tabular-nums">
                        {formatIndonesianDate(tx.date)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">{tx.categoryName}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-xs text-[var(--text-secondary)]">
                        {PAYMENT_METHOD_LABELS[tx.paymentMethod]}
                      </td>
                      <td className="py-2.5 px-3 max-w-xs truncate text-[var(--text-secondary)]">
                        {tx.note || '—'}
                      </td>
                      <td className="py-2.5 pl-3 whitespace-nowrap text-right font-semibold">
                        <MoneyText
                          amount={tx.amount}
                          variant={tx.type}
                          showSign
                          masked={isMasked}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
