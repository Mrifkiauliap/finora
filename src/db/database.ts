import Dexie, { type Table } from 'dexie';
import type {
  AppSettingsRecord,
  BudgetRecord,
  CategoryRecord,
  FinancialGoalRecord,
  GoalContributionRecord,
  RecurringTransactionRecord,
  TransactionRecord,
} from './types';

export const CURRENT_DB_SCHEMA_VERSION = 1;

export class FinoraDatabase extends Dexie {
  transactions!: Table<TransactionRecord, string>;
  categories!: Table<CategoryRecord, string>;
  budgets!: Table<BudgetRecord, string>;
  financialGoals!: Table<FinancialGoalRecord, string>;
  goalContributions!: Table<GoalContributionRecord, string>;
  recurringTransactions!: Table<RecurringTransactionRecord, string>;
  appSettings!: Table<AppSettingsRecord, string>;

  constructor(name = 'FinoraDB') {
    super(name);

    this.version(1).stores({
      transactions:
        'id, type, categoryId, date, [type+date], [categoryId+date], recurringRuleId, [recurringRuleId+recurringOccurrenceDate], createdAt',
      categories:
        'id, type, name, isSystem, isArchived, sortOrder, [type+isArchived]',
      budgets:
        'id, categoryId, month, &[categoryId+month]',
      financialGoals:
        'id, status, deadline, createdAt',
      goalContributions:
        'id, goalId, date, [goalId+date], createdAt',
      recurringTransactions:
        'id, type, categoryId, isActive, nextRunDate, [isActive+nextRunDate]',
      appSettings:
        'id',
    });
  }
}

export const db = new FinoraDatabase();
