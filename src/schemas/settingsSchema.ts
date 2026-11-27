import { z } from 'zod';
import { IsoUtcDatetimeSchema, WarningThresholdSchema } from './commonSchema';

export const ThemePreferenceSchema = z.enum(['dark', 'light', 'system']);

export const UpdateSettingsSchema = z
  .object({
    theme: ThemePreferenceSchema.optional(),
    firstDayOfWeek: z.union([z.literal(0), z.literal(1)]).optional(),
    defaultWarningThresholdPct: WarningThresholdSchema.optional(),
    showBalancesMasked: z.boolean().optional(),
  })
  .strict();

export const AppSettingsRecordSchema = z
  .object({
    id: z.literal('default'),
    theme: ThemePreferenceSchema,
    currency: z.literal('IDR'),
    locale: z.literal('id-ID'),
    firstDayOfWeek: z.union([z.literal(0), z.literal(1)]),
    defaultWarningThresholdPct: WarningThresholdSchema,
    showBalancesMasked: z.boolean(),
    lastBackupAt: IsoUtcDatetimeSchema.nullable(),
    onboardingCompleted: z.boolean(),
    schemaMetaVersion: z.number().int().min(1),
    updatedAt: IsoUtcDatetimeSchema,
  })
  .strict();

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
