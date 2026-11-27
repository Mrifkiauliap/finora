import { z } from 'zod';
import {
  CalendarDateSchema,
  EntityIdSchema,
  IsoUtcDatetimeSchema,
  PaymentMethodSchema,
  SafePositiveIdrSchema,
  TransactionTypeSchema,
} from './commonSchema';

export const RecurringFrequencySchema = z.enum(['daily', 'weekly', 'monthly', 'yearly']);

const BaseRecurringObject = z
  .object({
    type: TransactionTypeSchema,
    amount: SafePositiveIdrSchema,
    categoryId: EntityIdSchema,
    note: z.string().trim().max(500, 'Catatan maksimal 500 karakter.').default(''),
    paymentMethod: PaymentMethodSchema,
    frequency: RecurringFrequencySchema,
    interval: z
      .number()
      .int('Interval harus bilangan bulat.')
      .min(1, 'Interval minimal 1.')
      .max(365, 'Interval maksimal 365.')
      .default(1),
    startDate: CalendarDateSchema,
    endDate: CalendarDateSchema.nullable().default(null),
  })
  .strict();

export const CreateRecurringSchema = BaseRecurringObject.refine(
  (data) => !data.endDate || data.endDate >= data.startDate,
  {
    message: 'Tanggal berakhir tidak boleh lebih awal dari tanggal mulai.',
    path: ['endDate'],
  }
);

export const UpdateRecurringSchema = CreateRecurringSchema;

export const RecurringTransactionRecordSchema = z
  .object({
    id: z.string().uuid(),
    type: TransactionTypeSchema,
    amount: SafePositiveIdrSchema,
    categoryId: EntityIdSchema,
    note: z.string().trim().max(500),
    paymentMethod: PaymentMethodSchema,
    frequency: RecurringFrequencySchema,
    interval: z.number().int().min(1).max(365),
    anchorDay: z.number().int().min(1).max(31).nullable(),
    startDate: CalendarDateSchema,
    endDate: CalendarDateSchema.nullable(),
    nextRunDate: CalendarDateSchema,
    lastGeneratedDate: CalendarDateSchema.nullable(),
    isActive: z.boolean(),
    createdAt: IsoUtcDatetimeSchema,
    updatedAt: IsoUtcDatetimeSchema,
  })
  .strict();

export type CreateRecurringInput = z.infer<typeof CreateRecurringSchema>;
export type UpdateRecurringInput = z.infer<typeof UpdateRecurringSchema>;
