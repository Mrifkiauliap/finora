import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FinoraDatabase } from '@/db/database';
import { initializeApp } from '@/services/bootstrapService';
import {
  applyRestore,
  exportBackupJson,
  inspectBackupContent,
} from '@/services/backupService';
import {
  copyBudgetsFromPreviousMonth,
  listMonthlyBudgets,
  upsertBudget,
} from '@/services/budgetService';
import {
  createCategory,
  deleteCategoryWithStrategy,
  setCategoryArchived,
} from '@/services/categoryService';
import { getDashboardSummary } from '@/services/dashboardService';
import { hasDemoData, loadDemoData } from '@/services/demoDataService';
import { exportTransactionsCsv } from '@/services/exportService';
import {
  createGoal,
  listGoals,
  recordGoalContribution,
} from '@/services/goalService';
import {
  createRecurringRule,
  materializeDueTransactions,
} from '@/services/recurringService';
import { factoryResetDatabase, updateSettings } from '@/services/settingsService';
import {
  createTransaction,
  deleteTransaction,
  queryTransactions,
  updateTransaction,
} from '@/services/transactionService';

let testDb: FinoraDatabase;
let seq = 0;

beforeEach(async () => {
  seq += 1;
  testDb = new FinoraDatabase(`FinoraTestDB_${seq}_${Date.now()}`);
  await initializeApp('2026-11-27', testDb);
});

afterEach(async () => {
  await testDb.delete();
});

