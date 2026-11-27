import { db, type FinoraDatabase } from '@/db/database';
import type {
  PaymentMethod,
  TransactionRecord,
  TransactionType,
  TransactionView,
} from '@/db/types';
import { calculateCashflowSummary } from '@/domain/financeCalculators';
import {
  CreateTransactionSchema,
  UpdateTransactionSchema,
  type CreateTransactionInput,
  type UpdateTransactionInput,
} from '@/schemas/transactionSchema';
import {
  err,
  generateUuid,
  mapDexieError,
  mapZodError,
  ok,
  ServiceDomainError,
  type ServiceResult,
} from './errors';

export interface TransactionFilterInput {
  startDate?: string;
  endDate?: string;
  type?: TransactionType | 'all';
  categoryId?: string | 'all';
  paymentMethod?: PaymentMethod | 'all';
  search?: string;
  sortBy?: 'date' | 'amount';
  sortDir?: 'desc' | 'asc';
  page?: number;
  pageSize?: number;
}

export interface TransactionQueryResult {
  items: TransactionView[];
  totalCount: number;
  summary: {
    totalIncome: number;
    totalExpense: number;
    netCashflow: number;
  };
}

export async function createTransaction(
  input: CreateTransactionInput,
  database: FinoraDatabase = db
): Promise<ServiceResult<TransactionRecord>> {
  const parsed = CreateTransactionSchema.safeParse(input);
  if (!parsed.success) {
    return mapZodError(parsed.error);
  }

  const data = parsed.data;
  try {
    const created = await database.transaction(
      'rw',
      database.categories,
      database.transactions,
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
            message: 'Tipe kategori tidak cocok dengan tipe transaksi.',
            fieldErrors: { categoryId: ['Pilih kategori yang sesuai tipe transaksi.'] },
          });
        }
        if (category.isArchived) {
          throw new ServiceDomainError({
            code: 'BUSINESS_RULE_VIOLATION',
            message: 'Kategori yang sudah diarsipkan tidak dapat dipakai untuk transaksi baru.',
            fieldErrors: { categoryId: ['Kategori sudah diarsipkan.'] },
          });
        }

        const nowIso = new Date().toISOString();
        const record: TransactionRecord = {
          id: generateUuid(),
          type: data.type,
          amount: data.amount,
          categoryId: data.categoryId,
          date: data.date,
          note: data.note,
          paymentMethod: data.paymentMethod,
          recurringRuleId: null,
          recurringOccurrenceDate: null,
          createdAt: nowIso,
          updatedAt: nowIso,
        };

        await database.transactions.add(record);
        return record;
      }
    );

    return ok(created);
  } catch (error) {
    return mapDexieError(error);
  }
}

export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput,
  database: FinoraDatabase = db
): Promise<ServiceResult<TransactionRecord>> {
  const parsed = UpdateTransactionSchema.safeParse(input);
  if (!parsed.success) {
    return mapZodError(parsed.error);
  }

  const data = parsed.data;
  try {
    const updated = await database.transaction(
      'rw',
      database.categories,
      database.transactions,
      async () => {
        const existing = await database.transactions.get(id);
        if (!existing) {
          throw new ServiceDomainError({
            code: 'NOT_FOUND',
            message: 'Transaksi tidak ditemukan.',
          });
        }

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
            message: 'Tipe kategori tidak cocok dengan tipe transaksi.',
            fieldErrors: { categoryId: ['Kategori harus cocok dengan tipe transaksi.'] },
          });
        }
        // RULE-006: Kategori arsip boleh tetap dipakai jika kategori transaksi tidak diubah
        if (category.isArchived && data.categoryId !== existing.categoryId) {
          throw new ServiceDomainError({
            code: 'BUSINESS_RULE_VIOLATION',
            message: 'Kategori yang diarsipkan tidak dapat dipilih sebagai kategori baru.',
            fieldErrors: { categoryId: ['Kategori sudah diarsipkan.'] },
          });
        }

        const nextRecord: TransactionRecord = {
          ...existing,
          type: data.type,
          amount: data.amount,
          categoryId: data.categoryId,
          date: data.date,
          note: data.note,
          paymentMethod: data.paymentMethod,
          updatedAt: new Date().toISOString(),
        };

        await database.transactions.put(nextRecord);
        return nextRecord;
      }
    );

    return ok(updated);
  } catch (error) {
    return mapDexieError(error);
  }
}

