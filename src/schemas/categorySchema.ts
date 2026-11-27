import { z } from 'zod';
import {
  CategoryIconSchema,
  EntityIdSchema,
  HexColorSchema,
  IsoUtcDatetimeSchema,
  TransactionTypeSchema,
} from './commonSchema';

export const CreateCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Nama kategori wajib diisi.')
      .max(50, 'Nama kategori maksimal 50 karakter.'),
    type: TransactionTypeSchema,
    icon: CategoryIconSchema,
    color: HexColorSchema,
  })
  .strict();

export const UpdateCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Nama kategori wajib diisi.')
      .max(50, 'Nama kategori maksimal 50 karakter.'),
    icon: CategoryIconSchema,
    color: HexColorSchema,
  })
  .strict();

export const CategoryRecordSchema = z
  .object({
    id: EntityIdSchema,
    name: z.string().trim().min(1).max(50),
    type: TransactionTypeSchema,
    icon: CategoryIconSchema,
    color: HexColorSchema,
    isSystem: z.boolean(),
    isArchived: z.boolean(),
    sortOrder: z.number().int().min(0).max(10_000),
    createdAt: IsoUtcDatetimeSchema,
    updatedAt: IsoUtcDatetimeSchema,
  })
  .strict();

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
