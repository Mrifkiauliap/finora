import { format } from 'date-fns';
import { CURRENT_DB_SCHEMA_VERSION, db, type FinoraDatabase } from '@/db/database';
import { buildDefaultAppSettings } from '@/db/seed';
import type { BackupEnvelopeV1, BackupPayloadV1, BudgetRecord } from '@/db/types';
import {
  canonicalStringify,
  computeSha256Hex,
  hasDangerousPrototypeKeys,
  objectHasDangerousKeys,
} from '@/domain/canonicalJson';
import { MAX_BACKUP_FILE_BYTES } from '@/domain/constants';
import { BackupEnvelopeV1Schema } from '@/schemas/backupSchema';
import { err, mapDexieError, mapZodError, ok, type ServiceResult } from './errors';

export interface BackupPreview {
  envelope: BackupEnvelopeV1;
  exportedAt: string;
  backupFormatVersion: number;
  dbSchemaVersion: number;
  counts: {
    transactions: number;
    categories: number;
    budgets: number;
    financialGoals: number;
    goalContributions: number;
    recurringTransactions: number;
    appSettings: number;
  };
  transactionDateRange: { minDate: string | null; maxDate: string | null };
  existingLocalCounts: {
    transactions: number;
    categories: number;
    budgets: number;
    financialGoals: number;
  };
  conflicts: {
    duplicateIdsCount: number;
    budgetBusinessKeyConflicts: number;
  };
}

export type RestoreMode =
  | { mode: 'replace'; confirmationText: string }
  | {
      mode: 'merge';
      conflictStrategy: 'skip_existing' | 'overwrite_existing';
      overwriteSettings?: boolean;
    };

export interface RestoreSummary {
  mode: 'replace' | 'merge';
  insertedOrUpdatedCounts: {
    transactions: number;
    categories: number;
    budgets: number;
    financialGoals: number;
    goalContributions: number;
    recurringTransactions: number;
  };
  skippedCount: number;
}

export async function exportBackupJson(
  database: FinoraDatabase = db
): Promise<
  ServiceResult<{
    filename: string;
    jsonText: string;
    blob: Blob;
    envelope: BackupEnvelopeV1;
  }>
