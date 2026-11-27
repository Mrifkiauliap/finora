import { z } from 'zod';
import {
  EntityIdSchema,
  IsoUtcDatetimeSchema,
  MonthStringSchema,
  SafePositiveIdrSchema,
  WarningThresholdSchema,
} from './commonSchema';

export const UpsertBudgetSchema = z
  .object({
    categoryId: EntityIdSchema,
    month: MonthStringSchema,
    limitAmount: SafePositiveIdrSchema,
    warningThresholdPct: WarningThresholdSchema.default(80),
  })
  .strict();

export const BudgetRecordSchema = z
  .object({
    id: z.string().uuid(),
    categoryId: EntityIdSchema,
    month: MonthStringSchema,
    limitAmount: SafePositiveIdrSchema,
    warningThresholdPct: WarningThresholdSchema,
    createdAt: IsoUtcDatetimeSchema,
    updatedAt: IsoUtcDatetimeSchema,
  })
  .strict();

export type UpsertBudgetInput = z.infer<typeof UpsertBudgetSchema>;
