'use client';

import { formatIdr } from '@/domain/money';
import { cn } from '@/lib/cn';

export interface MoneyTextProps {
  amount: number;
  variant?: 'neutral' | 'income' | 'expense' | 'balance';
  showSign?: boolean;
  masked?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg font-semibold',
  hero: 'text-3xl sm:text-4xl font-bold tracking-tight',
};

export function MoneyText({
  amount,
  variant = 'neutral',
  showSign = false,
  masked = false,
  size = 'md',
  className,
}: MoneyTextProps) {
  if (masked) {
    return (
      <span
        aria-label="Nominal disembunyikan"
        className={cn(
          'tabular-nums select-none text-[var(--text-primary)]',
          sizeClasses[size],
          className
        )}
      >
        Rp •••••••
      </span>
    );
  }

  let colorClass = 'text-[var(--text-primary)]';
  let display = formatIdr(amount);

  if (variant === 'income') {
    colorClass = 'text-[var(--status-success)]';
    display = showSign ? `+${formatIdr(Math.abs(amount))}` : formatIdr(amount);
  } else if (variant === 'expense') {
    colorClass = 'text-[var(--status-danger-text)]';
    display = showSign ? `-${formatIdr(Math.abs(amount))}` : formatIdr(amount);
  } else if (variant === 'balance' && amount < 0) {
    colorClass = 'text-[var(--status-danger-text)]';
  }

  return (
    <span className={cn('tabular-nums', sizeClasses[size], colorClass, className)}>
      {display}
    </span>
  );
}
