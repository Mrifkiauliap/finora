import { addDays, differenceInCalendarDays, format } from 'date-fns';
import { db, type FinoraDatabase } from '@/db/database';
import type { BudgetEvaluationView, GoalView } from '@/db/types';
import {
  getLocalToday,
  getMonthShortLabel,
  isValidCalendarDate,
  parseLocalDate,
} from '@/domain/dates';
import {
  calculateBudgetMetrics,
  calculateCashflowSummary,
  calculateGoalMetrics,
  type CashflowSummary,
} from '@/domain/financeCalculators';
import {
  buildDeterministicInsights,
  type CategoryBreakdownItem,
  type DeterministicInsight,
} from '@/domain/insightsEngine';
import { err, mapDexieError, ok, type ServiceResult } from './errors';
import type { MonthlyCashflowPoint } from './dashboardService';

export interface AnalyticsRangeInput {
  startDate: string;
  endDate: string;
  today?: string;
}

export interface AnalyticsReport {
  startDate: string;
  endDate: string;
  currentSummary: CashflowSummary;
  previousSummary: CashflowSummary;
  transactionCount: number;
  monthlySeries: MonthlyCashflowPoint[];
  expenseByCategory: CategoryBreakdownItem[];
  incomeByCategory: CategoryBreakdownItem[];
  insights: DeterministicInsight[];
}

export async function getAnalyticsReport(
  range: AnalyticsRangeInput,
  database: FinoraDatabase = db
): Promise<ServiceResult<AnalyticsReport>> {
  if (!isValidCalendarDate(range.startDate) || !isValidCalendarDate(range.endDate)) {
    return err('VALIDATION_ERROR', 'Format tanggal rentang analitik tidak valid.');
  }
  if (range.startDate > range.endDate) {
    return err('VALIDATION_ERROR', 'Tanggal mulai tidak boleh lebih besar dari tanggal akhir.');
  }

  const today = range.today ?? getLocalToday();

  try {
    const startDt = parseLocalDate(range.startDate);
    const endDt = parseLocalDate(range.endDate);
    const spanDays = differenceInCalendarDays(endDt, startDt) + 1;
    const prevEndDt = addDays(startDt, -1);
    const prevStartDt = addDays(prevEndDt, -(spanDays - 1));
    const prevStartDate = format(prevStartDt, 'yyyy-MM-dd');
    const prevEndDate = format(prevEndDt, 'yyyy-MM-dd');

    const activeMonth = range.endDate.slice(0, 7);

    const [currentTxs, prevTxs, categories, monthBudgets, goals] = await Promise.all([
      database.transactions
        .where('date')
        .between(range.startDate, range.endDate, true, true)
        .toArray(),
      database.transactions
        .where('date')
        .between(prevStartDate, prevEndDate, true, true)
        .toArray(),
      database.categories.toArray(),
      database.budgets.where('month').equals(activeMonth).toArray(),
      database.financialGoals.toArray(),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const currentSummary = calculateCashflowSummary(currentTxs);
    const previousSummary = calculateCashflowSummary(prevTxs);

    // Monthly series spanning startDate..endDate
    const monthBuckets = new Map<string, { income: number; expense: number }>();
    let mCursor = range.startDate.slice(0, 7);
    const endMonth = range.endDate.slice(0, 7);
    while (mCursor <= endMonth) {
      monthBuckets.set(mCursor, { income: 0, expense: 0 });
      const [yStr, mStr] = mCursor.split('-');
      const y = Number(yStr);
      const m = Number(mStr);
      const nextY = m === 12 ? y + 1 : y;
      const nextM = m === 12 ? 1 : m + 1;
      mCursor = `${String(nextY).padStart(4, '0')}-${String(nextM).padStart(2, '0')}`;
    }

    const expenseCatTotals = new Map<string, number>();
    const incomeCatTotals = new Map<string, number>();

    for (const tx of currentTxs) {
      const mKey = tx.date.slice(0, 7);
      const b = monthBuckets.get(mKey);
      if (b) {
        if (tx.type === 'income') b.income += tx.amount;
        else b.expense += tx.amount;
      }

      if (tx.type === 'expense') {
        expenseCatTotals.set(
          tx.categoryId,
          (expenseCatTotals.get(tx.categoryId) ?? 0) + tx.amount
        );
      } else {
        incomeCatTotals.set(
          tx.categoryId,
          (incomeCatTotals.get(tx.categoryId) ?? 0) + tx.amount
        );
      }
    }

    const monthlySeries: MonthlyCashflowPoint[] = Array.from(monthBuckets.entries()).map(
      ([m, val]) => ({
        month: m,
        label: getMonthShortLabel(m),
        income: val.income,
        expense: val.expense,
        netCashflow: val.income - val.expense,
      })
    );

    const buildBreakdown = (
      totalsMap: Map<string, number>,
      grandTotal: number
    ): CategoryBreakdownItem[] => {
      return Array.from(totalsMap.entries())
        .map(([categoryId, amount]) => {
          const cat = categoryMap.get(categoryId);
          return {
            categoryId,
            categoryName: cat?.name ?? 'Lainnya',
            color: cat?.color ?? '#94A3B8',
            amount,
            percentage:
              grandTotal <= 0 ? 0 : Math.round((amount / grandTotal) * 1000) / 10,
          };
        })
        .sort((a, b) => b.amount - a.amount);
    };

    const expenseByCategory = buildBreakdown(expenseCatTotals, currentSummary.totalExpense);
    const incomeByCategory = buildBreakdown(incomeCatTotals, currentSummary.totalIncome);

    // Budget evaluation for active month to feed insights
    const activeMonthTxs = currentTxs.filter((t) => t.date.startsWith(activeMonth));
    const activeExpenseByCat = new Map<string, number>();
    for (const tx of activeMonthTxs) {
      if (tx.type === 'expense') {
        activeExpenseByCat.set(
          tx.categoryId,
          (activeExpenseByCat.get(tx.categoryId) ?? 0) + tx.amount
        );
      }
    }
    const evaluatedBudgets: BudgetEvaluationView[] = monthBudgets.map((b) => {
      const cat = categoryMap.get(b.categoryId);
      const spent = activeExpenseByCat.get(b.categoryId) ?? 0;
      const metrics = calculateBudgetMetrics(b.limitAmount, spent, b.warningThresholdPct);
      return {
        ...b,
        categoryName: cat?.name ?? 'Kategori',
        categoryIcon: cat?.icon ?? 'tag',
        categoryColor: cat?.color ?? '#94A3B8',
        ...metrics,
      };
    });

    const goalViews: GoalView[] = goals.map((g) => ({
      ...g,
      ...calculateGoalMetrics(g, today),
    }));

    const insights = buildDeterministicInsights({
      currentSummary,
      previousSummary,
      topExpenseCategory: expenseByCategory[0] ?? null,
      budgets: evaluatedBudgets,
      goals: goalViews,
    });

    return ok({
      startDate: range.startDate,
      endDate: range.endDate,
      currentSummary,
      previousSummary,
      transactionCount: currentTxs.length,
      monthlySeries,
      expenseByCategory,
      incomeByCategory,
      insights,
    });
  } catch (error) {
    return mapDexieError(error);
  }
}
