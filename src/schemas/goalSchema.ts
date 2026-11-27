import { z } from 'zod';
import { MAX_IDR_AMOUNT } from '@/domain/constants';
import {
  CalendarDateSchema,
  CategoryIconSchema,
  HexColorSchema,
  IsoUtcDatetimeSchema,
  SafeNonNegativeIdrSchema,
  SafePositiveIdrSchema,
} from './commonSchema';

export const GoalStatusSchema = z.enum(['active', 'completed', 'paused']);

export const CreateGoalSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Nama target wajib diisi.')
      .max(80, 'Nama target maksimal 80 karakter.'),
    targetAmount: SafePositiveIdrSchema,
    deadline: CalendarDateSchema.nullable().default(null),
    icon: CategoryIconSchema.default('target'),
    color: HexColorSchema.default('#10B981'),
    note: z.string().trim().max(500, 'Catatan maksimal 500 karakter.').default(''),
  })
  .strict();

export const UpdateGoalSchema = CreateGoalSchema.extend({
  status: GoalStatusSchema.optional(),
}).strict();

export const GoalContributionInputSchema = z
  .object({
    goalId: z.string().uuid(),
    amount: z
      .number({
        required_error: 'Nominal kontribusi wajib diisi.',
        invalid_type_error: 'Nominal harus berupa angka bulat.',
      })
      .int('Nominal harus bilangan bulat.')
      .refine((v) => Number.isSafeInteger(v) && v !== 0, 'Nominal kontribusi tidak boleh nol.')
      .refine(
        (v) => Math.abs(v) <= MAX_IDR_AMOUNT,
        'Nominal melebihi batas maksimum Rp 999.999.999.999.'
      ),
    date: CalendarDateSchema,
    note: z.string().trim().max(250, 'Catatan maksimal 250 karakter.').default(''),
  })
  .strict();

export const FinancialGoalRecordSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().trim().min(1).max(80),
    targetAmount: SafePositiveIdrSchema,
    currentAmount: SafeNonNegativeIdrSchema,
    deadline: CalendarDateSchema.nullable(),
    status: GoalStatusSchema,
    icon: CategoryIconSchema,
    color: HexColorSchema,
    note: z.string().trim().max(500),
    createdAt: IsoUtcDatetimeSchema,
    updatedAt: IsoUtcDatetimeSchema,
  })
  .strict();

export const GoalContributionRecordSchema = z
  .object({
    id: z.string().uuid(),
    goalId: z.string().uuid(),
    amount: z
      .number()
      .int()
      .refine((v) => Number.isSafeInteger(v) && v !== 0 && Math.abs(v) <= MAX_IDR_AMOUNT),
    date: CalendarDateSchema,
    note: z.string().trim().max(250),
    createdAt: IsoUtcDatetimeSchema,
  })
  .strict();

export type CreateGoalInput = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalInput = z.infer<typeof UpdateGoalSchema>;
export type GoalContributionInput = z.infer<typeof GoalContributionInputSchema>;
