'use client';

import * as React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileJson,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProviders';
import { TypedConfirmDialog } from '@/components/shared/TypedConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { db } from '@/db/database';
import { triggerBlobDownload } from '@/lib/download';
import {
  applyRestore,
  exportBackupJson,
  inspectBackupFile,
  type BackupPreview,
} from '@/services/backupService';

export default function BackupRestorePage() {
  const { bootstrapReady, settings, showToast } = useAppContext();

  const [exporting, setExporting] = React.useState(false);
  const [inspecting, setInspecting] = React.useState(false);
  const [inspectError, setInspectError] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<BackupPreview | null>(null);

  const [restoreMode, setRestoreMode] = React.useState<'merge' | 'replace'>('merge');
  const [conflictStrategy, setConflictStrategy] = React.useState<
    'skip_existing' | 'overwrite_existing'
  >('skip_existing');
  const [replaceDialogOpen, setReplaceDialogOpen] = React.useState(false);
  const [restoring, setRestoring] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const localCounts = useLiveQuery(async () => {
    const [tx, cat, bdg, goal, rec] = await Promise.all([
      db.transactions.count(),
      db.categories.count(),
      db.budgets.count(),
      db.financialGoals.count(),
      db.recurringTransactions.count(),
    ]);
    return { tx, cat, bdg, goal, rec };
  }, []);

  const handleExport = async () => {
    setExporting(true);
    const res = await exportBackupJson();
    setExporting(false);

    if (!res.ok) {
      showToast(res.error.message, 'error');
      return;
    }

    triggerBlobDownload(res.data.blob, res.data.filename);
    showToast('Cadangan JSON berhasil diunduh.');
  };

  const handleFileSelected = async (file: File | undefined) => {
    if (!file) return;
    setInspecting(true);
    setInspectError(null);
    setPreview(null);

    const res = await inspectBackupFile(file);
    setInspecting(false);

    if (!res.ok) {
      setInspectError(res.error.message);
      return;
    }

    setPreview(res.data);
  };

  const executeMerge = async () => {
    if (!preview) return;
    setRestoring(true);
    const res = await applyRestore(preview.envelope, {
      mode: 'merge',
      conflictStrategy,
      overwriteSettings: false,
    });
    setRestoring(false);

    if (!res.ok) {
      showToast(res.error.message, 'error');
      return;
    }
    setPreview(null);
    showToast(
      `Pemulihan Merge selesai (${res.data.insertedOrUpdatedCounts.transactions} transaksi diproses, ${res.data.skippedCount} dilewati).`
    );
  };

  const executeReplace = async () => {
    if (!preview) return;
    setRestoring(true);
    const res = await applyRestore(preview.envelope, {
      mode: 'replace',
      confirmationText: 'TIMPA',
    });
    setRestoring(false);
    setReplaceDialogOpen(false);

    if (!res.ok) {
      showToast(res.error.message, 'error');
      return;
    }
    setPreview(null);
    showToast('Seluruh data berhasil dipulihkan dari Backup JSON.');
  };

  if (!bootstrapReady) {
    return <Card className="max-w-3xl mx-auto h-64 animate-pulse" />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Export Backup Card */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Ekspor Cadangan Data (Backup JSON)</CardTitle>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Mengemas seluruh 7 tabel FinoraDB lengkap dengan verifikasi integritas SHA-256.
            </p>
          </div>
          <Badge tone="accent">Format v1</Badge>
        </CardHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
            <div className="rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3">
              <p className="text-xs text-[var(--text-secondary)]">Transaksi</p>
              <p className="text-base font-bold tabular-nums mt-0.5">{localCounts?.tx ?? 0}</p>
            </div>
            <div className="rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3">
              <p className="text-xs text-[var(--text-secondary)]">Kategori</p>
              <p className="text-base font-bold tabular-nums mt-0.5">{localCounts?.cat ?? 0}</p>
            </div>
            <div className="rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3">
              <p className="text-xs text-[var(--text-secondary)]">Anggaran</p>
              <p className="text-base font-bold tabular-nums mt-0.5">{localCounts?.bdg ?? 0}</p>
            </div>
            <div className="rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3">
              <p className="text-xs text-[var(--text-secondary)]">Target</p>
              <p className="text-base font-bold tabular-nums mt-0.5">{localCounts?.goal ?? 0}</p>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3">
              <p className="text-xs text-[var(--text-secondary)]">Berulang</p>
              <p className="text-base font-bold tabular-nums mt-0.5">{localCounts?.rec ?? 0}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-[var(--text-secondary)]">
              Backup terakhir:{' '}
              <strong className="text-[var(--text-primary)]">
                {settings?.lastBackupAt
                  ? new Date(settings.lastBackupAt).toLocaleString('id-ID')
                  : 'Belum pernah'}
              </strong>
            </p>
            <Button disabled={exporting} onClick={() => void handleExport()}>
              <Download className="w-4 h-4" />
              {exporting ? 'Menyiapkan...' : 'Unduh Backup JSON'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Import / Restore Card */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Pulihkan Data (Restore JSON)</CardTitle>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Unggah berkas .json (maks 25 MB) untuk melihat pratinjau sebelum memulihkan.
            </p>
          </div>
        </CardHeader>

        <div className="space-y-5">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              void handleFileSelected(e.dataTransfer.files[0]);
            }}
            className="rounded-2xl border-2 border-dashed border-[var(--border-control)] bg-[var(--bg-canvas)] p-6 text-center space-y-3"
          >
            <FileJson className="w-10 h-10 text-[var(--accent-primary)] mx-auto" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Pilih atau seret berkas backup Finora (.json) ke sini
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Keutuhan data diverifikasi dengan SHA-256 dan validasi skema ketat sebelum diterapkan.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                void handleFileSelected(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <Button
              variant="secondary"
              disabled={inspecting}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              {inspecting ? 'Memvalidasi Berkas...' : 'Pilih Berkas JSON'}
            </Button>
          </div>

          {inspectError ? (
            <div
              role="alert"
              className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 flex items-start gap-3 text-sm text-[var(--status-danger-text)]"
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-semibold">Berkas Backup Ditolak</p>
                <p className="text-xs mt-1">{inspectError}</p>
              </div>
            </div>
          ) : null}

          {preview ? (
            <div className="rounded-2xl bg-[var(--bg-canvas)] border border-emerald-500/40 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[var(--status-success)] font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Pratinjau Backup Valid & Checksum SHA-256 Terverifikasi</span>
                </div>
                <Badge tone="accent">Skema v{preview.dbSchemaVersion}</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <span className="text-[var(--text-secondary)]">Transaksi</span>
                  <p className="text-sm font-bold tabular-nums mt-0.5">
                    {preview.counts.transactions}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <span className="text-[var(--text-secondary)]">Kategori</span>
                  <p className="text-sm font-bold tabular-nums mt-0.5">
                    {preview.counts.categories}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <span className="text-[var(--text-secondary)]">Anggaran</span>
                  <p className="text-sm font-bold tabular-nums mt-0.5">
                    {preview.counts.budgets}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <span className="text-[var(--text-secondary)]">Target / Berulang</span>
                  <p className="text-sm font-bold tabular-nums mt-0.5">
                    {preview.counts.financialGoals} / {preview.counts.recurringTransactions}
                  </p>
                </div>
              </div>

              <div className="text-xs text-[var(--text-secondary)] space-y-1">
                <p>
                  Diekspor pada:{' '}
                  <strong className="text-[var(--text-primary)]">
                    {new Date(preview.exportedAt).toLocaleString('id-ID')}
                  </strong>
                </p>
                {preview.transactionDateRange.minDate ? (
                  <p>
                    Rentang transaksi:{' '}
                    <strong className="text-[var(--text-primary)]">
                      {preview.transactionDateRange.minDate} s.d.{' '}
                      {preview.transactionDateRange.maxDate}
                    </strong>
                  </p>
                ) : null}
                <p>
                  Deteksi konflik (untuk Merge): {preview.conflicts.duplicateIdsCount} ID sama,{' '}
                  {preview.conflicts.budgetBusinessKeyConflicts} bentrok anggaran kategori+bulan.
                </p>
              </div>

              {/* Mode Selector */}
              <div className="pt-3 border-t border-[var(--border-subtle)] space-y-3">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Pilih Metode Pemulihan:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] cursor-pointer">
                    <input
                      type="radio"
                      name="restore-mode"
                      checked={restoreMode === 'merge'}
                      onChange={() => setRestoreMode('merge')}
                      className="mt-1"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-[var(--text-primary)]">
                        Merge (Gabungkan Data)
                      </p>
                      <p className="text-[var(--text-secondary)] mt-0.5">
                        Mempertahankan data lokal dan menambahkan data baru dari backup.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] cursor-pointer">
                    <input
                      type="radio"
                      name="restore-mode"
                      checked={restoreMode === 'replace'}
                      onChange={() => setRestoreMode('replace')}
                      className="mt-1"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-[var(--status-danger-text)]">
                        Replace All (Timpa Semua)
                      </p>
                      <p className="text-[var(--text-secondary)] mt-0.5">
                        Menghapus seluruh data saat ini dan menggantinya dengan isi backup.
                      </p>
                    </div>
                  </label>
                </div>

                {restoreMode === 'merge' ? (
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
                    <span>Jika terjadi konflik ID/Anggaran:</span>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="merge-conflict"
                        checked={conflictStrategy === 'skip_existing'}
                        onChange={() => setConflictStrategy('skip_existing')}
                      />
                      Lewati (pertahankan data lokal)
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="merge-conflict"
                        checked={conflictStrategy === 'overwrite_existing'}
                        onChange={() => setConflictStrategy('overwrite_existing')}
                      />
                      Perbarui dengan data backup
                    </label>
                  </div>
                ) : null}

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setPreview(null)}>
                    Batalkan
                  </Button>
                  {restoreMode === 'merge' ? (
                    <Button disabled={restoring} onClick={() => void executeMerge()}>
                      {restoring ? 'Memulihkan...' : 'Terapkan Restore (Merge)'}
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      disabled={restoring}
                      onClick={() => setReplaceDialogOpen(true)}
                    >
                      Terapkan Restore (Replace All)
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Card>

      {/* Privacy Notice */}
      <Card className="p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[var(--accent-primary)] shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)]">Catatan Keamanan Berkas:</strong>{' '}
          Checksum SHA-256 memverifikasi keutuhan berkas dari kerusakan, bukan mengenkripsi isi file. Simpan berkas backup `.json` di folder pribadi yang aman.
        </p>
      </Card>

      <TypedConfirmDialog
        open={replaceDialogOpen}
        onOpenChange={setReplaceDialogOpen}
        title="Timpa Seluruh Data Saat Ini?"
        description="Seluruh transaksi, anggaran, target, dan kategori lokal yang ada saat ini akan dihapus dan diganti penuh oleh isi file backup."
        requiredKeyword="TIMPA"
        confirmLabel="Timpa Sekarang"
        loading={restoring}
        onConfirm={executeReplace}
      />
    </div>
  );
}
