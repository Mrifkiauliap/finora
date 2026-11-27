import { db, type FinoraDatabase } from '@/db/database';
import { buildDefaultAppSettings, buildSystemCategories } from '@/db/seed';
import type {
  BudgetRecord,
  FinancialGoalRecord,
  GoalContributionRecord,
  RecurringTransactionRecord,
  TransactionRecord,
} from '@/db/types';
import {
  getLocalToday,
  getMonthDateBounds,
  isValidCalendarDate,
  shiftMonth,
} from '@/domain/dates';
import { mapDexieError, ok, type ServiceResult } from './errors';

export const DEMO_ID_PREFIX = '11111111-1111-4111-8';

function demoUuid(group: number, index: number): string {
  return `${DEMO_ID_PREFIX}${String(group).padStart(3, '0')}-${String(index).padStart(12, '0')}`;
}

export async function hasDemoData(database: FinoraDatabase = db): Promise<boolean> {
  const counts = await Promise.all([
    database.transactions.where('id').startsWith(DEMO_ID_PREFIX).count(),
    database.budgets.where('id').startsWith(DEMO_ID_PREFIX).count(),
    database.financialGoals.where('id').startsWith(DEMO_ID_PREFIX).count(),
    database.recurringTransactions.where('id').startsWith(DEMO_ID_PREFIX).count(),
  ]);
  return counts.some((c) => c > 0);
}

function clampDay(month: string, day: number, capToDay?: number): string {
  const maxMonthDay = Number(getMonthDateBounds(month).endDate.slice(8, 10));
  const boundedDay = capToDay !== undefined ? Math.min(day, capToDay) : day;
  const safeDay = Math.max(1, Math.min(boundedDay, maxMonthDay));
  return `${month}-${String(safeDay).padStart(2, '0')}`;
}

export interface DemoDataLoadResult {
  transactionsCount: number;
  budgetsCount: number;
  goalsCount: number;
  recurringCount: number;
}

/**
 * Mengisi database lokal dengan data contoh realistis IDR agar pengguna dapat langsung
 * mencoba seluruh fitur Finora (Dashboard, Transaksi, Anggaran, Target, Berulang, Analitik).
 */