export async function deleteTransaction(
  id: string,
  database: FinoraDatabase = db
): Promise<ServiceResult<{ deletedId: string }>> {
  try {
    const existing = await database.transactions.get(id);
    if (!existing) {
      return err('NOT_FOUND', 'Transaksi tidak ditemukan.');
    }
    await database.transactions.delete(id);
    return ok({ deletedId: id });
  } catch (error) {
    return mapDexieError(error);
  }
}

export async function getTransactionById(
  id: string,
  database: FinoraDatabase = db
): Promise<ServiceResult<TransactionView>> {
  try {
    const tx = await database.transactions.get(id);
    if (!tx) {
      return err('NOT_FOUND', 'Transaksi tidak ditemukan.');
    }
    const category = await database.categories.get(tx.categoryId);
    return ok({
      ...tx,
      categoryName: category?.name ?? 'Lainnya',
      categoryIcon: category?.icon ?? 'tag',
      categoryColor: category?.color ?? '#94A3B8',
      categoryArchived: category?.isArchived ?? false,
    });
  } catch (error) {
    return mapDexieError(error);
  }
}

export async function queryTransactions(
  filter: TransactionFilterInput = {},
  database: FinoraDatabase = db
): Promise<ServiceResult<TransactionQueryResult>> {
  if (filter.startDate && filter.endDate && filter.startDate > filter.endDate) {
    return err(
      'VALIDATION_ERROR',
      'Tanggal mulai tidak boleh lebih besar dari tanggal akhir.',
      { startDate: ['Rentang tanggal tidak valid.'] }
    );
  }

  try {
    const [rawTxs, categories] = await Promise.all([
      filter.startDate && filter.endDate
        ? database.transactions
            .where('date')
            .between(filter.startDate, filter.endDate, true, true)
            .toArray()
        : database.transactions.toArray(),
      database.categories.toArray(),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const searchLower = filter.search?.trim().toLowerCase() ?? '';

    const matched: TransactionView[] = [];
    for (const tx of rawTxs) {
      if (filter.startDate && tx.date < filter.startDate) continue;
      if (filter.endDate && tx.date > filter.endDate) continue;
      if (filter.type && filter.type !== 'all' && tx.type !== filter.type) continue;
      if (filter.categoryId && filter.categoryId !== 'all' && tx.categoryId !== filter.categoryId) {
        continue;
      }
      if (
        filter.paymentMethod &&
        filter.paymentMethod !== 'all' &&
        tx.paymentMethod !== filter.paymentMethod
      ) {
        continue;
      }

      const cat = categoryMap.get(tx.categoryId);
      const categoryName = cat?.name ?? 'Lainnya';

      if (searchLower) {
        const noteMatch = tx.note.toLowerCase().includes(searchLower);
        const catMatch = categoryName.toLowerCase().includes(searchLower);
        if (!noteMatch && !catMatch) continue;
      }

      matched.push({
        ...tx,
        categoryName,
        categoryIcon: cat?.icon ?? 'tag',
        categoryColor: cat?.color ?? '#94A3B8',
        categoryArchived: cat?.isArchived ?? false,
      });
    }

    const sortBy = filter.sortBy ?? 'date';
    const sortDir = filter.sortDir ?? 'desc';
    matched.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'amount') {
        cmp = a.amount - b.amount;
      } else {
        cmp = a.date.localeCompare(b.date);
        if (cmp === 0) {
          cmp = a.createdAt.localeCompare(b.createdAt);
        }
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    const summaryRaw = calculateCashflowSummary(matched);
    const totalCount = matched.length;

    let items = matched;
    if (filter.page !== undefined && filter.pageSize !== undefined && filter.pageSize > 0) {
      const start = Math.max(0, (filter.page - 1) * filter.pageSize);
      items = matched.slice(start, start + filter.pageSize);
    }

    return ok({
      items,
      totalCount,
      summary: {
        totalIncome: summaryRaw.totalIncome,
        totalExpense: summaryRaw.totalExpense,
        netCashflow: summaryRaw.netCashflow,
      },
    });
  } catch (error) {
    return mapDexieError(error);
  }
}
