import type { PaymentMethod, RecurringFrequency } from '@/db/types';

export const MAX_IDR_AMOUNT = 999_999_999_999;
export const MIN_IDR_AMOUNT = 1;
export const MAX_BACKUP_FILE_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_RECURRING_CATCHUP = 366;
export const DEFAULT_WARNING_THRESHOLD_PCT = 80;
export const MIN_WARNING_THRESHOLD_PCT = 50;
export const MAX_WARNING_THRESHOLD_PCT = 95;

export const PROTECTED_FALLBACK_CATEGORY_IDS = new Set([
  'cat-sys-other-income',
  'cat-sys-other-expense',
]);

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  'cash',
  'bank_transfer',
  'e_wallet',
  'debit_card',
  'credit_card',
  'other',
] as const;

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Tunai',
  bank_transfer: 'Transfer Bank',
  e_wallet: 'E-Wallet / QRIS',
  debit_card: 'Kartu Debit',
  credit_card: 'Kartu Kredit',
  other: 'Lainnya',
};

export const RECURRING_FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  daily: 'Harian',
  weekly: 'Mingguan',
  monthly: 'Bulanan',
  yearly: 'Tahunan',
};

export const CATEGORY_ICONS = [
  'utensils',
  'car',
  'receipt',
  'shopping-bag',
  'gamepad-2',
  'heart-pulse',
  'graduation-cap',
  'wallet',
  'briefcase',
  'gift',
  'trending-up',
  'home',
  'plane',
  'coffee',
  'smartphone',
  'target',
  'piggy-bank',
  'tag',
  'more-horizontal',
] as const;

export type CategoryIconKey = (typeof CATEGORY_ICONS)[number];

export const CATEGORY_COLORS = [
  '#10B981', // Emerald
  '#38BDF8', // Sky
  '#F59E0B', // Amber
  '#A78BFA', // Violet
  '#FB7185', // Rose
  '#2DD4BF', // Teal
  '#22C55E', // Green
  '#F97316', // Orange
  '#60A5FA', // Blue
  '#E879F9', // Fuchsia
] as const;
