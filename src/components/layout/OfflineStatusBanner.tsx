'use client';

import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineStatusBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="no-print bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs sm:text-sm text-[var(--status-warning)] flex items-center justify-center gap-2"
    >
      <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>Mode Offline — Data Anda tetap tersimpan aman di perangkat.</span>
    </div>
  );
}
