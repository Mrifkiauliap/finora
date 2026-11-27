import { db, type FinoraDatabase } from '@/db/database';
import type { BudgetEvaluationView, GoalView, TransactionView } from '@/db/types';
import {
  getLastNMonthsList,
  getLocalToday,
  getMonthDateBounds,
  getMonthShortLabel,
} from '@/domain/dates';
import {
  calculateAvailableBalance,
  calculateBudgetMetrics,
  calculateCashflowSummary,
  calculateGoalMetrics,
  calculateNetBalance,
  calculateTotalAllocatedSavings,
} from '@/domain/financeCalculators';
import { MonthStringSchema } from '@/schemas/commonSchema';
import { mapDexieError, mapZodError, ok, type ServiceResult } from './errors';

export interface MonthlyCashflowPoint {
  month: string;
  label: string;
  income: number;
  expense: number;
  netCashflow: number;
}

export interface DashboardSummary {
  month: string;
  netBalance: number;
  totalAllocatedSavings: number;
  availableBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNetCashflow: number;
  savingsRatePct: number | null;
  budgetAlerts: BudgetEvaluationView[];
  activeGoals: GoalView[];
  recentTransactions: TransactionView[];
  cashflowTrend6Months: MonthlyCashflowPoint[];
  totalTransactionCount: number;
  shouldRemindBackup: boolean;
}

export async function getDashboardSummary(
  month: string,
  today: string = getLocalToday(),
  database: FinoraDatabase = db
): Promise<ServiceResult<DashboardSummary>> {
  const parsedMonth = MonthStringSchema.safeParse(month);
  if (!parsedMonth.success) {
    return mapZodError(parsedMonth.error);
  }

  try {
    const [allTransactions, categories, monthBudgets, goals, settings] =
      await Promise.all([
        database.transactions.toArray(),
        database.categories.toArray(),
        database.budgets.where('month').equals(month).toArray(),
        database.financialGoals.toArray(),
        database.appSettings.get('default'),
      ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const { startDate, endDate } = getMonthDateBounds(month);

    const netBalance = calculateNetBalance(allTransactions);
    const totalAllocatedSavings = calculateTotalAllocatedSavings(goals);
    const availableBalance = calculateAvailableBalance(netBalance, goals);

    const monthTxs = allTransactions.filter(
      (t) => t.date >= startDate && t.date <= endDate
    );
    const monthCashflow = calculateCashflowSummary(monthTxs);

    // Budget evaluation for selected month
    const spentByCategory = new Map<string, number>();
    for (const tx of monthTxs) {
      if (tx.type === 'expense') {
        spentByCategory.set(
          tx.categoryId,
          (spentByCategory.get(tx.categoryId) ?? 0) + tx.amount
        );
      }
    }

    const evaluatedBudgets: BudgetEvaluationView[] = monthBudgets.map((b) => {
      const cat = categoryMap.get(b.categoryId);
      const spent = spentByCategory.get(b.categoryId) ?? 0;
      const metrics = calculateBudgetMetrics(
        b.limitAmount,
        spent,
        b.warningThresholdPct
      );
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

    const priorityOrder = { exceeded: 0, warning: 1, safe: 2 } as const;
    evaluatedBudgets.sort(
      (a, b) =>
        priorityOrder[a.status] - priorityOrder[b.status] ||
        b.utilizationPct - a.utilizationPct
    );

    // Top 3 active goals
    const activeGoals: GoalView[] = goals
      .filter((g) => g.status === 'active')
      .map((g) => ({
        ...g,
        ...calculateGoalMetrics(g, today),
      }))
      .sort((a, b) => b.progressPct - a.progressPct)
      .slice(0, 3);

    // Recent 5 transactions
    const sortedTxs = [...allTransactions].sort(
      (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
    );
    const recentTransactions: TransactionView[] = sortedTxs.slice(0, 5).map((tx) => {
      const cat = categoryMap.get(tx.categoryId);
      return {
        ...tx,
        categoryName: cat?.name ?? 'Lainnya',
        categoryIcon: cat?.icon ?? 'tag',
        categoryColor: cat?.color ?? '#94A3B8',
        categoryArchived: cat?.isArchived ?? false,
      };
    });

    // 6 months cashflow trend ending at `month`
    const trendMonths = getLastNMonthsList(month, 6);
    const monthSums = new Map<string, { income: number; expense: number }>();
    for (const m of trendMonths) {
      monthSums.set(m, { income: 0, expense: 0 });
    }
    for (const tx of allTransactions) {
      const txMonth = tx.date.slice(0, 7);
      const bucket = monthSums.get(txMonth);
      if (bucket) {
        if (tx.type === 'income') bucket.income += tx.amount;
        else bucket.expense += tx.amount;
      }
    }
    const cashflowTrend6Months: MonthlyCashflowPoint[] = trendMonths.map((m) => {
      const b = monthSums.get(m) ?? { income: 0, expense: 0 };
      return {
        month: m,
        label: getMonthShortLabel(m),
        income: b.income,
        expense: b.expense,
        netCashflow: b.income - b.expense,
      };
    });

    // FR-023: Backup reminder heuristic
    const totalTransactionCount = allTransactions.length;
    let shouldRemindBackup = false;
    if (totalTransactionCount >= 10) {
      if (!settings?.lastBackupAt) {
        shouldRemindBackup = true;
      } else {
        const lastMs = Date.parse(settings.lastBackupAt);
        const daysSince = (Date.now() - lastMs) / (1000 * 60 * 60 * 24);
        if (Number.isFinite(daysSince) && daysSince > 30) {
          shouldRemindBackup = true;
        }
      }
    }

    return ok({
      month,
      netBalance,
      totalAllocatedSavings,
      availableBalance,
      monthlyIncome: monthCashflow.totalIncome,
      monthlyExpense: monthCashflow.totalExpense,
      monthlyNetCashflow: monthCashflow.netCashflow,
      savingsRatePct: monthCashflow.savingsRatePct,
      budgetAlerts: evaluatedBudgets,
      activeGoals,
      recentTransactions,
      cashflowTrend6Months,
      totalTransactionCount,
      shouldRemindBackup,
    });
  } catch (error) {
    return mapDexieError(error);
  }
}
