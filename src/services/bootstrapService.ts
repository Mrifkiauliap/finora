import { db, type FinoraDatabase } from '@/db/database';
import { buildDefaultAppSettings, buildSystemCategories } from '@/db/seed';
import { getLocalToday } from '@/domain/dates';
import { mapDexieError, ok, type ServiceResult } from './errors';
import { materializeDueTransactions } from './recurringService';

export interface StorageHealthInfo {
  available: boolean;
  persisted: boolean | null;
  usageBytes: number | null;
  quotaBytes: number | null;
}

/**
 * UC-001 & FR-001: Inisialisasi FinoraDB idempoten tanpa login + materialisasi transaksi berulang.
 */
export async function initializeApp(
  today: string = getLocalToday(),
  database: FinoraDatabase = db
): Promise<ServiceResult<{ seeded: boolean; recurringGeneratedCount: number; cappedRuleIds: string[] }>> {
  try {
    await database.open();

    const seeded = await database.transaction(
      'rw',
      database.categories,
      database.appSettings,
      async () => {
        const nowIso = new Date().toISOString();
        let didSeed = false;

        const existingSettings = await database.appSettings.get('default');
        if (!existingSettings) {
          await database.appSettings.put(buildDefaultAppSettings(nowIso));
          didSeed = true;
        }

        const catCount = await database.categories.count();
        if (catCount === 0) {
          await database.categories.bulkPut(buildSystemCategories(nowIso));
          didSeed = true;
        }

        return didSeed;
      }
    );

    const matResult = await materializeDueTransactions(today, database);
    if (!matResult.ok) {
      return matResult;
    }

    return ok({
      seeded,
      recurringGeneratedCount: matResult.data.generatedCount,
      cappedRuleIds: matResult.data.cappedRuleIds,
    });
  } catch (error) {
    return mapDexieError(error);
  }
}

export async function getStorageHealth(): Promise<StorageHealthInfo> {
  const available = typeof indexedDB !== 'undefined';
  let persisted: boolean | null = null;
  let usageBytes: number | null = null;
  let quotaBytes: number | null = null;

  try {
    if (typeof navigator !== 'undefined' && navigator.storage) {
      if (typeof navigator.storage.persisted === 'function') {
        persisted = await navigator.storage.persisted();
      }
      if (typeof navigator.storage.estimate === 'function') {
        const estimate = await navigator.storage.estimate();
        usageBytes = typeof estimate.usage === 'number' ? estimate.usage : null;
        quotaBytes = typeof estimate.quota === 'number' ? estimate.quota : null;
      }
    }
  } catch {
    // Graceful degradation pada browser yang membatasi StorageManager API
  }

  return { available, persisted, usageBytes, quotaBytes };
}

export async function requestPersistentStorage(): Promise<{
  supported: boolean;
  granted: boolean;
}> {
  try {
    if (
      typeof navigator !== 'undefined' &&
      navigator.storage &&
      typeof navigator.storage.persist === 'function'
    ) {
      const granted = await navigator.storage.persist();
      return { supported: true, granted };
    }
  } catch {
    return { supported: false, granted: false };
  }
  return { supported: false, granted: false };
}
