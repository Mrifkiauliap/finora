'use client';

import * as React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Sparkles } from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProviders';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { db } from '@/db/database';
import { hasDemoData } from '@/services/demoDataService';
import { factoryResetDatabase } from '@/services/settingsService';

export function DemoModeBanner() {
  const { showToast } = useAppContext();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [clearing, setClearing] = React.useState(false);

  const demoActive = useLiveQuery(() => hasDemoData(db), [], false);

  if (!demoActive) return null;

  const handleConfirmClear = async () => {
    setClearing(true);
    const res = await factoryResetDatabase('HAPUS', {
      reseedDefaultCategories: true,
    });
    setClearing(false);
    setConfirmOpen(false);
    if (!res.ok) {
      showToast(res.error.message, 'error');
      return;
    }
    showToast('Data contoh berhasil dihapus. Finora siap untuk catatan keuangan asli Anda!');
  };

  return (
    <>
      <div
        role="status"
        className="no-print bg-[var(--brand-subtle)] border-b border-[var(--brand-soft)] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs sm:text-sm"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Sparkles className="w-4 h-4 text-[var(--accent-primary)] shrink-0" aria-hidden="true" />
          <p className="text-[var(--text-primary)]">
            <strong className="font-semibold text-[var(--accent-primary)]">
              Mode Data Contoh (Demo)
            </strong>{' '}
            <span className="text-[var(--text-secondary)]">
              — Data ini hanya contoh untuk mencoba Finora. Hapus semua untuk mulai mencatat keuangan asli Anda.
            </span>
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setConfirmOpen(true)}
          className="bg-[var(--bg-surface)] shrink-0"
        >
          Hapus Data Contoh &amp; Mulai Kosong
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Hapus Data Contoh & Mulai Kosong?"
        description="Seluruh transaksi, anggaran, target, dan jadwal contoh akan dihapus. 13 kategori default tetap siap dipakai untuk catatan keuangan asli Anda."
        confirmLabel="Ya, Hapus & Mulai Kosong"
        loading={clearing}
        onConfirm={handleConfirmClear}
      />
    </>
  );
}
