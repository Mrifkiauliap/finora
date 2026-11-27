import { db, type FinoraDatabase } from '@/db/database';
import type { BudgetEvaluationView, BudgetRecord } from '@/db/types';
import { getMonthDateBounds, shiftMonth } from '@/domain/dates';
import { calculateBudgetMetrics } from '@/domain/financeCalculators';
import { MonthStringSchema } from '@/schemas/commonSchema';
import { UpsertBudgetSchema, type UpsertBudgetInput } from '@/schemas/budgetSchema';
import {
  err,
  generateUuid,
  mapDexieError,
  mapZodError,
  ok,
  ServiceDomainError,
  type ServiceResult,
} from './errors';

export interface MonthlyBudgetSummary {
  month: string;
  budgets: BudgetEvaluationView[];
  totalLimit: number;
  totalSpentOnBudgeted: number;
  totalRemaining: number;
}

export async function listMonthlyBudgets(
  month: string,
  database: FinoraDatabase = db
): Promise<ServiceResult<MonthlyBudgetSummary>> {
  const parsedMonth = MonthStringSchema.safeParse(month);
  if (!parsedMonth.success) {
    return mapZodError(parsedMonth.error);
  }

  try {
    const { startDate, endDate } = getMonthDateBounds(month);
    const [budgets, monthExpenses, categories] = await Promise.all([
      database.budgets.where('month').equals(month).toArray(),
      database.transactions
        .where('[type+date]')
        .between(['expense', startDate], ['expense', endDate], true, true)
        .toArray(),
      database.categories.toArray(),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const spentByCategory = new Map<string, number>();
    for (const tx of monthExpenses) {
      spentByCategory.set(tx.categoryId, (spentByCategory.get(tx.categoryId) ?? 0) + tx.amount);
    }

    const evaluated: BudgetEvaluationView[] = budgets.map((b) => {
      const cat = categoryMap.get(b.categoryId);
      const spent = spentByCategory.get(b.categoryId) ?? 0;
      const metrics = calculateBudgetMetrics(b.limitAmount, spent, b.warningThresholdPct);
      return {
        ...b,
        categoryName: cat?.name ?? 'Kategori',
        categoryIcon: cat?.icon ?? 'tag',
        categoryColor: cat?.color ?? '#94A3B8',
        spentAmount: metrics.spentAmount,
        remainingAmount: metrics.remainingAmount,
        utilizationPct: metrics.utilizationPct,
        status: metrics.status,
      };
    });

    const statusPriority = { exceeded: 0, warning: 1, safe: 2 } as const;
    evaluated.sort(
      (a, b) =>
        statusPriority[a.status] - statusPriority[b.status] ||
        b.utilizationPct - a.utilizationPct
    );

    const totalLimit = evaluated.reduce((s, b) => s + b.limitAmount, 0);
    const totalSpentOnBudgeted = evaluated.reduce((s, b) => s + b.spentAmount, 0);

    return ok({
      month,
      budgets: evaluated,
      totalLimit,
      totalSpentOnBudgeted,
      totalRemaining: totalLimit - totalSpentOnBudgeted,
    });
  } catch (error) {
    return mapDexieError(error);
  }
}

export async function upsertBudget(
  input: UpsertBudgetInput,
  database: FinoraDatabase = db
): Promise<ServiceResult<BudgetRecord>> {
  const parsed = UpsertBudgetSchema.safeParse(input);
  if (!parsed.success) {
    return mapZodError(parsed.error);
  }

  const data = parsed.data;
  try {
    const saved = await database.transaction(
      'rw',
      database.categories,
      database.budgets,
      async () => {
        const category = await database.categories.get(data.categoryId);
        if (!category) {
          throw new ServiceDomainError({
            code: 'NOT_FOUND',
            message: 'Kategori tidak ditemukan.',
            fieldErrors: { categoryId: ['Kategori tidak ditemukan.'] },
          });
        }
        if (category.type !== 'expense') {
          throw new ServiceDomainError({
            code: 'BUSINESS_RULE_VIOLATION',
            message: 'Anggaran hanya dapat ditetapkan untuk kategori pengeluaran.',
            fieldErrors: { categoryId: ['Pilih kategori bertipe pengeluaran.'] },
          });
        }

        const existing = await database.budgets
          .where('[categoryId+month]')
          .equals([data.categoryId, data.month])
          .first();

        if (!existing && category.isArchived) {
          throw new ServiceDomainError({
            code: 'BUSINESS_RULE_VIOLATION',
            message: 'Kategori yang diarsipkan tidak dapat dibuatkan anggaran baru.',
            fieldErrors: { categoryId: ['Kategori sudah diarsipkan.'] },
          });
        }

        const nowIso = new Date().toISOString();
        const record: BudgetRecord = existing
          ? {
              ...existing,
              limitAmount: data.limitAmount,
              warningThresholdPct: data.warningThresholdPct,
              updatedAt: nowIso,
            }
          : {
              id: generateUuid(),
              categoryId: data.categoryId,
              month: data.month,
              limitAmount: data.limitAmount,
              warningThresholdPct: data.warningThresholdPct,
              createdAt: nowIso,
              updatedAt: nowIso,
            };

        await database.budgets.put(record);
        return record;
      }
    );

    return ok(saved);
  } catch (error) {
    return mapDexieError(error);
  }
}

export async function deleteBudget(
  id: string,
  database: FinoraDatabase = db
): Promise<ServiceResult<{ deletedId: string }>> {
  try {
    const existing = await database.budgets.get(id);
    if (!existing) {
      return err('NOT_FOUND', 'Anggaran tidak ditemukan.');
    }
    await database.budgets.delete(id);
    return ok({ deletedId: id });
  } catch (error) {
    return mapDexieError(error);
  }
}

/**
 * RULE-011: Menyalin anggaran dari bulan sebelumnya untuk kategori aktif yang belum memiliki budget di bulan target.
 */
export async function copyBudgetsFromPreviousMonth(
  targetMonth: string,
  database: FinoraDatabase = db
): Promise<ServiceResult<{ copiedCount: number; skippedCount: number }>> {
  const parsedMonth = MonthStringSchema.safeParse(targetMonth);
  if (!parsedMonth.success) {
    return mapZodError(parsedMonth.error);
  }

  try {
    const prevMonth = shiftMonth(targetMonth, -1);
    const result = await database.transaction(
      'rw',
      database.categories,
      database.budgets,
      async () => {
        const [prevBudgets, targetBudgets, categories] = await Promise.all([
          database.budgets.where('month').equals(prevMonth).toArray(),
          database.budgets.where('month').equals(targetMonth).toArray(),
          database.categories.toArray(),
        ]);

        const categoryMap = new Map(categories.map((c) => [c.id, c]));
        const existingTargetCategories = new Set(targetBudgets.map((b) => b.categoryId));
        const nowIso = new Date().toISOString();

        const toInsert: BudgetRecord[] = [];
        let skippedCount = 0;

        for (const pb of prevBudgets) {
          const cat = categoryMap.get(pb.categoryId);
          if (
            !cat ||
            cat.isArchived ||
            cat.type !== 'expense' ||
            existingTargetCategories.has(pb.categoryId)
          ) {
            skippedCount += 1;
            continue;
          }
          toInsert.push({
            id: generateUuid(),
            categoryId: pb.categoryId,
            month: targetMonth,
            limitAmount: pb.limitAmount,
            warningThresholdPct: pb.warningThresholdPct,
            createdAt: nowIso,
            updatedAt: nowIso,
          });
        }

        if (toInsert.length > 0) {
          await database.budgets.bulkAdd(toInsert);
        }

        return { copiedCount: toInsert.length, skippedCount };
      }
    );

    return ok(result);
  } catch (error) {
    return mapDexieError(error);
  }
}
