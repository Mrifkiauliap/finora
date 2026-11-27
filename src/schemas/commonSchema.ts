import { z } from 'zod';
import {
  CATEGORY_ICONS,
  MAX_IDR_AMOUNT,
  MAX_WARNING_THRESHOLD_PCT,
  MIN_IDR_AMOUNT,
  MIN_WARNING_THRESHOLD_PCT,
} from '@/domain/constants';
import { isValidCalendarDate, isValidMonthString } from '@/domain/dates';

export const TransactionTypeSchema = z.enum(['income', 'expense']);

export const PaymentMethodSchema = z.enum([
  'cash',
  'bank_transfer',
  'e_wallet',
  'debit_card',
  'credit_card',
  'other',
]);

export const CalendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD.')
  .refine((val) => isValidCalendarDate(val), 'Tanggal kalender tidak valid.');

export const MonthStringSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Format bulan harus YYYY-MM.')
  .refine((val) => isValidMonthString(val), 'Bulan kalender tidak valid.');

export const IsoUtcDatetimeSchema = z.string().datetime({
  message: 'Format timestamp UTC ISO 8601 tidak valid.',
});

export const SafePositiveIdrSchema = z
  .number({
    required_error: 'Nominal wajib diisi.',
    invalid_type_error: 'Nominal harus berupa angka bulat.',
  })
  .int('Nominal IDR harus bilangan bulat tanpa desimal.')
  .min(MIN_IDR_AMOUNT, `Nominal minimal Rp ${MIN_IDR_AMOUNT}.`)
  .max(MAX_IDR_AMOUNT, 'Nominal melebihi batas maksimum Rp 999.999.999.999.')
  .refine((v) => Number.isSafeInteger(v), 'Nominal melebihi batas integer aman.');

export const SafeNonNegativeIdrSchema = z
  .number({
    invalid_type_error: 'Nominal harus berupa angka bulat.',
  })
  .int('Nominal IDR harus bilangan bulat.')
  .min(0, 'Nominal tidak boleh negatif.')
  .max(MAX_IDR_AMOUNT, 'Nominal melebihi batas maksimum.')
  .refine((v) => Number.isSafeInteger(v), 'Nominal melebihi batas integer aman.');

export const HexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Warna harus format hex #RRGGBB.');

export const CategoryIconSchema = z.enum(CATEGORY_ICONS, {
  errorMap: () => ({ message: 'Ikon kategori tidak dikenali.' }),
});

export const WarningThresholdSchema = z
  .number()
  .int('Ambang peringatan harus bilangan bulat.')
  .min(MIN_WARNING_THRESHOLD_PCT, `Ambang peringatan minimal ${MIN_WARNING_THRESHOLD_PCT}%.`)
  .max(MAX_WARNING_THRESHOLD_PCT, `Ambang peringatan maksimal ${MAX_WARNING_THRESHOLD_PCT}%.`);

export const EntityIdSchema = z.string().min(1, 'ID wajib diisi.').max(64, 'ID terlalu panjang.');
