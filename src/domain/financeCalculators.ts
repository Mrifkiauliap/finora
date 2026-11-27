import type {
  BudgetStatus,
  FinancialGoalRecord,
  TransactionRecord,
} from '@/db/types';
import { getCalendarDaysDifference } from './dates';

export interface CashflowSummary {
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
  savingsRatePct: number | null;
}

export interface BudgetMetrics {
  spentAmount: number;
  remainingAmount: number;
  utilizationPct: number;
  status: BudgetStatus;
}

export interface GoalCalculatedMetrics {
  progressPct: number;
  remainingTarget: number;
  requiredMonthlySaving: number | null;
  remainingMonths: number | null;
  isOverdue: boolean;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * RULE-002, RULE-003, RULE-005: Menghitung pemasukan, pengeluaran, arus kas bersih, dan rasio tabungan.
 */
export function calculateCashflowSummary(
  transactions: Pick<TransactionRecord, 'type' | 'amount'>[]
): CashflowSummary {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const tx of transactions) {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else {
      totalExpense += tx.amount;
    }
  }

  const netCashflow = totalIncome - totalExpense;
  const savingsRatePct =
    totalIncome === 0 ? null : round1((netCashflow / totalIncome) * 100);

  return {
    totalIncome,
    totalExpense,
    netCashflow,
    savingsRatePct,
  };
}

/**
 * RULE-004: Menghitung Saldo Bersih seluruh waktu.
 */
export function calculateNetBalance(
  allTransactions: Pick<TransactionRecord, 'type' | 'amount'>[]
): number {
  return calculateCashflowSummary(allTransactions).netCashflow;
}

/**
 * RULE-018: Total dana teralokasi ke seluruh target keuangan.
 */
export function calculateTotalAllocatedSavings(
  goals: Pick<FinancialGoalRecord, 'currentAmount'>[]
): number {
  let total = 0;
  for (const goal of goals) {
    total += Math.max(0, goal.currentAmount);
  }
  return total;
}

/**
 * RULE-018: Saldo Tersedia = Saldo Bersih - Total Dana Teralokasi.
 */
export function calculateAvailableBalance(
  netBalance: number,
  goals: Pick<FinancialGoalRecord, 'currentAmount'>[]
): number {
  return netBalance - calculateTotalAllocatedSavings(goals);
}

/**
 * RULE-009 & RULE-010: Evaluasi anggaran dengan perbandingan integer eksak untuk status ambang batas.
 */
export function calculateBudgetMetrics(
  limitAmount: number,
  spentAmount: number,
  warningThresholdPct: number
): BudgetMetrics {
  const remainingAmount = limitAmount - spentAmount;
  const utilizationPct =
    limitAmount <= 0 ? 0 : round1((spentAmount / limitAmount) * 100);

  let status: BudgetStatus = 'safe';
  if (spentAmount > limitAmount) {
    status = 'exceeded';
  } else if (spentAmount * 100 >= limitAmount * warningThresholdPct) {
    status = 'warning';
  }

  return {
    spentAmount,
    remainingAmount,
    utilizationPct,
    status,
  };
}

/**
 * RULE-018: Progres target, sisa target, dan estimasi tabungan bulanan.
 */
export function calculateGoalMetrics(
  goal: Pick<FinancialGoalRecord, 'targetAmount' | 'currentAmount' | 'deadline'>,
  today: string
): GoalCalculatedMetrics {
  const remainingTarget = Math.max(0, goal.targetAmount - goal.currentAmount);
  const rawPct =
    goal.targetAmount <= 0 ? 0 : round1((goal.currentAmount / goal.targetAmount) * 100);
  const progressPct = Math.min(100, Math.max(0, rawPct));

  if (!goal.deadline || remainingTarget === 0) {
    return {
      progressPct,
      remainingTarget,
      requiredMonthlySaving: null,
      remainingMonths: null,
      isOverdue: Boolean(goal.deadline && goal.deadline < today && remainingTarget > 0),
    };
  }

  const diffDays = getCalendarDaysDifference(goal.deadline, today);
  const isOverdue = diffDays < 0 && remainingTarget > 0;
  const remainingDays = Math.max(1, diffDays);
  const remainingMonths = Math.max(1, Math.ceil(remainingDays / 30));
  const requiredMonthlySaving = Math.ceil(remainingTarget / remainingMonths);

  return {
    progressPct,
    remainingTarget,
    requiredMonthlySaving,
    remainingMonths,
    isOverdue,
  };
}
