import { db, type FinoraDatabase } from '@/db/database';
import type {
  FinancialGoalRecord,
  GoalContributionRecord,
  GoalStatus,
  GoalView,
} from '@/db/types';
import { MAX_IDR_AMOUNT } from '@/domain/constants';
import { getLocalToday } from '@/domain/dates';
import { calculateGoalMetrics } from '@/domain/financeCalculators';
import {
  CreateGoalSchema,
  GoalContributionInputSchema,
  UpdateGoalSchema,
  type CreateGoalInput,
  type GoalContributionInput,
  type UpdateGoalInput,
} from '@/schemas/goalSchema';
import {
  err,
  generateUuid,
  mapDexieError,
  mapZodError,
  ok,
  ServiceDomainError,
  type ServiceResult,
} from './errors';

export async function listGoals(
  today: string = getLocalToday(),
  database: FinoraDatabase = db
): Promise<ServiceResult<GoalView[]>> {
  try {
    const goals = await database.financialGoals.orderBy('createdAt').reverse().toArray();
    const views: GoalView[] = goals.map((g) => ({
      ...g,
      ...calculateGoalMetrics(g, today),
    }));
    return ok(views);
  } catch (error) {
    return mapDexieError(error);
  }
}

export async function createGoal(
  input: CreateGoalInput,
  database: FinoraDatabase = db
): Promise<ServiceResult<FinancialGoalRecord>> {
  const parsed = CreateGoalSchema.safeParse(input);
  if (!parsed.success) {
    return mapZodError(parsed.error);
  }

  const data = parsed.data;
  try {
    const nowIso = new Date().toISOString();
    const record: FinancialGoalRecord = {
      id: generateUuid(),
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: 0,
      deadline: data.deadline,
      status: 'active',
      icon: data.icon,
      color: data.color,
      note: data.note,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    await database.financialGoals.add(record);
    return ok(record);
  } catch (error) {
    return mapDexieError(error);
  }
}

export async function updateGoal(
  id: string,
  input: UpdateGoalInput,
  database: FinoraDatabase = db
): Promise<ServiceResult<FinancialGoalRecord>> {
  const parsed = UpdateGoalSchema.safeParse(input);
  if (!parsed.success) {
    return mapZodError(parsed.error);
  }

  const data = parsed.data;
  try {
    const existing = await database.financialGoals.get(id);
    if (!existing) {
      return err('NOT_FOUND', 'Target keuangan tidak ditemukan.');
    }

    let nextStatus: GoalStatus = data.status ?? existing.status;
    if (existing.currentAmount >= data.targetAmount) {
      nextStatus = 'completed';
    } else if (nextStatus === 'completed' && existing.currentAmount < data.targetAmount) {
      nextStatus = 'active';
    }

    const updated: FinancialGoalRecord = {
      ...existing,
      name: data.name,
      targetAmount: data.targetAmount,
      deadline: data.deadline,
      icon: data.icon,
      color: data.color,
      note: data.note,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    };
    await database.financialGoals.put(updated);
    return ok(updated);
  } catch (error) {
    return mapDexieError(error);
  }
}

/**
 * RULE-017 & RULE-018: Kontribusi earmark target secara atomik (tanpa transaksi expense).
 */
export async function recordGoalContribution(
  input: GoalContributionInput,
  database: FinoraDatabase = db
): Promise<
  ServiceResult<{ goal: FinancialGoalRecord; contribution: GoalContributionRecord }>
> {
  const parsed = GoalContributionInputSchema.safeParse(input);
  if (!parsed.success) {
    return mapZodError(parsed.error);
  }

  const data = parsed.data;
  try {
    const result = await database.transaction(
      'rw',
      database.financialGoals,
      database.goalContributions,
      async () => {
        const goal = await database.financialGoals.get(data.goalId);
        if (!goal) {
          throw new ServiceDomainError({
            code: 'NOT_FOUND',
            message: 'Target keuangan tidak ditemukan.',
          });
        }

        const nextAmount = goal.currentAmount + data.amount;
        if (nextAmount < 0) {
          throw new ServiceDomainError({
            code: 'BUSINESS_RULE_VIOLATION',
            message: `Nominal penarikan melebihi dana target yang terkumpul saat ini (${goal.currentAmount}).`,
            fieldErrors: {
              amount: ['Nominal penarikan tidak boleh melebihi saldo target saat ini.'],
            },
          });
        }
        if (nextAmount > MAX_IDR_AMOUNT) {
          throw new ServiceDomainError({
            code: 'VALIDATION_ERROR',
            message: 'Total alokasi target melebihi batas maksimum IDR aman.',
            fieldErrors: { amount: ['Nominal terlalu besar.'] },
          });
        }

        const nowIso = new Date().toISOString();
        const contribution: GoalContributionRecord = {
          id: generateUuid(),
          goalId: data.goalId,
          amount: data.amount,
          date: data.date,
          note: data.note,
          createdAt: nowIso,
        };

        let nextStatus: GoalStatus = goal.status;
        if (nextAmount >= goal.targetAmount) {
          nextStatus = 'completed';
        } else if (goal.status === 'completed' && nextAmount < goal.targetAmount) {
          nextStatus = 'active';
        }

        const updatedGoal: FinancialGoalRecord = {
          ...goal,
          currentAmount: nextAmount,
          status: nextStatus,
          updatedAt: nowIso,
        };

        await database.goalContributions.add(contribution);
        await database.financialGoals.put(updatedGoal);

        return { goal: updatedGoal, contribution };
      }
    );

    return ok(result);
  } catch (error) {
    return mapDexieError(error);
  }
}

export async function listGoalContributions(
  goalId: string,
  database: FinoraDatabase = db
): Promise<ServiceResult<GoalContributionRecord[]>> {
  try {
    const items = await database.goalContributions
      .where('goalId')
      .equals(goalId)
      .toArray();
    items.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    return ok(items);
  } catch (error) {
    return mapDexieError(error);
  }
}

export async function deleteGoal(
  id: string,
  database: FinoraDatabase = db
): Promise<ServiceResult<{ deletedId: string }>> {
  try {
    await database.transaction(
      'rw',
      database.financialGoals,
      database.goalContributions,
      async () => {
        const existing = await database.financialGoals.get(id);
        if (!existing) {
          throw new ServiceDomainError({
            code: 'NOT_FOUND',
            message: 'Target keuangan tidak ditemukan.',
          });
        }
        await database.goalContributions.where('goalId').equals(id).delete();
        await database.financialGoals.delete(id);
      }
    );
    return ok({ deletedId: id });
  } catch (error) {
    return mapDexieError(error);
  }
}
