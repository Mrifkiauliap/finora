import { db, type FinoraDatabase } from '@/db/database';
import type { CategoryRecord, TransactionType } from '@/db/types';
import { PROTECTED_FALLBACK_CATEGORY_IDS } from '@/domain/constants';
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '@/schemas/categorySchema';
import {
  err,
  generateUuid,
  mapDexieError,
  mapZodError,
  ok,
  ServiceDomainError,
  type ServiceResult,
} from './errors';

export type DeleteCategoryStrategy =
  | { mode: 'direct' }
  | { mode: 'reassign'; targetCategoryId: string; mergeConflictingBudgets: boolean };

export async function listCategories(
  options?: { type?: TransactionType; includeArchived?: boolean },
  database: FinoraDatabase = db
): Promise<ServiceResult<CategoryRecord[]>> {
  try {
    const all = await database.categories.toArray();
    const filtered = all
      .filter((c) => {
        if (options?.type && c.type !== options.type) return false;
        if (!options?.includeArchived && c.isArchived) return false;
        return true;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'id-ID'));

    return ok(filtered);
  } catch (error) {
    return mapDexieError(error);
  }
}

export async function createCategory(
  input: CreateCategoryInput,
  database: FinoraDatabase = db
): Promise<ServiceResult<CategoryRecord>> {
  const parsed = CreateCategorySchema.safeParse(input);
  if (!parsed.success) {
    return mapZodError(parsed.error);
  }

  const data = parsed.data;
  try {
    const created = await database.transaction('rw', database.categories, async () => {
      const sameType = await database.categories.where('type').equals(data.type).toArray();
      const normalized = data.name.trim().toLowerCase();
      if (sameType.some((c) => c.name.trim().toLowerCase() === normalized)) {
        throw new ServiceDomainError({
          code: 'CONFLICT',
          message: `Kategori "${data.name}" sudah ada pada tipe ini.`,
          fieldErrors: { name: ['Nama kategori harus unik dalam tipe yang sama.'] },
        });
      }

      const maxOrder = sameType.reduce((max, c) => Math.max(max, c.sortOrder), 0);
      const nowIso = new Date().toISOString();
      const record: CategoryRecord = {
        id: generateUuid(),
        name: data.name.trim(),
        type: data.type,
        icon: data.icon,
        color: data.color,
        isSystem: false,
        isArchived: false,
        sortOrder: maxOrder + 1,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      await database.categories.add(record);
      return record;
    });

    return ok(created);
  } catch (error) {
    return mapDexieError(error);
  }
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
  database: FinoraDatabase = db
): Promise<ServiceResult<CategoryRecord>> {
  const parsed = UpdateCategorySchema.safeParse(input);
  if (!parsed.success) {
    return mapZodError(parsed.error);
  }

  const data = parsed.data;
  try {
    const updated = await database.transaction('rw', database.categories, async () => {
      const existing = await database.categories.get(id);
      if (!existing) {
        throw new ServiceDomainError({
          code: 'NOT_FOUND',
          message: 'Kategori tidak ditemukan.',
        });
      }

      const sameType = await database.categories.where('type').equals(existing.type).toArray();
      const normalized = data.name.trim().toLowerCase();
      if (sameType.some((c) => c.id !== id && c.name.trim().toLowerCase() === normalized)) {
        throw new ServiceDomainError({
          code: 'CONFLICT',
          message: `Kategori "${data.name}" sudah digunakan.`,
          fieldErrors: { name: ['Nama kategori harus unik dalam tipe yang sama.'] },
        });
      }

      const nextRecord: CategoryRecord = {
        ...existing,
        name: data.name.trim(),
        icon: data.icon,
        color: data.color,
        updatedAt: new Date().toISOString(),
      };
      await database.categories.put(nextRecord);
      return nextRecord;
    });

    return ok(updated);
  } catch (error) {
    return mapDexieError(error);
  }
}

export async function setCategoryArchived(
  id: string,
  isArchived: boolean,
  database: FinoraDatabase = db
): Promise<ServiceResult<CategoryRecord>> {
  if (isArchived && PROTECTED_FALLBACK_CATEGORY_IDS.has(id)) {
    return err(
      'BUSINESS_RULE_VIOLATION',
      'Kategori sistem fallback "Lainnya" tidak boleh diarsipkan.'
    );
  }

  try {
    const existing = await database.categories.get(id);
    if (!existing) {
      return err('NOT_FOUND', 'Kategori tidak ditemukan.');
    }
    const updated: CategoryRecord = {
      ...existing,
      isArchived,
      updatedAt: new Date().toISOString(),
    };
    await database.categories.put(updated);
    return ok(updated);
  } catch (error) {
    return mapDexieError(error);
  }
}

export async function getCategoryUsage(
  id: string,
  database: FinoraDatabase = db
): Promise<
  ServiceResult<{
    transactionsCount: number;
    budgetsCount: number;
    recurringCount: number;
    totalRefs: number;
  }>
> {
  try {
    const [transactionsCount, budgetsCount, recurringCount] = await Promise.all([
      database.transactions.where('categoryId').equals(id).count(),
      database.budgets.where('categoryId').equals(id).count(),
      database.recurringTransactions.where('categoryId').equals(id).count(),
    ]);
    return ok({
      transactionsCount,
      budgetsCount,
      recurringCount,
      totalRefs: transactionsCount + budgetsCount + recurringCount,
    });
  } catch (error) {
    return mapDexieError(error);
  }
}

/**
 * RULE-019 & RULE-020: Penghapusan aman kategori dengan reassignment atomik lintas 3 tabel.
 */
export async function deleteCategoryWithStrategy(
  id: string,
  strategy: DeleteCategoryStrategy,
  database: FinoraDatabase = db
): Promise<ServiceResult<{ reassignedTransactions: number; deletedId: string }>> {
  if (PROTECTED_FALLBACK_CATEGORY_IDS.has(id)) {
    return err(
      'BUSINESS_RULE_VIOLATION',
      'Kategori sistem fallback "Lainnya" dilindungi dan tidak dapat dihapus.'
    );
  }

  try {
    const result = await database.transaction(
      'rw',
      database.categories,
      database.transactions,
      database.budgets,
      database.recurringTransactions,
      async () => {
        const src = await database.categories.get(id);
        if (!src) {
          throw new ServiceDomainError({
            code: 'NOT_FOUND',
            message: 'Kategori tidak ditemukan.',
          });
        }

        const [txs, srcBudgets, srcRecurrings] = await Promise.all([
          database.transactions.where('categoryId').equals(id).toArray(),
          database.budgets.where('categoryId').equals(id).toArray(),
          database.recurringTransactions.where('categoryId').equals(id).toArray(),
        ]);

        const totalRefs = txs.length + srcBudgets.length + srcRecurrings.length;

        if (strategy.mode === 'direct') {
          if (totalRefs > 0) {
            throw new ServiceDomainError({
              code: 'BUSINESS_RULE_VIOLATION',
              message:
                'Kategori masih digunakan oleh transaksi, anggaran, atau jadwal berulang. Arsipkan atau pindahkan ke kategori lain terlebih dahulu.',
            });
          }
          await database.categories.delete(id);
          return { reassignedTransactions: 0, deletedId: id };
        }

        if (strategy.targetCategoryId === id) {
          throw new ServiceDomainError({
            code: 'VALIDATION_ERROR',
            message: 'Kategori tujuan harus berbeda dari kategori yang dihapus.',
          });
        }

        const dst = await database.categories.get(strategy.targetCategoryId);
        if (!dst) {
          throw new ServiceDomainError({
            code: 'NOT_FOUND',
            message: 'Kategori tujuan tidak ditemukan.',
          });
        }
        if (dst.type !== src.type) {
          throw new ServiceDomainError({
            code: 'BUSINESS_RULE_VIOLATION',
            message: 'Kategori tujuan harus memiliki tipe yang sama.',
          });
        }
        if (dst.isArchived) {
          throw new ServiceDomainError({
            code: 'BUSINESS_RULE_VIOLATION',
            message: 'Kategori tujuan tidak boleh dalam status diarsipkan.',
          });
        }

        const nowIso = new Date().toISOString();

        if (txs.length > 0) {
          await database.transactions.bulkPut(
            txs.map((t) => ({ ...t, categoryId: dst.id, updatedAt: nowIso }))
          );
        }

        if (srcRecurrings.length > 0) {
          await database.recurringTransactions.bulkPut(
            srcRecurrings.map((r) => ({ ...r, categoryId: dst.id, updatedAt: nowIso }))
          );
        }

        for (const sb of srcBudgets) {
          const conflict = await database.budgets
            .where('[categoryId+month]')
            .equals([dst.id, sb.month])
            .first();

          if (!conflict) {
            await database.budgets.put({
              ...sb,
              categoryId: dst.id,
              updatedAt: nowIso,
            });
          } else {
            if (strategy.mergeConflictingBudgets) {
              await database.budgets.put({
                ...conflict,
                limitAmount: Math.min(999_999_999_999, conflict.limitAmount + sb.limitAmount),
                updatedAt: nowIso,
              });
            }
            await database.budgets.delete(sb.id);
          }
        }

        await database.categories.delete(id);
        return { reassignedTransactions: txs.length, deletedId: id };
      }
    );

    return ok(result);
  } catch (error) {
    return mapDexieError(error);
  }
}
