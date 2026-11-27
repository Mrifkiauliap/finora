import { z } from 'zod';
import {
  CalendarDateSchema,
  EntityIdSchema,
  IsoUtcDatetimeSchema,
  PaymentMethodSchema,
  SafePositiveIdrSchema,
  TransactionTypeSchema,
} from './commonSchema';

export const CreateTransactionSchema = z
  .object({
    type: TransactionTypeSchema,
    amount: SafePositiveIdrSchema,
    categoryId: EntityIdSchema,
    date: CalendarDateSchema,
    note: z.string().trim().max(500, 'Catatan maksimal 500 karakter.').default(''),
    paymentMethod: PaymentMethodSchema,
  })
  .strict();

export const UpdateTransactionSchema = CreateTransactionSchema;

export const TransactionRecordSchema = z
  .object({
    id: z.string().uuid(),
    type: TransactionTypeSchema,
    amount: SafePositiveIdrSchema,
    categoryId: EntityIdSchema,
    date: CalendarDateSchema,
    note: z.string().trim().max(500),
    paymentMethod: PaymentMethodSchema,
    recurringRuleId: z.string().uuid().nullable(),
    recurringOccurrenceDate: CalendarDateSchema.nullable(),
    createdAt: IsoUtcDatetimeSchema,
    updatedAt: IsoUtcDatetimeSchema,
  })
  .strict()
  .refine(
    (rec) =>
      (rec.recurringRuleId === null && rec.recurringOccurrenceDate === null) ||
      (rec.recurringRuleId !== null && rec.recurringOccurrenceDate !== null),
    'Metadata recurringRuleId dan recurringOccurrenceDate harus konsisten.'
  );

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;
