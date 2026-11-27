import { db, type FinoraDatabase } from '@/db/database';
import type {
  RecurringRuleView,
  RecurringTransactionRecord,
  TransactionRecord,
} from '@/db/types';
import { MAX_RECURRING_CATCHUP } from '@/domain/constants';
import {
  computeNextOccurrenceDate,
  extractDayOfMonth,
  getLocalToday,
  previewNextOccurrences,
} from '@/domain/dates';
import {
  CreateRecurringSchema,
  UpdateRecurringSchema,
  type CreateRecurringInput,
  type UpdateRecurringInput,
} from '@/schemas/recurringSchema';
import {
  err,
  generateUuid,
  mapDexieError,
  mapZodError,
  ok,
  ServiceDomainError,
  type ServiceResult,
} from './errors';

export async function listRecurringRules(
  database: FinoraDatabase = db
): Promise<ServiceResult<RecurringRuleView[]>> {
  try {
    const [rules, categories] = await Promise.all([
      database.recurringTransactions.orderBy('createdAt').reverse().toArray(),
      database.categories.toArray(),
    ]);
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const views: RecurringRuleView[] = rules.map((r) => {
      const cat = categoryMap.get(r.categoryId);
      return {
        ...r,
        categoryName: cat?.name ?? 'Kategori Dihapus',
        categoryIcon: cat?.icon ?? 'tag',
        categoryColor: cat?.color ?? '#94A3B8',
        upcomingDates: r.isActive ? previewNextOccurrences(r, 3) : [],
      };
    });

    return ok(views);
  } catch (error) {
    return mapDexieError(error);
  }
}

export async function createRecurringRule(
  input: CreateRecurringInput,
  database: FinoraDatabase = db
): Promise<ServiceResult<RecurringTransactionRecord>> {
  const parsed = CreateRecurringSchema.safeParse(input);
  if (!parsed.success) {
    return mapZodError(parsed.error);
  }

  const data = parsed.data;
  try {
    const record = await database.transaction(
      'rw',
      database.categories,
      database.recurringTransactions,
      async () => {
        const category = await database.categories.get(data.categoryId);
        if (!category) {
          throw new ServiceDomainError({
            code: 'NOT_FOUND',
            message: 'Kategori yang dipilih tidak ditemukan.',
            fieldErrors: { categoryId: ['Kategori tidak ditemukan.'] },
          });
        }
        if (category.type !== data.type) {
          throw new ServiceDomainError({
            code: 'BUSINESS_RULE_VIOLATION',
            message: 'Tipe kategori tidak cocok dengan tipe aturan berulang.',
            fieldErrors: { categoryId: ['Kategori harus sesuai dengan tipe transaksi.'] },
          });
        }
        if (category.isArchived) {
          throw new ServiceDomainError({
            code: 'BUSINESS_RULE_VIOLATION',
            message: 'Kategori yang diarsipkan tidak dapat dipilih untuk aturan baru.',
            fieldErrors: { categoryId: ['Kategori sudah diarsipkan.'] },
          });
        }

        const nowIso = new Date().toISOString();
        const anchorDay =
          data.frequency === 'monthly' ? extractDayOfMonth(data.startDate) : null;

        const newRule: RecurringTransactionRecord = {
          id: generateUuid(),
          type: data.type,
          amount: data.amount,
          categoryId: data.categoryId,
          note: data.note,
          paymentMethod: data.paymentMethod,
          frequency: data.frequency,
          interval: data.interval,
          anchorDay,
          startDate: data.startDate,
          endDate: data.endDate,
          nextRunDate: data.startDate,
          lastGeneratedDate: null,
          isActive: true,
          createdAt: nowIso,
          updatedAt: nowIso,
        };

        await database.recurringTransactions.add(newRule);
        return newRule;
      }
    );

    return ok(record);
  } catch (error) {
    return mapDexieError(error);
  }
}

export async function updateRecurringRule(
  id: string,
  input: UpdateRecurringInput,
  database: FinoraDatabase = db
): Promise<ServiceResult<RecurringTransactionRecord>> {
  const parsed = UpdateRecurringSchema.safeParse(input);
  if (!parsed.success) {
    return mapZodError(parsed.error);
  }

  const data = parsed.data;
  try {
    const updated = await database.transaction(
      'rw',
      database.categories,
      database.recurringTransactions,
      async () => {
        const existing = await database.recurringTransactions.get(id);
        if (!existing) {
          throw new ServiceDomainError({
            code: 'NOT_FOUND',
            message: 'Aturan transaksi berulang tidak ditemukan.',
          });
        }

        const category = await database.categories.get(data.categoryId);
        if (!category || category.type !== data.type) {
          throw new ServiceDomainError({
            code: 'BUSINESS_RULE_VIOLATION',
            message: 'Kategori tidak valid atau tipenya tidak sesuai.',
            fieldErrors: { categoryId: ['Kategori harus cocok dengan tipe aturan.'] },
          });
        }
        if (category.isArchived && data.categoryId !== existing.categoryId) {
          throw new ServiceDomainError({
            code: 'BUSINESS_RULE_VIOLATION',
            message: 'Kategori yang diarsipkan tidak dapat dipilih.',
            fieldErrors: { categoryId: ['Kategori sudah diarsipkan.'] },
          });
        }

        const anchorDay =
          data.frequency === 'monthly' ? extractDayOfMonth(data.startDate) : null;

        // Jika startDate diubah lebih maju dari nextRunDate atau belum pernah digenerate, sinkronkan nextRunDate
        let nextRunDate = existing.nextRunDate;
        if (!existing.lastGeneratedDate) {
          nextRunDate = data.startDate;
        } else if (nextRunDate < data.startDate) {
          nextRunDate = data.startDate;
        }

        const isActive =
          data.endDate && nextRunDate > data.endDate ? false : existing.isActive;

        const nextRecord: RecurringTransactionRecord = {
          ...existing,
          type: data.type,
          amount: data.amount,
          categoryId: data.categoryId,
          note: data.note,
          paymentMethod: data.paymentMethod,
          frequency: data.frequency,
          interval: data.interval,
          anchorDay,
          startDate: data.startDate,
          endDate: data.endDate,
          nextRunDate,
          isActive,
          updatedAt: new Date().toISOString(),
        };

        await database.recurringTransactions.put(nextRecord);
        return nextRecord;
      }
    );

    return ok(updated);
  } catch (error) {
    return mapDexieError(error);
  }
}