export async function loadDemoData(
  database: FinoraDatabase = db,
  referenceDate?: string
): Promise<ServiceResult<DemoDataLoadResult>> {
  try {
    const todayStr =
      referenceDate && isValidCalendarDate(referenceDate) ? referenceDate : getLocalToday();
    const m0 = todayStr.slice(0, 7);
    const m1 = shiftMonth(m0, -1);
    const m2 = shiftMonth(m0, -2);
    const nextMonth = shiftMonth(m0, 1);
    const todayDay = Math.max(1, Number(todayStr.slice(8, 10)));
    const nowIso = new Date().toISOString();

    const m2Income = [
      { day: 1, categoryId: 'cat-sys-salary', amount: 8_500_000, paymentMethod: 'bank_transfer' as const, note: 'Gaji Bulanan' },
      { day: 18, categoryId: 'cat-sys-freelance', amount: 2_200_000, paymentMethod: 'bank_transfer' as const, note: 'Desain Landing Page Klien' },
    ];
    const m2Expense = [
      { day: 2, categoryId: 'cat-sys-bills', amount: 1_770_000, paymentMethod: 'bank_transfer' as const, note: 'Sewa Kos & Internet' },
      { day: 7, categoryId: 'cat-sys-food', amount: 820_000, paymentMethod: 'e_wallet' as const, note: 'Belanja Bahan Masak & Makan' },
      { day: 14, categoryId: 'cat-sys-transport', amount: 480_000, paymentMethod: 'e_wallet' as const, note: 'Transportasi Harian & BBM' },
      { day: 21, categoryId: 'cat-sys-food', amount: 680_000, paymentMethod: 'debit_card' as const, note: 'Makan Siang & Kopi Kerja' },
      { day: 25, categoryId: 'cat-sys-shopping', amount: 670_000, paymentMethod: 'e_wallet' as const, note: 'Kebutuhan Rumah & Perlengkapan' },
    ];

    const m1Income = [
      { day: 1, categoryId: 'cat-sys-salary', amount: 8_500_000, paymentMethod: 'bank_transfer' as const, note: 'Gaji Bulanan' },
      { day: 16, categoryId: 'cat-sys-freelance', amount: 1_500_000, paymentMethod: 'bank_transfer' as const, note: 'Audit UI Aplikasi Mobile' },
    ];
    const m1Expense = [
      { day: 2, categoryId: 'cat-sys-bills', amount: 1_450_000, paymentMethod: 'bank_transfer' as const, note: 'Sewa Kos Bulanan' },
      { day: 5, categoryId: 'cat-sys-bills', amount: 320_000, paymentMethod: 'e_wallet' as const, note: 'Langganan Internet' },
      { day: 9, categoryId: 'cat-sys-food', amount: 890_000, paymentMethod: 'e_wallet' as const, note: 'Groceries & Makan Mingguan' },
      { day: 15, categoryId: 'cat-sys-transport', amount: 490_000, paymentMethod: 'e_wallet' as const, note: 'KRL & Ojek Online' },
      { day: 20, categoryId: 'cat-sys-shopping', amount: 1_050_000, paymentMethod: 'debit_card' as const, note: 'Sepatu Kerja & Kebutuhan Harian' },
      { day: 24, categoryId: 'cat-sys-food', amount: 760_000, paymentMethod: 'cash' as const, note: 'Kuliner Akhir Pekan' },
      { day: 27, categoryId: 'cat-sys-entertainment', amount: 300_000, paymentMethod: 'e_wallet' as const, note: 'Bioskop & Langganan Musik' },
    ];

    const m0Income = [
      { day: 1, categoryId: 'cat-sys-salary', amount: 8_500_000, paymentMethod: 'bank_transfer' as const, note: 'Gaji Bulanan' },
      { day: 14, categoryId: 'cat-sys-freelance', amount: 2_750_000, paymentMethod: 'bank_transfer' as const, note: 'Proyek Desain Sistem Web' },
    ];
    const m0Expense = [
      { day: 2, categoryId: 'cat-sys-bills', amount: 1_450_000, paymentMethod: 'bank_transfer' as const, note: 'Sewa Kos Bulanan' },
      { day: 5, categoryId: 'cat-sys-bills', amount: 320_000, paymentMethod: 'e_wallet' as const, note: 'Langganan Internet' },
      { day: 8, categoryId: 'cat-sys-food', amount: 620_000, paymentMethod: 'e_wallet' as const, note: 'Belanja Dapur & Makan Siang' },
      { day: 12, categoryId: 'cat-sys-transport', amount: 390_000, paymentMethod: 'e_wallet' as const, note: 'Saldo Transportasi & Parkir' },
      { day: 16, categoryId: 'cat-sys-food', amount: 515_000, paymentMethod: 'debit_card' as const, note: 'Makan Bersama Rekan Kerja' },
      { day: 19, categoryId: 'cat-sys-shopping', amount: 620_000, paymentMethod: 'debit_card' as const, note: 'Perlengkapan Kerja Harian' },
      { day: 22, categoryId: 'cat-sys-health', amount: 290_000, paymentMethod: 'e_wallet' as const, note: 'Vitamin & Pemeriksaan Kesehatan' },
      { day: 25, categoryId: 'cat-sys-entertainment', amount: 245_000, paymentMethod: 'e_wallet' as const, note: 'Streaming Film & Buku Digital' },
      { day: 26, categoryId: 'cat-sys-food', amount: 370_000, paymentMethod: 'cash' as const, note: 'Kopi & Makan Malam Harian' },
    ];

    const rawTransactions: Array<{
      month: string;
      cap?: number;
      type: 'income' | 'expense';
      day: number;
      categoryId: string;
      amount: number;
      paymentMethod: TransactionRecord['paymentMethod'];
      note: string;
    }> = [
      ...m2Income.map((t) => ({ month: m2, type: 'income' as const, ...t })),
      ...m2Expense.map((t) => ({ month: m2, type: 'expense' as const, ...t })),
      ...m1Income.map((t) => ({ month: m1, type: 'income' as const, ...t })),
      ...m1Expense.map((t) => ({ month: m1, type: 'expense' as const, ...t })),
      ...m0Income.map((t) => ({ month: m0, cap: todayDay, type: 'income' as const, ...t })),
      ...m0Expense.map((t) => ({ month: m0, cap: todayDay, type: 'expense' as const, ...t })),
    ];

    const transactions: TransactionRecord[] = rawTransactions.map((item, idx) => ({
      id: demoUuid(1, idx + 1),
      type: item.type,
      amount: item.amount,
      categoryId: item.categoryId,
      date: clampDay(item.month, item.day, item.cap),
      note: item.note,
      paymentMethod: item.paymentMethod,
      recurringRuleId: null,
      recurringOccurrenceDate: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    }));

    const budgets: BudgetRecord[] = [
      { id: demoUuid(2, 1), categoryId: 'cat-sys-food', month: m0, limitAmount: 1_800_000, warningThresholdPct: 80, createdAt: nowIso, updatedAt: nowIso },
      { id: demoUuid(2, 2), categoryId: 'cat-sys-bills', month: m0, limitAmount: 1_700_000, warningThresholdPct: 80, createdAt: nowIso, updatedAt: nowIso },
      { id: demoUuid(2, 3), categoryId: 'cat-sys-transport', month: m0, limitAmount: 700_000, warningThresholdPct: 80, createdAt: nowIso, updatedAt: nowIso },
      { id: demoUuid(2, 4), categoryId: 'cat-sys-shopping', month: m0, limitAmount: 1_000_000, warningThresholdPct: 80, createdAt: nowIso, updatedAt: nowIso },
      { id: demoUuid(2, 5), categoryId: 'cat-sys-entertainment', month: m0, limitAmount: 500_000, warningThresholdPct: 80, createdAt: nowIso, updatedAt: nowIso },
    ];

    const goals: FinancialGoalRecord[] = [
      {
        id: demoUuid(3, 1),
        name: 'Dana Darurat 6 Bulan',
        targetAmount: 20_000_000,
        currentAmount: 6_000_000,
        deadline: clampDay(shiftMonth(m0, 12), 28),
        status: 'active',
        icon: 'shield-check',
        color: '#10B981',
        note: 'Cadangan biaya hidup pokok untuk rasa aman keluarga.',
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        id: demoUuid(3, 2),
        name: 'Laptop Kerja Baru',
        targetAmount: 12_000_000,
        currentAmount: 2_500_000,
        deadline: clampDay(shiftMonth(m0, 6), 25),
        status: 'active',
        icon: 'laptop',
        color: '#38BDF8',
        note: 'Upgrade perangkat kerja untuk produktivitas harian.',
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        id: demoUuid(3, 3),
        name: 'Liburan Akhir Tahun',
        targetAmount: 3_000_000,
        currentAmount: 1_000_000,
        deadline: clampDay(shiftMonth(m0, 4), 20),
        status: 'active',
        icon: 'plane',
        color: '#A78BFA',
        note: 'Dana perjalanan dan akomodasi liburan.',
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    ];

    const goalContributions: GoalContributionRecord[] = [
      { id: demoUuid(4, 1), goalId: demoUuid(3, 1), amount: 3_500_000, date: clampDay(m1, 5), note: 'Setoran awal dana darurat', createdAt: nowIso },
      { id: demoUuid(4, 2), goalId: demoUuid(3, 1), amount: 2_500_000, date: clampDay(m0, 3, todayDay), note: 'Sisihan rutin dari gaji bulan ini', createdAt: nowIso },
      { id: demoUuid(4, 3), goalId: demoUuid(3, 2), amount: 1_500_000, date: clampDay(m1, 18), note: 'Alokasi proyek desain', createdAt: nowIso },
      { id: demoUuid(4, 4), goalId: demoUuid(3, 2), amount: 1_000_000, date: clampDay(m0, 15, todayDay), note: 'Tambahan dana laptop', createdAt: nowIso },
      { id: demoUuid(4, 5), goalId: demoUuid(3, 3), amount: 1_000_000, date: clampDay(m0, 10, todayDay), note: 'Tabungan liburan awal', createdAt: nowIso },
    ];

    const recurringTransactions: RecurringTransactionRecord[] = [
      {
        id: demoUuid(5, 1),
        type: 'income',
        amount: 8_500_000,
        categoryId: 'cat-sys-salary',
        note: 'Gaji Bulanan',
        paymentMethod: 'bank_transfer',
        frequency: 'monthly',
        interval: 1,
        anchorDay: 1,
        startDate: clampDay(m2, 1),
        endDate: null,
        nextRunDate: clampDay(nextMonth, 1),
        lastGeneratedDate: clampDay(m0, 1, todayDay),
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        id: demoUuid(5, 2),
        type: 'expense',
        amount: 1_450_000,
        categoryId: 'cat-sys-bills',
        note: 'Sewa Kos Bulanan',
        paymentMethod: 'bank_transfer',
        frequency: 'monthly',
        interval: 1,
        anchorDay: 2,
        startDate: clampDay(m2, 2),
        endDate: null,
        nextRunDate: clampDay(nextMonth, 2),
        lastGeneratedDate: clampDay(m0, 2, todayDay),
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        id: demoUuid(5, 3),
        type: 'expense',
        amount: 320_000,
        categoryId: 'cat-sys-bills',
        note: 'Langganan Internet',
        paymentMethod: 'e_wallet',
        frequency: 'monthly',
        interval: 1,
        anchorDay: 5,
        startDate: clampDay(m2, 5),
        endDate: null,
        nextRunDate: clampDay(nextMonth, 5),
        lastGeneratedDate: clampDay(m0, 5, todayDay),
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    ];

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
          database.budgets.clear(),
          database.financialGoals.clear(),
          database.goalContributions.clear(),
          database.recurringTransactions.clear(),
        ]);

        await database.categories.bulkPut(buildSystemCategories(nowIso));
        const existingSettings = await database.appSettings.get('default');
        if (!existingSettings) {
          await database.appSettings.put(buildDefaultAppSettings(nowIso));
        }

        await database.transactions.bulkPut(transactions);
        await database.budgets.bulkPut(budgets);
        await database.financialGoals.bulkPut(goals);
        await database.goalContributions.bulkPut(goalContributions);
        await database.recurringTransactions.bulkPut(recurringTransactions);
      }
    );

    return ok({
      transactionsCount: transactions.length,
      budgetsCount: budgets.length,
      goalsCount: goals.length,
      recurringCount: recurringTransactions.length,
    });
  } catch (error) {
    return mapDexieError(error);
  }
}
