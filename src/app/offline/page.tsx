'use client';

import Link from 'next/link';
import { RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] px-4 flex items-center justify-center">
      <Card className="max-w-md w-full text-center p-6 sm:p-8 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-[var(--status-warning)] flex items-center justify-center mx-auto">
          <WifiOff className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Anda Sedang Offline</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Halaman yang Anda tuju belum tersimpan di cache offline, namun seluruh catatan keuangan lokal Anda di perangkat tetap aman dan utuh.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2.5">
          <Button variant="secondary" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4" />
            Coba Muat Ulang
          </Button>
          <Link
            href="/app"
            className="inline-flex items-center justify-center h-10 px-4 rounded-[10px] bg-[var(--accent-primary)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] font-semibold text-sm"
          >
            Buka Dashboard (/app)
          </Link>
        </div>
      </Card>
    </div>
  );
}
