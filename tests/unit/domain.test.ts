import { describe, expect, it } from 'vitest';
import { sanitizeCsvCell, serializeTransactionsToCsv } from '@/domain/csvFormatter';
import {
  computeNextOccurrenceDate,
  getLocalToday,
  isValidCalendarDate,
  previewNextOccurrences,
} from '@/domain/dates';
import {
  calculateBudgetMetrics,
  calculateCashflowSummary,
  calculateGoalMetrics,
} from '@/domain/financeCalculators';
import { buildDeterministicInsights } from '@/domain/insightsEngine';
import { formatIdr, parseIdrDigits } from '@/domain/money';
import { buildCashflowSankeyData } from '@/domain/sankeyLayout';
import { UpsertBudgetSchema } from '@/schemas/budgetSchema';
import { CreateTransactionSchema } from '@/schemas/transactionSchema';

describe('Domain Calculators & Validators (Finora BUSINESS_RULES)', () => {
  it('TC-004: SavingsRate returns null when TotalIncome is 0', () => {
    const summary = calculateCashflowSummary([
      { type: 'expense', amount: 250_000 },
    ]);
    expect(summary.totalIncome).toBe(0);
    expect(summary.totalExpense).toBe(250_000);
    expect(summary.netCashflow).toBe(-250_000);
    expect(summary.savingsRatePct).toBeNull();
  });

  it('TC-006: Rejects invalid IDR transaction amounts (0, negative, float, > max)', () => {
    const base = {
      type: 'expense' as const,
      categoryId: 'cat-sys-food',
      date: '2026-11-27',
      note: '',
      paymentMethod: 'cash' as const,
    };

    expect(CreateTransactionSchema.safeParse({ ...base, amount: 0 }).success).toBe(false);
    expect(CreateTransactionSchema.safeParse({ ...base, amount: -5000 }).success).toBe(false);
    expect(CreateTransactionSchema.safeParse({ ...base, amount: 1250.5 }).success).toBe(false);
    expect(
      CreateTransactionSchema.safeParse({ ...base, amount: 1_000_000_000_000 }).success
    ).toBe(false);
    expect(CreateTransactionSchema.safeParse({ ...base, amount: 35_000 }).success).toBe(true);

    expect(formatIdr(35_000)).toBe('Rp 35.000');
    expect(formatIdr(-50_000)).toBe('-Rp 50.000');
    expect(parseIdrDigits('Rp 125.000')).toBe(125_000);
  });

  it('TC-007: Local calendar date helper never shifts day to UTC yesterday and validates calendar dates', () => {
    // 2026-11-27 00:30 local time constructed directly via local Date constructor
    const earlyMorningLocal = new Date(2026, 10, 27, 0, 30, 0);
    expect(getLocalToday(earlyMorningLocal)).toBe('2026-11-27');
    expect(isValidCalendarDate('2026-02-29')).toBe(false);
    expect(isValidCalendarDate('2024-02-29')).toBe(true);
    expect(isValidCalendarDate('2026-11-27')).toBe(true);
  });

  it('TC-017: Exact budget boundary classification (safe, warning, exceeded)', () => {
    expect(calculateBudgetMetrics(1_000_000, 799_999, 80).status).toBe('safe');
    expect(calculateBudgetMetrics(1_000_000, 800_000, 80).status).toBe('warning');
    expect(calculateBudgetMetrics(1_000_000, 1_000_000, 80).status).toBe('warning');
    const exceeded = calculateBudgetMetrics(1_000_000, 1_000_001, 80);
    expect(exceeded.status).toBe('exceeded');
    expect(exceeded.remainingAmount).toBe(-1);

    // Precision edge case with large IDR budget
    expect(calculateBudgetMetrics(1_000_000_000, 1_000_000_001, 80).status).toBe('exceeded');
  });

  it('TC-018: Validates warningThresholdPct strictly within 50..95', () => {
    expect(
      UpsertBudgetSchema.safeParse({
        categoryId: 'cat-sys-food',
        month: '2026-11',
        limitAmount: 1_000_000,
        warningThresholdPct: 49,
      }).success
    ).toBe(false);
    expect(
      UpsertBudgetSchema.safeParse({
        categoryId: 'cat-sys-food',
        month: '2026-11',
        limitAmount: 1_000_000,
        warningThresholdPct: 96,
      }).success
    ).toBe(false);
    expect(
      UpsertBudgetSchema.safeParse({
        categoryId: 'cat-sys-food',
        month: '2026-11',
        limitAmount: 1_000_000,
        warningThresholdPct: 80,
      }).success
    ).toBe(true);
  });

  it('TC-019: Calculates goal progress, remaining target, and monthly saving estimate', () => {
    const metrics = calculateGoalMetrics(
      {
        targetAmount: 6_000_000,
        currentAmount: 1_000_000,
        deadline: '2027-01-26',
      },
      '2026-11-27'
    );
    expect(metrics.remainingTarget).toBe(5_000_000);
    expect(metrics.progressPct).toBe(16.7);
    expect(metrics.remainingMonths).toBe(2);
    expect(metrics.requiredMonthlySaving).toBe(2_500_000);
    expect(metrics.isOverdue).toBe(false);
  });

  it('TC-022: Monthly recurring end-of-month clamping preserves anchorDay 31 across Feb/Mar/Apr', () => {
    const rule = {
      frequency: 'monthly' as const,
      interval: 1,
      anchorDay: 31,
      startDate: '2026-01-31',
      endDate: null,
    };
    const dates = previewNextOccurrences(rule, 4);
    expect(dates).toEqual([
      '2026-01-31',
      '2026-02-28',
      '2026-03-31',
      '2026-04-30',
    ]);

    // Leap year yearly Feb 29 -> 2025-02-28 -> 2028-02-29
    expect(
      computeNextOccurrenceDate(
        { frequency: 'yearly', interval: 1, anchorDay: null, startDate: '2024-02-29' },
        '2024-02-29'
      )
    ).toBe('2025-02-28');
    expect(
      computeNextOccurrenceDate(
        { frequency: 'yearly', interval: 3, anchorDay: null, startDate: '2024-02-29' },
        '2025-02-28'
      )
    ).toBe('2028-02-29');
  });

  it('TC-026: Builds deterministic local financial insights without network', () => {
    const insights = buildDeterministicInsights({
      currentSummary: {
        totalIncome: 5_000_000,
        totalExpense: 1_250_000,
        netCashflow: 3_750_000,
        savingsRatePct: 75,
      },
      previousSummary: {
        totalIncome: 5_000_000,
        totalExpense: 1_000_000,
        netCashflow: 4_000_000,
        savingsRatePct: 80,
      },
      topExpenseCategory: {
        categoryId: 'cat-sys-food',
        categoryName: 'Makanan & Minuman',
        color: '#F59E0B',
        amount: 750_000,
        percentage: 60,
      },
      budgets: [],
      goals: [],
    });

    expect(insights.some((i) => i.id === 'expense-mom-up' && i.title.includes('25%'))).toBe(
      true
    );
    expect(
      insights.some((i) => i.id === 'top-expense-category' && i.title.includes('Makanan'))
    ).toBe(true);
    expect(insights.some((i) => i.id === 'savings-healthy')).toBe(true);
  });

  it('TC-028: Sanitizes CSV cells against formula injection and prepends UTF-8 BOM', () => {
    expect(sanitizeCsvCell('=1+1')).toBe('"\'=1+1"');
    expect(sanitizeCsvCell('+cmd')).toBe('"\'+cmd"');
    expect(sanitizeCsvCell('-100')).toBe('"\'-100"');
    expect(sanitizeCsvCell('@SUM(A1)')).toBe('"\'@SUM(A1)"');
    expect(sanitizeCsvCell('Biasa "kutip"')).toBe('"Biasa ""kutip"""');

    const csv = serializeTransactionsToCsv([
      {
        id: '1',
        type: 'expense',
        amount: 25_000,
        categoryId: 'cat-sys-food',
        categoryName: 'Makanan',
        categoryIcon: 'utensils',
        categoryColor: '#F59E0B',
        categoryArchived: false,
        date: '2026-11-27',
        note: '=HYPERLINK("http://bad")',
        paymentMethod: 'cash',
        recurringRuleId: null,
        recurringOccurrenceDate: null,
        createdAt: '2026-11-27T00:00:00.000Z',
        updatedAt: '2026-11-27T00:00:00.000Z',
      },
    ]);

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('"\'=HYPERLINK(""http://bad"")"');
  });

  it('buildCashflowSankeyData balances surplus, deficit, and category overflow cleanly', () => {
    const empty = buildCashflowSankeyData({
      incomeByCategory: [],
      expenseByCategory: [],
      totalIncome: 0,
      totalExpense: 0,
    });
    expect(empty.hubTotal).toBe(0);
    expect(empty.centerNode).toBeNull();

    const surplus = buildCashflowSankeyData({
      incomeByCategory: [
        { categoryId: 'inc1', categoryName: 'Gaji', color: '#10B981', amount: 8_500_000, percentage: 85 },
        { categoryId: 'inc2', categoryName: 'Freelance', color: '#38BDF8', amount: 1_500_000, percentage: 15 },
      ],
      expenseByCategory: [
        { categoryId: 'e1', categoryName: 'Makanan', color: '#F59E0B', amount: 2_000_000, percentage: 40 },
        { categoryId: 'e2', categoryName: 'Tagihan', color: '#FB7185', amount: 1_500_000, percentage: 30 },
        { categoryId: 'e3', categoryName: 'Transport', color: '#38BDF8', amount: 500_000, percentage: 10 },
        { categoryId: 'e4', categoryName: 'Belanja', color: '#A78BFA', amount: 400_000, percentage: 8 },
        { categoryId: 'e5', categoryName: 'Hiburan', color: '#E879F9', amount: 300_000, percentage: 6 },
        { categoryId: 'e6', categoryName: 'Kesehatan', color: '#22C55E', amount: 200_000, percentage: 4 },
        { categoryId: 'e7', categoryName: 'Pendidikan', color: '#60A5FA', amount: 100_000, percentage: 2 },
      ],
      totalIncome: 10_000_000,
      totalExpense: 5_000_000,
    });

    expect(surplus.hubTotal).toBe(10_000_000);
    expect(surplus.leftNodes).toHaveLength(2);
    expect(surplus.rightNodes[0]?.kind).toBe('savings');
    expect(surplus.rightNodes[0]?.amount).toBe(5_000_000);
    // 1 savings node + top 5 expenses + 1 Pengeluaran Lainnya overflow = 7 right nodes
    expect(surplus.rightNodes).toHaveLength(7);
    expect(surplus.rightNodes.some((n) => n.label === 'Pengeluaran Lainnya' && n.amount === 300_000)).toBe(true);
    expect(surplus.leftNodes.reduce((s, n) => s + n.amount, 0)).toBe(surplus.hubTotal);
    expect(surplus.rightNodes.reduce((s, n) => s + n.amount, 0)).toBe(surplus.hubTotal);
    expect(surplus.links).toHaveLength(surplus.leftNodes.length + surplus.rightNodes.length);

    const deficit = buildCashflowSankeyData({
      incomeByCategory: [
        { categoryId: 'inc1', categoryName: 'Gaji', color: '#10B981', amount: 3_000_000, percentage: 100 },
      ],
      expenseByCategory: [
        { categoryId: 'e1', categoryName: 'Tagihan', color: '#FB7185', amount: 4_500_000, percentage: 100 },
      ],
      totalIncome: 3_000_000,
      totalExpense: 4_500_000,
    });
    expect(deficit.hubTotal).toBe(4_500_000);
    expect(deficit.leftNodes.some((n) => n.kind === 'deficit' && n.amount === 1_500_000)).toBe(true);
    expect(deficit.leftNodes.reduce((s, n) => s + n.amount, 0)).toBe(deficit.hubTotal);
    expect(deficit.rightNodes.reduce((s, n) => s + n.amount, 0)).toBe(deficit.hubTotal);
  });
});
