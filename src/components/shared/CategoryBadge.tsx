import { CategoryIcon } from './CategoryIcon';
import { cn } from '@/lib/cn';

export function CategoryBadge({
  name,
  icon,
  color,
  isArchived = false,
  size = 'md',
}: {
  name: string;
  icon: string;
  color: string;
  isArchived?: boolean;
  size?: 'sm' | 'md';
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', isArchived && 'opacity-75')}>
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full shrink-0 border',
          size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
        )}
        style={{
          backgroundColor: `${color}20`,
          borderColor: `${color}40`,
          color,
        }}
      >
        <CategoryIcon name={icon} className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      </span>
      <span className="truncate font-medium text-[var(--text-primary)] text-sm">
        {name}
      </span>
      {isArchived ? (
        <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
          Arsip
        </span>
      ) : null}
    </span>
  );
}
