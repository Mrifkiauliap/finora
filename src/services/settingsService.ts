import { db, type FinoraDatabase } from '@/db/database';
import { buildDefaultAppSettings, buildSystemCategories } from '@/db/seed';
import type { AppSettingsRecord } from '@/db/types';
import { UpdateSettingsSchema, type UpdateSettingsInput } from '@/schemas/settingsSchema';
import { err, mapDexieError, mapZodError, ok, type ServiceResult } from './errors';

export async function getSettings(
  database: FinoraDatabase = db
): Promise<ServiceResult<AppSettingsRecord>> {
  try {
    const existing = await database.appSettings.get('default');
    if (existing) {
      return ok(existing);
    }
    const seeded = buildDefaultAppSettings(new Date().toISOString());
    await database.appSettings.put(seeded);
    return ok(seeded);
  } catch (error) {
    return mapDexieError(error);
  }
}

export async function updateSettings(
  patch: UpdateSettingsInput,
  database: FinoraDatabase = db
): Promise<ServiceResult<AppSettingsRecord>> {
  const parsed = UpdateSettingsSchema.safeParse(patch);
  if (!parsed.success) {
    return mapZodError(parsed.error);
  }

  try {
    const updated = await database.transaction('rw', database.appSettings, async () => {
      const nowIso = new Date().toISOString();
      const current =
        (await database.appSettings.get('default')) ?? buildDefaultAppSettings(nowIso);
      const next: AppSettingsRecord = {
        ...current,
        ...parsed.data,
        updatedAt: nowIso,
      };
      await database.appSettings.put(next);
      return next;
    });
    return ok(updated);
  } catch (error) {
    return mapDexieError(error);
  }
}

/**
 * FR-019 & SEC-010: Menghapus seluruh data lokal FinoraDB setelah konfirmasi ketik "HAPUS".
 */
export async function factoryResetDatabase(
  confirmationText: string,
  options: { reseedDefaultCategories: boolean } = { reseedDefaultCategories: true },
  database: FinoraDatabase = db
): Promise<ServiceResult<{ cleared: true }>> {
  if (confirmationText.trim() !== 'HAPUS') {
    return err(
      'VALIDATION_ERROR',
      'Konfirmasi tidak cocok. Ketik "HAPUS" dengan huruf kapital untuk menghapus seluruh data.',
      { confirmationText: ['Ketik HAPUS untuk mengonfirmasi.'] }
    );
  }

  try {
    await database.transaction(
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
      async () => {
        await Promise.all([
          database.transactions.clear(),
          database.categories.clear(),
          database.budgets.clear(),
          database.financialGoals.clear(),
          database.goalContributions.clear(),
          database.recurringTransactions.clear(),
          database.appSettings.clear(),
        ]);

        const nowIso = new Date().toISOString();
        await database.appSettings.put(buildDefaultAppSettings(nowIso));
        if (options.reseedDefaultCategories) {
          await database.categories.bulkPut(buildSystemCategories(nowIso));
        }
      }
    );
    return ok({ cleared: true });
  } catch (error) {
    return mapDexieError(error);
  }
}
