import * as React from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'accent';

const toneClasses: Record<BadgeTone, string> = {
  neutral:
    'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
  accent:
    'bg-emerald-500/15 text-[var(--accent-primary)] border-emerald-500/30',
  success:
    'bg-green-500/15 text-[var(--status-success)] border-green-500/30',
  warning:
    'bg-amber-500/15 text-[var(--status-warning)] border-amber-500/30',
  danger:
    'bg-red-500/15 text-[var(--status-danger-text)] border-red-500/30',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
