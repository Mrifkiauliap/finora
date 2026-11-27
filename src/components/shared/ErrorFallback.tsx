'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function ErrorFallback({
  title = 'Terjadi Kendala',
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="max-w-lg w-full text-center p-6 sm:p-8">
      <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-[var(--status-danger-text)] flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-6 h-6" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p>
      {onRetry ? (
        <div className="mt-6">
          <Button variant="secondary" onClick={onRetry}>
            <RotateCcw className="w-4 h-4" />
            Coba Lagi
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