> {
  try {
    const exportedAt = new Date().toISOString();

    const payload = await database.transaction(
      'rw',
      [
        database.transactions,
        database.categories,
        database.budgets,
        database.financialGoals,
        database.goalContributions,
        database.recurringTransactions,
        database.appSettings,
      ],
      async (): Promise<BackupPayloadV1> => {
        const [
          transactions,
          categories,
          budgets,
          financialGoals,
          goalContributions,
          recurringTransactions,
          currentSettings,
        ] = await Promise.all([
          database.transactions.toArray(),
          database.categories.toArray(),
          database.budgets.toArray(),
          database.financialGoals.toArray(),
          database.goalContributions.toArray(),
          database.recurringTransactions.toArray(),
          database.appSettings.get('default'),
        ]);

        const updatedSettings = {
          ...(currentSettings ?? buildDefaultAppSettings(exportedAt)),
          lastBackupAt: exportedAt,
          updatedAt: exportedAt,
        };
        await database.appSettings.put(updatedSettings);

        return {
          transactions,
          categories,
          budgets,
          financialGoals,
          goalContributions,
          recurringTransactions,
          appSettings: [updatedSettings],
        };
      }
    );

    const canonicalPayload = canonicalStringify(payload);
    const sha256 = await computeSha256Hex(canonicalPayload);

    const envelope: BackupEnvelopeV1 = {
      appName: 'Finora',
      backupFormatVersion: 1,
      dbSchemaVersion: CURRENT_DB_SCHEMA_VERSION,
      exportedAt,
      checksum: {
        algorithm: 'SHA-256',
        value: sha256,
      },
      payload,
    };

    const jsonText = JSON.stringify(envelope, null, 2);
    const blob = new Blob([jsonText], { type: 'application/json;charset=utf-8' });
    const filename = `finora-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;

    return ok({ filename, jsonText, blob, envelope });
  } catch (error) {
    if (error instanceof Error && error.message.includes('crypto.subtle')) {
      return err(
        'INTEGRITY_ERROR',
        'Fitur checksum SHA-256 memerlukan konteks aman HTTPS atau localhost.'
      );
    }
    return mapDexieError(error);
  }
}

/**
 * Menjalankan 5 gerbang validasi impor backup tanpa memodifikasi database (BACKUP_RESTORE.md).
 */
export async function inspectBackupContent(
  rawText: string,
  meta: { name: string; size: number },
  database: FinoraDatabase = db
): Promise<ServiceResult<BackupPreview>> {
  // Gate 1: File guard
  if (!meta.name.toLowerCase().endsWith('.json')) {
    return err('VALIDATION_ERROR', 'Format berkas harus berekstensi .json.');
  }
  if (meta.size <= 0 || meta.size > MAX_BACKUP_FILE_BYTES) {
    return err(
      'VALIDATION_ERROR',
      'Ukuran berkas tidak valid atau melebihi batas maksimal 25 MB.'
    );
  }

  // Gate 2: Safe JSON parse & prototype pollution protection
  if (hasDangerousPrototypeKeys(rawText)) {
    return err(
      'INTEGRITY_ERROR',
      'Berkas JSON ditolak karena mengandung properti objek berbahaya.'
    );
  }

  let parsedRaw: unknown;
  try {
    parsedRaw = JSON.parse(rawText);
  } catch {
    return err('VALIDATION_ERROR', 'Berkas bukan sintaks JSON yang valid.');
  }

  if (objectHasDangerousKeys(parsedRaw)) {
    return err(
      'INTEGRITY_ERROR',
      'Berkas JSON ditolak karena mengandung kunci prototipe tidak aman.'
    );
  }

  // Gate 3: Envelope & Version check (prior to full payload deep validation)
  if (typeof parsedRaw !== 'object' || parsedRaw === null) {
    return err('VALIDATION_ERROR', 'Struktur root JSON harus berupa objek.');
  }
  const obj = parsedRaw as Record<string, unknown>;
  if (obj.appName !== 'Finora') {
    return err('VALIDATION_ERROR', 'Berkas ini bukan cadangan resmi aplikasi Finora.');
  }
  if (obj.backupFormatVersion !== 1 || Number(obj.dbSchemaVersion) > CURRENT_DB_SCHEMA_VERSION) {
    return err(
      'UNSUPPORTED_VERSION',
      'Versi format atau skema backup berasal dari versi aplikasi yang lebih baru dan tidak didukung.'
    );
  }

  // Gate 5 (schema check) & Gate 4 (SHA-256 integrity)
  const parsedEnvelope = BackupEnvelopeV1Schema.safeParse(parsedRaw);
  if (!parsedEnvelope.success) {
    return mapZodError(parsedEnvelope.error);
  }

  const envelope = parsedEnvelope.data;
  try {
    const recalculated = await computeSha256Hex(canonicalStringify(envelope.payload));
    if (recalculated !== envelope.checksum.value) {
      return err(
        'CHECKSUM_MISMATCH',
        'Checksum SHA-256 tidak cocok. Berkas backup kemungkinan rusak, terpotong, atau telah dimodifikasi.'
      );
    }
  } catch {
    return err(
      'INTEGRITY_ERROR',
      'Gagal memverifikasi checksum SHA-256 (pastikan diakses lewat HTTPS atau localhost).'
    );
  }

  // Build Restore Preview impact summary
  try {
    const [localTxs, localCats, localBudgets, localGoals, localContribs, localRecurrings] =
      await Promise.all([
        database.transactions.toArray(),
        database.categories.toArray(),
        database.budgets.toArray(),
        database.financialGoals.toArray(),
        database.goalContributions.toArray(),
        database.recurringTransactions.toArray(),
      ]);

    const localIds = new Set<string>([
      ...localTxs.map((x) => x.id),
      ...localCats.map((x) => x.id),
      ...localBudgets.map((x) => x.id),
      ...localGoals.map((x) => x.id),
      ...localContribs.map((x) => x.id),
      ...localRecurrings.map((x) => x.id),
    ]);

    let duplicateIdsCount = 0;
    const incomingAllIds = [
      ...envelope.payload.transactions.map((x) => x.id),
      ...envelope.payload.categories.map((x) => x.id),
      ...envelope.payload.budgets.map((x) => x.id),
      ...envelope.payload.financialGoals.map((x) => x.id),
      ...envelope.payload.goalContributions.map((x) => x.id),
      ...envelope.payload.recurringTransactions.map((x) => x.id),
    ];
    for (const id of incomingAllIds) {
      if (localIds.has(id)) duplicateIdsCount += 1;
    }

    const localBudgetKeyToId = new Map(
      localBudgets.map((b) => [`${b.categoryId}::${b.month}`, b.id])
    );
    let budgetBusinessKeyConflicts = 0;
    for (const b of envelope.payload.budgets) {
      const existingId = localBudgetKeyToId.get(`${b.categoryId}::${b.month}`);
      if (existingId && existingId !== b.id) {
        budgetBusinessKeyConflicts += 1;
      }
    }

    let minDate: string | null = null;
    let maxDate: string | null = null;
    for (const tx of envelope.payload.transactions) {
      if (!minDate || tx.date < minDate) minDate = tx.date;
      if (!maxDate || tx.date > maxDate) maxDate = tx.date;
    }

    return ok({
      envelope,
      exportedAt: envelope.exportedAt,
      backupFormatVersion: envelope.backupFormatVersion,
      dbSchemaVersion: envelope.dbSchemaVersion,
      counts: {
        transactions: envelope.payload.transactions.length,
        categories: envelope.payload.categories.length,
        budgets: envelope.payload.budgets.length,
        financialGoals: envelope.payload.financialGoals.length,
        goalContributions: envelope.payload.goalContributions.length,
        recurringTransactions: envelope.payload.recurringTransactions.length,
        appSettings: envelope.payload.appSettings.length,
      },
      transactionDateRange: { minDate, maxDate },
      existingLocalCounts: {
        transactions: localTxs.length,
        categories: localCats.length,
        budgets: localBudgets.length,
        financialGoals: localGoals.length,
      },
      conflicts: {
        duplicateIdsCount,
        budgetBusinessKeyConflicts,
      },
    });
  } catch (error) {
    return mapDexieError(error);
  }
}

export async function inspectBackupFile(
  file: File,
  database: FinoraDatabase = db
): Promise<ServiceResult<BackupPreview>> {
  if (file.size <= 0 || file.size > MAX_BACKUP_FILE_BYTES) {
    return err(
      'VALIDATION_ERROR',
      'Ukuran berkas tidak valid atau melebihi batas maksimal 25 MB.'
    );
  }
  const rawText = await file.text();
  return inspectBackupContent(rawText, { name: file.name, size: file.size }, database);
}

/**
 * Menjalankan pemulihan atomik Replace All atau Merge pada seluruh 7 tabel FinoraDB.
 */
export async function applyRestore(
  envelope: BackupEnvelopeV1,
  options: RestoreMode,
  database: FinoraDatabase = db
): Promise<ServiceResult<RestoreSummary>> {
  if (options.mode === 'replace' && options.confirmationText.trim() !== 'TIMPA') {
    return err(
      'VALIDATION_ERROR',
      'Konfirmasi tidak cocok. Ketik "TIMPA" dengan huruf kapital untuk mengganti seluruh data.',
      { confirmationText: ['Ketik TIMPA untuk melanjutkan.'] }
    );
  }

  try {
    const summary = await database.transaction(
      'rw',
      [
        database.transactions,
        database.categories,
        database.budgets,
        database.financialGoals,
        database.goalContributions,
        database.recurringTransactions,
        database.appSettings,
      ],
      async (): Promise<RestoreSummary> => {
        const p = envelope.payload;

        if (options.mode === 'replace') {
          await Promise.all([
            database.transactions.clear(),
            database.categories.clear(),
            database.budgets.clear(),
            database.financialGoals.clear(),
            database.goalContributions.clear(),
            database.recurringTransactions.clear(),
            database.appSettings.clear(),
          ]);

          if (p.categories.length > 0) await database.categories.bulkAdd(p.categories);
          if (p.transactions.length > 0) await database.transactions.bulkAdd(p.transactions);
          if (p.budgets.length > 0) await database.budgets.bulkAdd(p.budgets);
          if (p.financialGoals.length > 0) await database.financialGoals.bulkAdd(p.financialGoals);
          if (p.goalContributions.length > 0) {
            await database.goalContributions.bulkAdd(p.goalContributions);
          }
          if (p.recurringTransactions.length > 0) {
            await database.recurringTransactions.bulkAdd(p.recurringTransactions);
          }
          if (p.appSettings.length > 0) {
            await database.appSettings.bulkAdd(p.appSettings);
          } else {
            await database.appSettings.put(buildDefaultAppSettings(new Date().toISOString()));
          }

          return {
            mode: 'replace',
            insertedOrUpdatedCounts: {
              transactions: p.transactions.length,
              categories: p.categories.length,
              budgets: p.budgets.length,
              financialGoals: p.financialGoals.length,
              goalContributions: p.goalContributions.length,
              recurringTransactions: p.recurringTransactions.length,
            },
            skippedCount: 0,
          };
        }

        // Mode Merge
        const overwrite = options.conflictStrategy === 'overwrite_existing';
        let skippedCount = 0;
        const counts = {
          transactions: 0,
          categories: 0,
          budgets: 0,
          financialGoals: 0,
          goalContributions: 0,
          recurringTransactions: 0,
        };

        // 1. Categories: map conflicting name+type to existing id so foreign keys stay clean
        const localCats = await database.categories.toArray();
        const localCatById = new Map(localCats.map((c) => [c.id, c]));
        const localCatByNameType = new Map(
          localCats.map((c) => [`${c.type}::${c.name.trim().toLowerCase()}`, c])
        );
        const categoryIdRemap = new Map<string, string>();

        for (const cat of p.categories) {
          const byId = localCatById.get(cat.id);
          const byName = localCatByNameType.get(
            `${cat.type}::${cat.name.trim().toLowerCase()}`
          );

          if (byId) {
            if (overwrite) {
              await database.categories.put(cat);
              counts.categories += 1;
            } else {
              skippedCount += 1;
            }
            categoryIdRemap.set(cat.id, byId.id);
          } else if (byName) {
            categoryIdRemap.set(cat.id, byName.id);
            skippedCount += 1;
          } else {
            await database.categories.add(cat);
            counts.categories += 1;
            categoryIdRemap.set(cat.id, cat.id);
          }
        }

        const resolveCategoryId = (incomingCatId: string) =>
          categoryIdRemap.get(incomingCatId) ?? incomingCatId;

        // 2. Recurring rules
        const localRecurrings = new Set(
          (await database.recurringTransactions.toArray()).map((r) => r.id)
        );
        for (const r of p.recurringTransactions) {
          const normalized = { ...r, categoryId: resolveCategoryId(r.categoryId) };
          if (localRecurrings.has(r.id)) {
            if (overwrite) {
              await database.recurringTransactions.put(normalized);
              counts.recurringTransactions += 1;
            } else {
              skippedCount += 1;
            }
          } else {
            await database.recurringTransactions.add(normalized);
            counts.recurringTransactions += 1;
          }
        }

        // 3. Transactions
        const localTxIds = new Set(
          (await database.transactions.toArray()).map((t) => t.id)
        );
        for (const t of p.transactions) {
          const normalized = { ...t, categoryId: resolveCategoryId(t.categoryId) };
          if (localTxIds.has(t.id)) {
            if (overwrite) {
              await database.transactions.put(normalized);
              counts.transactions += 1;
            } else {
              skippedCount += 1;
            }
          } else {
            await database.transactions.add(normalized);
            counts.transactions += 1;
          }
        }

        // 4. Budgets (handle both id & unique [categoryId+month] business key)
        const localBudgets = await database.budgets.toArray();
        const localBudgetById = new Map(localBudgets.map((b) => [b.id, b]));
        const localBudgetByKey = new Map(
          localBudgets.map((b) => [`${b.categoryId}::${b.month}`, b])
        );

        for (const b of p.budgets) {
          const mappedCatId = resolveCategoryId(b.categoryId);
          const key = `${mappedCatId}::${b.month}`;
          const existingById = localBudgetById.get(b.id);
          const existingByKey = localBudgetByKey.get(key);
          const conflictRecord: BudgetRecord | undefined = existingById ?? existingByKey;

          if (conflictRecord) {
            if (overwrite) {
              const updatedBudget: BudgetRecord = {
                ...b,
                id: conflictRecord.id,
                categoryId: mappedCatId,
              };
              await database.budgets.put(updatedBudget);
              counts.budgets += 1;
            } else {
              skippedCount += 1;
            }
          } else {
            const addedBudget: BudgetRecord = { ...b, categoryId: mappedCatId };
            await database.budgets.add(addedBudget);
            localBudgetByKey.set(key, addedBudget);
            counts.budgets += 1;
          }
        }

        // 5. Financial Goals & Contributions
        const localGoalIds = new Set(
          (await database.financialGoals.toArray()).map((g) => g.id)
        );
        for (const g of p.financialGoals) {
          if (localGoalIds.has(g.id)) {
            if (overwrite) {
              await database.financialGoals.put(g);
              counts.financialGoals += 1;
            } else {
              skippedCount += 1;
            }
          } else {
            await database.financialGoals.add(g);
            counts.financialGoals += 1;
          }
        }

        const localContribIds = new Set(
          (await database.goalContributions.toArray()).map((c) => c.id)
        );
        for (const c of p.goalContributions) {
          if (localContribIds.has(c.id)) {
            if (overwrite) {
              await database.goalContributions.put(c);
              counts.goalContributions += 1;
            } else {
              skippedCount += 1;
            }
          } else {
            await database.goalContributions.add(c);
            counts.goalContributions += 1;
          }
        }

        // Recompute goal currentAmount on merge to preserve RULE-018 invariant
        if (counts.goalContributions > 0 || counts.financialGoals > 0) {
          const allGoals = await database.financialGoals.toArray();
          const allContribs = await database.goalContributions.toArray();
          const sumByGoal = new Map<string, number>();
          for (const c of allContribs) {
            sumByGoal.set(c.goalId, (sumByGoal.get(c.goalId) ?? 0) + c.amount);
          }
          for (const g of allGoals) {
            const computed = Math.max(0, sumByGoal.get(g.id) ?? 0);
            const nextStatus =
              computed >= g.targetAmount
                ? 'completed'
                : g.status === 'completed'
                  ? 'active'
                  : g.status;
            if (computed !== g.currentAmount || nextStatus !== g.status) {
              await database.financialGoals.put({
                ...g,
                currentAmount: computed,
                status: nextStatus,
              });
            }
          }
        }

        // 6. Optional settings overwrite in Merge mode
        if (options.overwriteSettings && p.appSettings[0]) {
          await database.appSettings.put(p.appSettings[0]);
        }

        return {
          mode: 'merge',
          insertedOrUpdatedCounts: counts,
          skippedCount,
        };
      }
    );

    return ok(summary);
  } catch (error) {
    return mapDexieError(error);
  }
}