export async function toggleRecurringRule(
  id: string,
  isActive: boolean,
  database: FinoraDatabase = db
): Promise<ServiceResult<RecurringTransactionRecord>> {
  try {
    const existing = await database.recurringTransactions.get(id);
    if (!existing) {
      return err('NOT_FOUND', 'Aturan transaksi berulang tidak ditemukan.');
    }

    if (isActive && existing.endDate && existing.nextRunDate > existing.endDate) {
      return err(
        'BUSINESS_RULE_VIOLATION',
        'Aturan sudah melewati tanggal berakhir (endDate) dan tidak dapat diaktifkan kembali tanpa mengubah tanggal berakhir.'
      );
    }

    const updated: RecurringTransactionRecord = {
      ...existing,
      isActive,
      updatedAt: new Date().toISOString(),
    };
    await database.recurringTransactions.put(updated);
    return ok(updated);
  } catch (error) {
    return mapDexieError(error);
  }
}

export async function deleteRecurringRule(
  id: string,
  database: FinoraDatabase = db
): Promise<ServiceResult<{ deletedId: string }>> {
  try {
    const existing = await database.recurringTransactions.get(id);
    if (!existing) {
      return err('NOT_FOUND', 'Aturan transaksi berulang tidak ditemukan.');
    }
    // RULE-016: Menghapus aturan tidak menghapus transaksi historis yang sudah terbentuk
    await database.recurringTransactions.delete(id);
    return ok({ deletedId: id });
  } catch (error) {
    return mapDexieError(error);
  }
}

/**
 * RULE-014, RULE-015, RULE-016: Materialisasi lokal idempoten untuk aturan jatuh tempo.
 */
export async function materializeDueTransactions(
  today: string = getLocalToday(),
  database: FinoraDatabase = db
): Promise<ServiceResult<{ generatedCount: number; cappedRuleIds: string[] }>> {
  try {
    let generatedCount = 0;
    const cappedRuleIds: string[] = [];

    const allRules = await database.recurringTransactions.toArray();
    const dueRules = allRules.filter((r) => r.isActive && r.nextRunDate <= today);

    for (const rule of dueRules) {
      await database.transaction(
        'rw',
        database.recurringTransactions,
        database.transactions,
        async () => {
          const freshRule = await database.recurringTransactions.get(rule.id);
          if (!freshRule || !freshRule.isActive) return;

          let cursor = freshRule.nextRunDate;
          let lastGenerated = freshRule.lastGeneratedDate;
          let active: boolean = freshRule.isActive;
          let iterations = 0;

          while (active && cursor <= today) {
            if (freshRule.endDate && cursor > freshRule.endDate) {
              active = false;
              break;
            }
            if (iterations >= MAX_RECURRING_CATCHUP) {
              cappedRuleIds.push(freshRule.id);
              break;
            }

            // RULE-015: Idempotency check via compound index
            const existingOcc = await database.transactions
              .where('[recurringRuleId+recurringOccurrenceDate]')
              .equals([freshRule.id, cursor])
              .first();

            if (!existingOcc) {
              const nowIso = new Date().toISOString();
              const tx: TransactionRecord = {
                id: generateUuid(),
                type: freshRule.type,
                amount: freshRule.amount,
                categoryId: freshRule.categoryId,
                date: cursor,
                note: freshRule.note,
                paymentMethod: freshRule.paymentMethod,
                recurringRuleId: freshRule.id,
                recurringOccurrenceDate: cursor,
                createdAt: nowIso,
                updatedAt: nowIso,
              };
              await database.transactions.add(tx);
              generatedCount += 1;
            }

            lastGenerated = cursor;
            iterations += 1;
            cursor = computeNextOccurrenceDate(freshRule, cursor);

            if (freshRule.endDate && cursor > freshRule.endDate) {
              active = false;
            }
          }

          await database.recurringTransactions.put({
            ...freshRule,
            nextRunDate: cursor,
            lastGeneratedDate: lastGenerated,
            isActive: active,
            updatedAt: new Date().toISOString(),
          });
        }
      );
    }

    return ok({ generatedCount, cappedRuleIds });
  } catch (error) {
    return mapDexieError(error);
  }
}