describe('Finora Service Layer Integration (fake-indexeddb)', () => {
  it('TC-001 & TC-002: First-run bootstrap seeds 13 categories + default settings idempotently', async () => {
    const cats = await testDb.categories.toArray();
    const settings = await testDb.appSettings.get('default');
    expect(cats).toHaveLength(13);
    expect(cats.every((c) => c.isSystem)).toBe(true);
    expect(settings?.theme).toBe('light');
    expect(settings?.currency).toBe('IDR');

    // Second run should be idempotent
    await updateSettings({ theme: 'dark' }, testDb);
    const second = await initializeApp('2026-11-27', testDb);
    expect(second.ok).toBe(true);
    expect(await testDb.categories.count()).toBe(13);
    expect((await testDb.appSettings.get('default'))?.theme).toBe('dark');
  });

  it('TC-003, TC-005, TC-008, TC-009: Transaction CRUD and Dashboard aggregation', async () => {
    const inc = await createTransaction(
      {
        type: 'income',
        amount: 5_000_000,
        categoryId: 'cat-sys-salary',
        date: '2026-11-01',
        note: 'Gaji Nov',
        paymentMethod: 'bank_transfer',
      },
      testDb
    );
    expect(inc.ok).toBe(true);

    const exp = await createTransaction(
      {
        type: 'expense',
        amount: 2_000_000,
        categoryId: 'cat-sys-food',
        date: '2026-11-10',
        note: 'Belanja makan',
        paymentMethod: 'e_wallet',
      },
      testDb
    );
    expect(exp.ok).toBe(true);
    if (!exp.ok) return;

    const goal = await createGoal(
      { name: 'Dana Darurat', targetAmount: 10_000_000, deadline: null, icon: 'target', color: '#10B981', note: '' },
      testDb
    );
    expect(goal.ok).toBe(true);
    if (!goal.ok) return;

    await recordGoalContribution(
      { goalId: goal.data.id, amount: 1_000_000, date: '2026-11-12', note: 'Sisihan' },
      testDb
    );

    const dash = await getDashboardSummary('2026-11', '2026-11-27', testDb);
    expect(dash.ok).toBe(true);
    if (!dash.ok) return;

    expect(dash.data.netBalance).toBe(3_000_000);
    expect(dash.data.totalAllocatedSavings).toBe(1_000_000);
    expect(dash.data.availableBalance).toBe(2_000_000);
    expect(dash.data.monthlyIncome).toBe(5_000_000);
    expect(dash.data.monthlyExpense).toBe(2_000_000);
    expect(dash.data.savingsRatePct).toBe(60);

    // Edit expense -> income with mismatched category rejected, matching category succeeds
    const badEdit = await updateTransaction(
      exp.data.id,
      {
        type: 'income',
        amount: 100_000,
        categoryId: 'cat-sys-food',
        date: '2026-11-10',
        note: 'Ubah tipe',
        paymentMethod: 'cash',
      },
      testDb
    );
    expect(badEdit.ok).toBe(false);

    const goodEdit = await updateTransaction(
      exp.data.id,
      {
        type: 'expense',
        amount: 1_500_000,
        categoryId: 'cat-sys-food',
        date: '2026-11-10',
        note: 'Koreksi',
        paymentMethod: 'e_wallet',
      },
      testDb
    );
    expect(goodEdit.ok).toBe(true);

    const del = await deleteTransaction(exp.data.id, testDb);
    expect(del.ok).toBe(true);
    const dashAfterDel = await getDashboardSummary('2026-11', '2026-11-27', testDb);
    if (dashAfterDel.ok) {
      expect(dashAfterDel.data.monthlyExpense).toBe(0);
    }
  });

  it('TC-010 & TC-011: Multi-criteria search/filter and reversed date rejection', async () => {
    await createTransaction(
      {
        type: 'expense',
        amount: 32_000,
        categoryId: 'cat-sys-food',
        date: '2026-11-05',
        note: 'Kopi susu gula aren',
        paymentMethod: 'e_wallet',
      },
      testDb
    );
    await createTransaction(
      {
        type: 'expense',
        amount: 50_000,
        categoryId: 'cat-sys-transport',
        date: '2026-11-06',
        note: 'Ojek online',
        paymentMethod: 'cash',
      },
      testDb
    );

    const filtered = await queryTransactions(
      { type: 'expense', paymentMethod: 'e_wallet', search: 'kopi' },
      testDb
    );
    expect(filtered.ok).toBe(true);
    if (filtered.ok) {
      expect(filtered.data.items).toHaveLength(1);
      expect(filtered.data.summary.totalExpense).toBe(32_000);
    }

    const reversed = await queryTransactions(
      { startDate: '2026-11-20', endDate: '2026-11-10' },
      testDb
    );
    expect(reversed.ok).toBe(false);
  });

  it('TC-012, TC-013, TC-014: Category uniqueness, fallback protection, archive & atomic reassign with budget conflict', async () => {
    const c1 = await createCategory(
      { name: 'Kopi', type: 'expense', icon: 'coffee', color: '#F59E0B' },
      testDb
    );
    expect(c1.ok).toBe(true);
    if (!c1.ok) return;

    const dup = await createCategory(
      { name: ' kopi ', type: 'expense', icon: 'coffee', color: '#F59E0B' },
      testDb
    );
    expect(dup.ok).toBe(false);

    const sameNameOtherType = await createCategory(
      { name: 'Kopi', type: 'income', icon: 'coffee', color: '#10B981' },
      testDb
    );
    expect(sameNameOtherType.ok).toBe(true);

    // Protected fallback cannot be archived or deleted
    expect((await setCategoryArchived('cat-sys-other-expense', true, testDb)).ok).toBe(false);
    expect(
      (await deleteCategoryWithStrategy('cat-sys-other-expense', { mode: 'direct' }, testDb)).ok
    ).toBe(false);

    // Create transaction and conflicting budgets on C1 and cat-sys-food
    await createTransaction(
      {
        type: 'expense',
        amount: 45_000,
        categoryId: c1.data.id,
        date: '2026-11-15',
        note: 'Espresso',
        paymentMethod: 'cash',
      },
      testDb
    );
    await upsertBudget(
      { categoryId: c1.data.id, month: '2026-11', limitAmount: 300_000, warningThresholdPct: 80 },
      testDb
    );
    await upsertBudget(
      { categoryId: 'cat-sys-food', month: '2026-11', limitAmount: 1_000_000, warningThresholdPct: 80 },
      testDb
    );

    // Direct delete blocked while referenced
    expect((await deleteCategoryWithStrategy(c1.data.id, { mode: 'direct' }, testDb)).ok).toBe(
      false
    );

    // Reassign to cat-sys-food with mergeConflictingBudgets = true
    const reassigned = await deleteCategoryWithStrategy(
      c1.data.id,
      { mode: 'reassign', targetCategoryId: 'cat-sys-food', mergeConflictingBudgets: true },
      testDb
    );
    expect(reassigned.ok).toBe(true);
    expect(await testDb.categories.get(c1.data.id)).toBeUndefined();

    const foodBudget = await testDb.budgets
      .where('[categoryId+month]')
      .equals(['cat-sys-food', '2026-11'])
      .first();
    expect(foodBudget?.limitAmount).toBe(1_300_000);
    const txCountFood = await testDb.transactions.where('categoryId').equals('cat-sys-food').count();
    expect(txCountFood).toBe(1);
  });

  it('TC-015 & TC-016: Budget uniqueness, expense-only rule & selective copy from previous month', async () => {
    const incomeBudget = await upsertBudget(
      { categoryId: 'cat-sys-salary', month: '2026-11', limitAmount: 1_000_000, warningThresholdPct: 80 },
      testDb
    );
    expect(incomeBudget.ok).toBe(false);

    await upsertBudget(
      { categoryId: 'cat-sys-food', month: '2026-10', limitAmount: 1_500_000, warningThresholdPct: 80 },
      testDb
    );
    await upsertBudget(
      { categoryId: 'cat-sys-transport', month: '2026-10', limitAmount: 500_000, warningThresholdPct: 85 },
      testDb
    );
    // 2026-11 already has food budget with different limit (must not be overwritten)
    await upsertBudget(
      { categoryId: 'cat-sys-food', month: '2026-11', limitAmount: 2_000_000, warningThresholdPct: 80 },
      testDb
    );

    const copied = await copyBudgetsFromPreviousMonth('2026-11', testDb);
    expect(copied.ok).toBe(true);
    if (copied.ok) {
      expect(copied.data.copiedCount).toBe(1);
      expect(copied.data.skippedCount).toBe(1);
    }

    const novSummary = await listMonthlyBudgets('2026-11', testDb);
    if (novSummary.ok) {
      const food = novSummary.data.budgets.find((b) => b.categoryId === 'cat-sys-food');
      expect(food?.limitAmount).toBe(2_000_000);
    }
  });

  it('TC-020 & TC-021: Goal contributions anti-double counting, negative withdrawal guard & auto-complete', async () => {
    await createTransaction(
      {
        type: 'income',
        amount: 5_000_000,
        categoryId: 'cat-sys-salary',
        date: '2026-11-01',
        note: 'Gaji',
        paymentMethod: 'bank_transfer',
      },
      testDb
    );
    await createTransaction(
      {
        type: 'expense',
        amount: 1_000_000,
        categoryId: 'cat-sys-bills',
        date: '2026-11-03',
        note: 'Listrik',
        paymentMethod: 'bank_transfer',
      },
      testDb
    );

    const goal = await createGoal(
      { name: 'Laptop', targetAmount: 1_000_000, deadline: null, icon: 'target', color: '#10B981', note: '' },
      testDb
    );
    expect(goal.ok).toBe(true);
    if (!goal.ok) return;

    await recordGoalContribution(
      { goalId: goal.data.id, amount: 800_000, date: '2026-11-10', note: 'Tabung' },
      testDb
    );

    // Over-withdrawal rejected
    const badWithdraw = await recordGoalContribution(
      { goalId: goal.data.id, amount: -900_000, date: '2026-11-11', note: 'Tarik' },
      testDb
    );
    expect(badWithdraw.ok).toBe(false);

    // Complete goal
    const completeDeposit = await recordGoalContribution(
      { goalId: goal.data.id, amount: 200_000, date: '2026-11-12', note: 'Lunas' },
      testDb
    );
    expect(completeDeposit.ok).toBe(true);
    if (completeDeposit.ok) {
      expect(completeDeposit.data.goal.status).toBe('completed');
    }

    const dash = await getDashboardSummary('2026-11', '2026-11-27', testDb);
    if (dash.ok) {
      expect(dash.data.monthlyExpense).toBe(1_000_000); // unchanged by goal contributions
      expect(dash.data.netBalance).toBe(4_000_000);
      expect(dash.data.availableBalance).toBe(3_000_000);
    }

    const goalsList = await listGoals('2026-11-27', testDb);
    expect(goalsList.ok && goalsList.data[0]?.progressPct).toBe(100);
  });

  it('TC-023 & TC-024: Recurring materialization is idempotent, respects endDate, and caps at 366', async () => {
    const monthlyRule = await createRecurringRule(
      {
        type: 'expense',
        amount: 1_000_000,
        categoryId: 'cat-sys-bills',
        note: 'Kos',
        paymentMethod: 'bank_transfer',
        frequency: 'monthly',
        interval: 1,
        startDate: '2026-09-30',
        endDate: '2026-11-15',
      },
      testDb
    );
    expect(monthlyRule.ok).toBe(true);

    const run1 = await materializeDueTransactions('2026-11-27', testDb);
    expect(run1.ok).toBe(true);
    if (run1.ok) {
      expect(run1.data.generatedCount).toBe(2); // 2026-09-30 & 2026-10-30
    }
    const run2 = await materializeDueTransactions('2026-11-27', testDb);
    if (run2.ok) {
      expect(run2.data.generatedCount).toBe(0);
    }

    // 366 catch-up cap test
    const dailyRule = await createRecurringRule(
      {
        type: 'expense',
        amount: 10_000,
        categoryId: 'cat-sys-food',
        note: 'Sarapan',
        paymentMethod: 'cash',
        frequency: 'daily',
        interval: 1,
        startDate: '2020-01-01',
        endDate: null,
      },
      testDb
    );
    expect(dailyRule.ok).toBe(true);
    const runCap = await materializeDueTransactions('2026-11-27', testDb);
    expect(runCap.ok).toBe(true);
    if (runCap.ok && dailyRule.ok) {
      expect(runCap.data.generatedCount).toBe(366);
      expect(runCap.data.cappedRuleIds).toContain(dailyRule.data.id);
    }
  });

  it('TC-027, TC-030, TC-031..TC-035: Backup export, SHA-256 tamper reject, prototype pollution guard, Replace/Merge & Factory Reset', async () => {
    await createTransaction(
      {
        type: 'income',
        amount: 3_000_000,
        categoryId: 'cat-sys-salary',
        date: '2026-11-01',
        note: 'Gaji',
        paymentMethod: 'bank_transfer',
      },
      testDb
    );
    await upsertBudget(
      { categoryId: 'cat-sys-food', month: '2026-11', limitAmount: 800_000, warningThresholdPct: 80 },
      testDb
    );

    const csvRes = await exportTransactionsCsv({}, testDb);
    expect(csvRes.ok && csvRes.data.rowCount === 1).toBe(true);

    const exported = await exportBackupJson(testDb);
    expect(exported.ok).toBe(true);
    if (!exported.ok) return;
    expect(exported.data.envelope.checksum.value).toMatch(/^[a-f0-9]{64}$/);
    expect((await testDb.appSettings.get('default'))?.lastBackupAt).not.toBeNull();

    // Tamper 1 character -> CHECKSUM_MISMATCH
    const tamperedEnvelope = structuredClone(exported.data.envelope);
    tamperedEnvelope.payload.transactions[0]!.amount = 3_000_001;
    const tamperedRes = await inspectBackupContent(
      JSON.stringify(tamperedEnvelope),
      { name: 'tampered.json', size: 1024 },
      testDb
    );
    expect(tamperedRes.ok).toBe(false);
    if (!tamperedRes.ok) {
      expect(tamperedRes.error.code).toBe('CHECKSUM_MISMATCH');
    }

    // Prototype pollution key -> rejected
    const protoText = '{"__proto__":{"polluted":true},"appName":"Finora","backupFormatVersion":1}';
    const protoRes = await inspectBackupContent(
      protoText,
      { name: 'proto.json', size: protoText.length },
      testDb
    );
    expect(protoRes.ok).toBe(false);

    // Unsupported version -> rejected
    const futureVer = { ...exported.data.envelope, backupFormatVersion: 99 };
    const futureRes = await inspectBackupContent(
      JSON.stringify(futureVer),
      { name: 'future.json', size: 1024 },
      testDb
    );
    expect(futureRes.ok).toBe(false);
    if (!futureRes.ok) {
      expect(futureRes.error.code).toBe('UNSUPPORTED_VERSION');
    }

    // Factory Reset requires exact "HAPUS"
    expect((await factoryResetDatabase('hapus', { reseedDefaultCategories: true }, testDb)).ok).toBe(false);
    expect((await factoryResetDatabase('HAPUS', { reseedDefaultCategories: true }, testDb)).ok).toBe(true);
    expect(await testDb.transactions.count()).toBe(0);

    // Inspect valid backup & Replace All (requires "TIMPA")
    const validInspect = await inspectBackupContent(
      exported.data.jsonText,
      { name: exported.data.filename, size: exported.data.jsonText.length },
      testDb
    );
    expect(validInspect.ok).toBe(true);
    if (!validInspect.ok) return;

    expect(
      (await applyRestore(validInspect.data.envelope, { mode: 'replace', confirmationText: 'timpa' }, testDb)).ok
    ).toBe(false);

    const replaceOk = await applyRestore(
      validInspect.data.envelope,
      { mode: 'replace', confirmationText: 'TIMPA' },
      testDb
    );
    expect(replaceOk.ok).toBe(true);
    expect(await testDb.transactions.count()).toBe(1);

    // Merge mode with budget conflict
    await upsertBudget(
      { categoryId: 'cat-sys-food', month: '2026-11', limitAmount: 1_200_000, warningThresholdPct: 80 },
      testDb
    );
    const mergeSkip = await applyRestore(
      validInspect.data.envelope,
      { mode: 'merge', conflictStrategy: 'skip_existing' },
      testDb
    );
    expect(mergeSkip.ok).toBe(true);
    const bAfterSkip = await testDb.budgets
      .where('[categoryId+month]')
      .equals(['cat-sys-food', '2026-11'])
      .first();
    expect(bAfterSkip?.limitAmount).toBe(1_200_000);
  });

  it('TC-036: Benchmark 5.000 transactions dashboard aggregation stays performant', async () => {
    const nowIso = new Date().toISOString();
    const bulk = Array.from({ length: 5000 }, (_, i) => ({
      id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
      type: i % 5 === 0 ? ('income' as const) : ('expense' as const),
      amount: 25_000 + (i % 100) * 1000,
      categoryId: i % 5 === 0 ? 'cat-sys-salary' : 'cat-sys-food',
      date: `2026-${String((i % 11) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      note: `Tx ${i}`,
      paymentMethod: 'cash' as const,
      recurringRuleId: null,
      recurringOccurrenceDate: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    }));
    await testDb.transactions.bulkAdd(bulk);

    const t0 = performance.now();
    const dash = await getDashboardSummary('2026-11', '2026-11-27', testDb);
    const elapsedMs = performance.now() - t0;

    expect(dash.ok).toBe(true);
    expect(dash.ok && dash.data.totalTransactionCount).toBe(5000);
    // In fake-indexeddb / CI environments give generous margin while logging actual ms
    expect(elapsedMs).toBeLessThan(1500);
  });

  it('loadDemoData seeds realistic data, yields positive available balance, and stays idempotent', async () => {
    const first = await loadDemoData(testDb, '2026-11-27');
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    expect(first.data.transactionsCount).toBeGreaterThanOrEqual(20);
    expect(first.data.budgetsCount).toBe(5);
    expect(first.data.goalsCount).toBe(3);
    expect(first.data.recurringCount).toBe(3);

    const dash = await getDashboardSummary('2026-11', '2026-11-27', testDb);
    expect(dash.ok).toBe(true);
    if (!dash.ok) return;

    expect(dash.data.netBalance).toBe(17_450_000);
    expect(dash.data.totalAllocatedSavings).toBe(9_500_000);
    expect(dash.data.availableBalance).toBe(7_950_000);
    expect(dash.data.monthlyIncome).toBe(11_250_000);
    expect(dash.data.monthlyExpense).toBe(4_820_000);
    expect(dash.data.budgetAlerts.some((b) => b.status === 'exceeded')).toBe(true);
    expect(dash.data.budgetAlerts.some((b) => b.status === 'warning')).toBe(true);

    const second = await loadDemoData(testDb, '2026-11-27');
    expect(second.ok).toBe(true);
    expect(await testDb.transactions.count()).toBe(first.data.transactionsCount);
    expect(await testDb.goalContributions.count()).toBe(5);
  });

  it('seedDemoOnFirstRun seeds demo once on fresh DB and stays empty after factory reset', async () => {
    const freshDb = new FinoraDatabase(`FinoraFirstRunDB_${Date.now()}`);
    try {
      const firstInit = await initializeApp('2026-11-27', freshDb, {
        seedDemoOnFirstRun: true,
      });
      expect(firstInit.ok).toBe(true);
      if (!firstInit.ok) return;
      expect(firstInit.data.demoSeeded).toBe(true);
      expect(await hasDemoData(freshDb)).toBe(true);
      expect(await freshDb.transactions.count()).toBeGreaterThanOrEqual(20);

      const resetRes = await factoryResetDatabase(
        'HAPUS',
        { reseedDefaultCategories: true },
        freshDb
      );
      expect(resetRes.ok).toBe(true);
      expect(await hasDemoData(freshDb)).toBe(false);
      expect(await freshDb.transactions.count()).toBe(0);

      const reloadInit = await initializeApp('2026-11-27', freshDb, {
        seedDemoOnFirstRun: true,
      });
      expect(reloadInit.ok).toBe(true);
      if (!reloadInit.ok) return;
      expect(reloadInit.data.demoSeeded).toBe(false);
      expect(await hasDemoData(freshDb)).toBe(false);
      expect(await freshDb.transactions.count()).toBe(0);
    } finally {
      await freshDb.delete();
    }
  });
});
