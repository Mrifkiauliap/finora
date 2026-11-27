import type { TransactionView } from '@/db/types';
import { PAYMENT_METHOD_LABELS } from './constants';

const FORMULA_PREFIX_REGEX = /^[=+\-@\t\r]/;

/**
 * SEC-006: Menetralkan karakter awal berbahaya (CSV Formula Injection) dengan prefiks petik tunggal
 * dan melakukan quoting RFC 4180.
 */
export function sanitizeCsvCell(rawValue: string | number): string {
  const str = String(rawValue);
  const neutralized =
    typeof rawValue === 'string' && FORMULA_PREFIX_REGEX.test(str) ? `'${str}` : str;
  const escaped = neutralized.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Menghasilkan CSV ber-UTF-8 BOM untuk kompatibilitas Excel Indonesia.
 */
export function serializeTransactionsToCsv(rows: TransactionView[]): string {
  const headers = [
    'Tanggal',
    'Tipe',
    'Kategori',
    'Metode Pembayaran',
    'Catatan',
    'Nominal (IDR)',
  ];

  const lines = [headers.map((h) => sanitizeCsvCell(h)).join(',')];

  for (const row of rows) {
    const typeLabel = row.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
    const paymentLabel = PAYMENT_METHOD_LABELS[row.paymentMethod] ?? row.paymentMethod;
    const line = [
      sanitizeCsvCell(row.date),
      sanitizeCsvCell(typeLabel),
      sanitizeCsvCell(row.categoryName),
      sanitizeCsvCell(paymentLabel),
      sanitizeCsvCell(row.note),
      sanitizeCsvCell(row.amount),
    ].join(',');
    lines.push(line);
  }

  return `\uFEFF${lines.join('\r\n')}`;
}
