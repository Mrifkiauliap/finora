import { MAX_IDR_AMOUNT } from './constants';

const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const digitGroupFormatter = new Intl.NumberFormat('id-ID', {
  maximumFractionDigits: 0,
});

/**
 * Memformat bilangan bulat IDR menjadi string berformat id-ID (mis. "Rp 1.500.000" atau "-Rp 50.000").
 */
export function formatIdr(amount: number, options?: { showPlusSign?: boolean }): string {
  const safe = Math.trunc(Number.isFinite(amount) ? amount : 0);
  const formatted = idrFormatter.format(safe).replace(/\u00A0/g, ' ');
  if (options?.showPlusSign && safe > 0) {
    return `+${formatted}`;
  }
  return formatted;
}

/**
 * Memformat angka ringkas untuk label sumbu grafik (mis. "Rp 1,5 jt", "Rp 250 rb").
 */
export function formatCompactIdr(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000_000) {
    const val = (abs / 1_000_000_000).toFixed(1).replace(/\.0$/, '').replace('.', ',');
    return `${sign}Rp ${val} M`;
  }
  if (abs >= 1_000_000) {
    const val = (abs / 1_000_000).toFixed(1).replace(/\.0$/, '').replace('.', ',');
    return `${sign}Rp ${val} jt`;
  }
  if (abs >= 1_000) {
    const val = Math.round(abs / 1_000);
    return `${sign}Rp ${val} rb`;
  }
  return formatIdr(amount);
}

/**
 * Memformat angka untuk tampilan di dalam input teks nominal (tanpa prefix "Rp").
 */
export function formatIdrInputDisplay(value: number | null): string {
  if (value === null || !Number.isFinite(value) || value <= 0) {
    return '';
  }
  return digitGroupFormatter.format(Math.trunc(value));
}

/**
 * Mengurai string ketikan pengguna menjadi integer IDR aman atau null jika kosong.
 * Menolak karakter non-digit dan membatasi nilai maksimum sesuai MAX_IDR_AMOUNT.
 */
export function parseIdrDigits(raw: string): number | null {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  const parsed = Number(digits);
  if (!Number.isSafeInteger(parsed)) return MAX_IDR_AMOUNT;
  return Math.min(parsed, MAX_IDR_AMOUNT);
}

export function isValidIdrTransactionAmount(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 1 && value <= MAX_IDR_AMOUNT;
}
