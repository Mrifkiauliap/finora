'use client';

import { AlertTriangle } from 'lucide-react';
import { MoneyText } from '@/components/shared/MoneyText';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { BudgetEvaluationView } from '@/db/types';
import { cn } from '@/lib/cn';
import { CategoryBadge } from '@/components/shared/CategoryBadge';

export function BudgetProgressCard({
  budget,
  masked = false,
  onEdit,
  onDelete,
  onInspectTransactions,
}: {
  budget: BudgetEvaluationView;
  masked?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onInspectTransactions?: () => void;
}) {
  const clampedPct = Math.min(100, Math.max(0, budget.utilizationPct));
  const barColor =
    budget.status === 'exceeded'
      ? 'bg-[var(--status-danger)]'
      : budget.status === 'warning'
        ? 'bg-[var(--status-warning)]'
        : 'bg-[var(--status-success)]';

  const statusTone =
    budget.status === 'exceeded'
      ? 'danger'
      : budget.status === 'warning'
        ? 'warning'
        : 'success';

  const statusLabel =
    budget.status === 'exceeded'
      ? 'Melebihi Batas'
      : budget.status === 'warning'
        ? 'Mendekati Batas'
        : 'Aman';

  return (
    <Card className="flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-start justify-between gap-3">
          <CategoryBadge
            name={budget.categoryName}
            icon={budget.categoryIcon}
            color={budget.categoryColor}
          />
          <Badge tone={statusTone}>
            {budget.status !== 'safe' ? (
              <AlertTriangle className="w-3 h-3" aria-hidden="true" />
            ) : null}
            {statusLabel}
          </Badge>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-baseline justify-between text-xs sm:text-sm">
            <span className="text-[var(--text-secondary)]">
              Terpakai:{' '}
              <MoneyText
                amount={budget.spentAmount}
                masked={masked}
                className="font-semibold text-[var(--text-primary)]"
              />
            </span>
            <span className="tabular-nums font-semibold text-[var(--text-primary)]">
              {budget.utilizationPct.toLocaleString('id-ID')}%
            </span>
          </div>

          <div
            role="progressbar"
            aria-label={`Progres anggaran ${budget.categoryName}`}
            aria-valuenow={Math.round(clampedPct)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="w-full h-2.5 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] overflow-hidden"
          >
            <div
              className={cn('h-full rounded-full transition-all duration-200', barColor)}
              style={{ width: `${clampedPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>
              Batas: <MoneyText amount={budget.limitAmount} masked={masked} size="sm" />
            </span>
            <span>
              {budget.remainingAmount >= 0 ? 'Sisa: ' : 'Over-budget: '}
              <MoneyText
                amount={Math.abs(budget.remainingAmount)}
                variant={budget.remainingAmount < 0 ? 'expense' : 'neutral'}
                masked={masked}
                size="sm"
                className="font-semibold"
              />
            </span>
          </div>
        </div>
      </div>

      {(onInspectTransactions || onEdit || onDelete) ? (
        <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2">
          {onInspectTransactions ? (
            <Button size="sm" variant="ghost" onClick={onInspectTransactions}>
              Lihat Transaksi
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            {onEdit ? (
              <Button size="sm" variant="secondary" onClick={onEdit}>
                Ubah
              </Button>
            ) : null}
            {onDelete ? (
              <Button size="sm" variant="ghost" onClick={onDelete}>
                Hapus
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
