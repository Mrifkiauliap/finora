export type TransactionType = 'income' | 'expense';

export type PaymentMethod =
  | 'cash'
  | 'bank_transfer'
  | 'e_wallet'
  | 'debit_card'
  | 'credit_card'
  | 'other';

export type GoalStatus = 'active' | 'completed' | 'paused';

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type ThemePreference = 'dark' | 'light' | 'system';

export type BudgetStatus = 'safe' | 'warning' | 'exceeded';

export interface TransactionRecord {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: string;
  note: string;
  paymentMethod: PaymentMethod;
  recurringRuleId: string | null;
  recurringOccurrenceDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isSystem: boolean;
  isArchived: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetRecord {
  id: string;
  categoryId: string;
  month: string;
  limitAmount: number;
  warningThresholdPct: number;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialGoalRecord {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  status: GoalStatus;
  icon: string;
  color: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalContributionRecord {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  note: string;
  createdAt: string;
}

export interface RecurringTransactionRecord {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  note: string;
  paymentMethod: PaymentMethod;
  frequency: RecurringFrequency;
  interval: number;
  anchorDay: number | null;
  startDate: string;
  endDate: string | null;
  nextRunDate: string;
  lastGeneratedDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettingsRecord {
  id: 'default';
  theme: ThemePreference;
  currency: 'IDR';
  locale: 'id-ID';
  firstDayOfWeek: 0 | 1;
  defaultWarningThresholdPct: number;
  showBalancesMasked: boolean;
  lastBackupAt: string | null;
  onboardingCompleted: boolean;
  schemaMetaVersion: number;
  updatedAt: string;
}

export interface BackupPayloadV1 {
  transactions: TransactionRecord[];
  categories: CategoryRecord[];
  budgets: BudgetRecord[];
  financialGoals: FinancialGoalRecord[];
  goalContributions: GoalContributionRecord[];
  recurringTransactions: RecurringTransactionRecord[];
  appSettings: AppSettingsRecord[];
}

export interface BackupEnvelopeV1 {
  appName: 'Finora';
  backupFormatVersion: 1;
  dbSchemaVersion: number;
  exportedAt: string;
  checksum: {
    algorithm: 'SHA-256';
    value: string;
  };
  payload: BackupPayloadV1;
}

export interface TransactionView extends TransactionRecord {
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  categoryArchived: boolean;
}

export interface BudgetEvaluationView extends BudgetRecord {
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  spentAmount: number;
  remainingAmount: number;
  utilizationPct: number;
  status: BudgetStatus;
}

export interface GoalView extends FinancialGoalRecord {
  progressPct: number;
  remainingTarget: number;
  requiredMonthlySaving: number | null;
  remainingMonths: number | null;
  isOverdue: boolean;
}

export interface RecurringRuleView extends RecurringTransactionRecord {
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  upcomingDates: string[];
}
