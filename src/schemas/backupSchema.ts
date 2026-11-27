import { z } from 'zod';
import { BudgetRecordSchema } from './budgetSchema';
import { CategoryRecordSchema } from './categorySchema';
import { IsoUtcDatetimeSchema } from './commonSchema';
import { FinancialGoalRecordSchema, GoalContributionRecordSchema } from './goalSchema';
import { RecurringTransactionRecordSchema } from './recurringSchema';
import { AppSettingsRecordSchema } from './settingsSchema';
import { TransactionRecordSchema } from './transactionSchema';

export const BackupPayloadV1Schema = z
  .object({
    transactions: z.array(TransactionRecordSchema),
    categories: z.array(CategoryRecordSchema),
    budgets: z.array(BudgetRecordSchema),
    financialGoals: z.array(FinancialGoalRecordSchema),
    goalContributions: z.array(GoalContributionRecordSchema),
    recurringTransactions: z.array(RecurringTransactionRecordSchema),
    appSettings: z.array(AppSettingsRecordSchema).max(1),
  })
  .strict()
  .superRefine((payload, ctx) => {
    const categoryMap = new Map(payload.categories.map((c) => [c.id, c]));
    const goalIds = new Set(payload.financialGoals.map((g) => g.id));

    for (let i = 0; i < payload.transactions.length; i++) {
      const tx = payload.transactions[i]!;
      const cat = categoryMap.get(tx.categoryId);
      if (!cat) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Transaksi ${tx.id} merujuk kategori tidak dikenal (${tx.categoryId}).`,
          path: ['transactions', i, 'categoryId'],
        });
      } else if (cat.type !== tx.type) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Tipe transaksi ${tx.id} tidak cocok dengan tipe kategori ${cat.name}.`,
          path: ['transactions', i, 'categoryId'],
        });
      }
    }

    const seenBudgetKeys = new Set<string>();
    for (let i = 0; i < payload.budgets.length; i++) {
      const b = payload.budgets[i]!;
      const cat = categoryMap.get(b.categoryId);
      if (!cat || cat.type !== 'expense') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Anggaran ${b.id} harus merujuk kategori pengeluaran yang valid.`,
          path: ['budgets', i, 'categoryId'],
        });
      }
      const key = `${b.categoryId}::${b.month}`;
      if (seenBudgetKeys.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplikasi anggaran pada kategori ${b.categoryId} dan bulan ${b.month}.`,
          path: ['budgets', i],
        });
      }
      seenBudgetKeys.add(key);
    }

    for (let i = 0; i < payload.goalContributions.length; i++) {
      const c = payload.goalContributions[i]!;
      if (!goalIds.has(c.goalId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Kontribusi target ${c.id} merujuk target tidak dikenal (${c.goalId}).`,
          path: ['goalContributions', i, 'goalId'],
        });
      }
    }

    for (let i = 0; i < payload.recurringTransactions.length; i++) {
      const r = payload.recurringTransactions[i]!;
      const cat = categoryMap.get(r.categoryId);
      if (!cat || cat.type !== r.type) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Aturan berulang ${r.id} merujuk kategori tidak valid atau beda tipe.`,
          path: ['recurringTransactions', i, 'categoryId'],
        });
      }
    }
  });

export const BackupEnvelopeV1Schema = z
  .object({
    appName: z.literal('Finora'),
    backupFormatVersion: z.literal(1),
    dbSchemaVersion: z.number().int().min(1),
    exportedAt: IsoUtcDatetimeSchema,
    checksum: z
      .object({
        algorithm: z.literal('SHA-256'),
        value: z.string().regex(/^[a-f0-9]{64}$/, 'Format SHA-256 checksum tidak valid.'),
      })
      .strict(),
    payload: BackupPayloadV1Schema,
  })
  .strict();
