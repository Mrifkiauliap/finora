import type { BudgetEvaluationView, GoalView } from '@/db/types';
import { formatIdr } from './money';
import type { CashflowSummary } from './financeCalculators';

export type InsightTone = 'positive' | 'warning' | 'danger' | 'neutral';

export interface DeterministicInsight {
  id: string;
  title: string;
  description: string;
  tone: InsightTone;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  color: string;
  amount: number;
  percentage: number;
}

export function buildDeterministicInsights(params: {
  currentSummary: CashflowSummary;
  previousSummary: CashflowSummary;
  topExpenseCategory: CategoryBreakdownItem | null;
  budgets: BudgetEvaluationView[];
  goals: GoalView[];
}): DeterministicInsight[] {
  const insights: DeterministicInsight[] = [];
  const { currentSummary, previousSummary, topExpenseCategory, budgets, goals } = params;

  // 1. Perbandingan pengeluaran periode berjalan vs periode sebelumnya
  if (previousSummary.totalExpense > 0 && currentSummary.totalExpense > 0) {
    const diff = currentSummary.totalExpense - previousSummary.totalExpense;
    const pct = Math.round((Math.abs(diff) / previousSummary.totalExpense) * 1000) / 10;
    if (diff > 0) {
      insights.push({
        id: 'expense-mom-up',
        title: `Pengeluaran naik ${pct.toLocaleString('id-ID')}%`,
        description: `Total pengeluaran periode ini lebih tinggi ${formatIdr(diff)} dibanding periode pembanding sebelumnya.`,
        tone: pct >= 20 ? 'warning' : 'neutral',
      });
    } else if (diff < 0) {
      insights.push({
        id: 'expense-mom-down',
        title: `Pengeluaran turun ${pct.toLocaleString('id-ID')}%`,
        description: `Anda berhasil menghemat ${formatIdr(Math.abs(diff))} dibanding periode sebelumnya.`,
        tone: 'positive',
      });
    } else {
      insights.push({
        id: 'expense-mom-flat',
        title: 'Pengeluaran stabil',
        description: 'Total pengeluaran sama persis dengan periode pembanding sebelumnya.',
        tone: 'neutral',
      });
    }
  }

  // 2. Kategori pengeluaran terbesar
  if (topExpenseCategory) {
    insights.push({
      id: 'top-expense-category',
      title: `Pos terbesar: ${topExpenseCategory.categoryName}`,
      description: `Menyumbang ${topExpenseCategory.percentage.toLocaleString('id-ID')}% (${formatIdr(topExpenseCategory.amount)}) dari total pengeluaran periode ini.`,
      tone: 'neutral',
    });
  }

  // 3. Kesehatan Rasio Tabungan
  if (currentSummary.savingsRatePct !== null) {
    if (currentSummary.savingsRatePct >= 20) {
      insights.push({
        id: 'savings-healthy',
        title: `Rasio tabungan sehat (${currentSummary.savingsRatePct.toLocaleString('id-ID')}%)`,
        description: 'Sisa arus kas bersih berada di atas patokan umum 20% dari total pemasukan.',
        tone: 'positive',
      });
    } else if (currentSummary.savingsRatePct >= 0) {
      insights.push({
        id: 'savings-thin',
        title: `Rasio tabungan ${currentSummary.savingsRatePct.toLocaleString('id-ID')}%`,
        description: 'Arus kas masih positif, namun margin tabungan relatif tipis. Tinjau pos pengeluaran terbesar.',
        tone: 'warning',
      });
    } else {
      insights.push({
        id: 'savings-deficit',
        title: 'Arus kas defisit',
        description: `Pengeluaran melebihi pemasukan sebesar ${formatIdr(Math.abs(currentSummary.netCashflow))} pada periode ini.`,
        tone: 'danger',
      });
    }
  }

  // 4. Status Anggaran bulan aktif
  const exceededCount = budgets.filter((b) => b.status === 'exceeded').length;
  const warningCount = budgets.filter((b) => b.status === 'warning').length;
  if (exceededCount > 0) {
    insights.push({
      id: 'budget-exceeded',
      title: `${exceededCount} anggaran melewati batas`,
      description: 'Segera evaluasi kategori yang berstatus melebihi batas pada halaman Anggaran.',
      tone: 'danger',
    });
  } else if (warningCount > 0) {
    insights.push({
      id: 'budget-warning',
      title: `${warningCount} anggaran mendekati batas`,
      description: 'Pemakaian beberapa kategori telah mencapai ambang peringatan yang Anda tetapkan.',
      tone: 'warning',
    });
  }

  // 5. Progres target aktif terdekat
  const activeGoals = goals.filter((g) => g.status === 'active');
  if (activeGoals.length > 0) {
    const closest = [...activeGoals].sort((a, b) => b.progressPct - a.progressPct)[0];
    if (closest) {
      insights.push({
        id: 'goal-closest',
        title: `Target terdekat: ${closest.name}`,
        description: `Progres mencapai ${closest.progressPct.toLocaleString('id-ID')}% dengan sisa target ${formatIdr(closest.remainingTarget)}.`,
        tone: 'positive',
      });
    }
  }

  return insights;
}
