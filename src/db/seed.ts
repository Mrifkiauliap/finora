import { DEFAULT_WARNING_THRESHOLD_PCT } from '@/domain/constants';
import type { AppSettingsRecord, CategoryRecord } from './types';

export function buildDefaultAppSettings(nowIso: string): AppSettingsRecord {
  return {
    id: 'default',
    theme: 'light',
    currency: 'IDR',
    locale: 'id-ID',
    firstDayOfWeek: 1,
    defaultWarningThresholdPct: DEFAULT_WARNING_THRESHOLD_PCT,
    showBalancesMasked: false,
    lastBackupAt: null,
    onboardingCompleted: true,
    schemaMetaVersion: 1,
    updatedAt: nowIso,
  };
}

export function buildSystemCategories(nowIso: string): CategoryRecord[] {
  const incomeDefs: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    sortOrder: number;
  }> = [
    { id: 'cat-sys-salary', name: 'Gaji', icon: 'wallet', color: '#10B981', sortOrder: 1 },
    { id: 'cat-sys-freelance', name: 'Freelance / Proyek', icon: 'briefcase', color: '#38BDF8', sortOrder: 2 },
    { id: 'cat-sys-bonus', name: 'Bonus & Hadiah', icon: 'gift', color: '#A78BFA', sortOrder: 3 },
    { id: 'cat-sys-investment', name: 'Hasil Investasi', icon: 'trending-up', color: '#2DD4BF', sortOrder: 4 },
    { id: 'cat-sys-other-income', name: 'Lainnya', icon: 'more-horizontal', color: '#94A3B8', sortOrder: 5 },
  ];

  const expenseDefs: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    sortOrder: number;
  }> = [
    { id: 'cat-sys-food', name: 'Makanan & Minuman', icon: 'utensils', color: '#F59E0B', sortOrder: 1 },
    { id: 'cat-sys-transport', name: 'Transportasi', icon: 'car', color: '#38BDF8', sortOrder: 2 },
    { id: 'cat-sys-bills', name: 'Tagihan & Utilitas', icon: 'receipt', color: '#FB7185', sortOrder: 3 },
    { id: 'cat-sys-shopping', name: 'Belanja', icon: 'shopping-bag', color: '#A78BFA', sortOrder: 4 },
    { id: 'cat-sys-entertainment', name: 'Hiburan', icon: 'gamepad-2', color: '#E879F9', sortOrder: 5 },
    { id: 'cat-sys-health', name: 'Kesehatan', icon: 'heart-pulse', color: '#22C55E', sortOrder: 6 },
    { id: 'cat-sys-education', name: 'Pendidikan', icon: 'graduation-cap', color: '#60A5FA', sortOrder: 7 },
    { id: 'cat-sys-other-expense', name: 'Lainnya', icon: 'more-horizontal', color: '#94A3B8', sortOrder: 8 },
  ];

  return [
    ...incomeDefs.map((item) => ({
      ...item,
      type: 'income' as const,
      isSystem: true,
      isArchived: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    })),
    ...expenseDefs.map((item) => ({
      ...item,
      type: 'expense' as const,
      isSystem: true,
      isArchived: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    })),
  ];
}
