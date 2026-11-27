'use client';

import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSwUpdate } from '@/hooks/useSwUpdate';

export function SwUpdateBanner() {
  const { updateAvailable, applyUpdate, dismissUpdate } = useSwUpdate();
  if (!updateAvailable) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="no-print bg-emerald-500/15 border-b border-emerald-500/30 px-4 py-2 text-xs sm:text-sm text-[var(--text-primary)] flex flex-wrap items-center justify-center gap-3"
    >
      <span>Pembaruan aplikasi Finora tersedia.</span>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={applyUpdate}>
          <RefreshCw className="w-3.5 h-3.5" />
          Muat Ulang
        </Button>
        <Button size="sm" variant="ghost" onClick={dismissUpdate} aria-label="Tunda pembaruan">
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
