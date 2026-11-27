'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  DatabaseBackup,
  HardDrive,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProviders';
import { TypedConfirmDialog } from '@/components/shared/TypedConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, NativeSelect } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import type { ThemePreference } from '@/db/types';
import {
  getStorageHealth,
  requestPersistentStorage,
  type StorageHealthInfo,
} from '@/services/bootstrapService';
import { factoryResetDatabase, updateSettings } from '@/services/settingsService';

export default function SettingsPage() {
  const { settings, bootstrapReady, setThemePreference, showToast } = useAppContext();

  const [storageInfo, setStorageInfo] = React.useState<StorageHealthInfo | null>(null);
  const [resetOpen, setResetOpen] = React.useState(false);
  const [reseedDefault, setReseedDefault] = React.useState(true);
  const [resetting, setResetting] = React.useState(false);
  const [thresholdDraft, setThresholdDraft] = React.useState<number>(80);

  React.useEffect(() => {
    if (settings) {
      setThresholdDraft(settings.defaultWarningThresholdPct);
    }
  }, [settings]);

  React.useEffect(() => {
    void getStorageHealth().then(setStorageInfo);
  }, []);

  const handleRequestPersist = async () => {
    const res = await requestPersistentStorage();
    const updated = await getStorageHealth();
    setStorageInfo(updated);
    if (!res.supported) {
      showToast('Browser ini tidak mendukung Persistent Storage API.', 'info');
    } else if (res.granted) {
      showToast('Penyimpanan persisten disetujui oleh browser.');
    } else {
      showToast('Permintaan penyimpanan persisten ditolak oleh browser.', 'info');
    }
  };

  const handleThresholdSave = async () => {
    const res = await updateSettings({ defaultWarningThresholdPct: thresholdDraft });
    if (!res.ok) {
      showToast(res.error.message, 'error');
      return;
    }
    showToast('Ambang peringatan default diperbarui.');
  };

  const handleConfirmFactoryReset = async () => {
    setResetting(true);
    const res = await factoryResetDatabase('HAPUS', {
      reseedDefaultCategories: reseedDefault,
    });
    setResetting(false);
    setResetOpen(false);
    if (!res.ok) {
      showToast(res.error.message, 'error');
      return;
    }
    showToast('Seluruh data lokal berhasil dihapus.');
  };

  if (!bootstrapReady || !settings) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <Card className="h-40" />
        <Card className="h-40" />
      </div>
    );
  }

  const formatMb = (bytes: number | null) =>
    bytes === null ? 'Tidak tersedia' : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Appearance & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Tampilan & Privasi Layar</CardTitle>
        </CardHeader>
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label htmlFor="set-theme" className="text-sm font-medium text-[var(--text-primary)]">
                Tema Antarmuka
              </label>
              <p className="text-xs text-[var(--text-secondary)]">
                Default Gelap (Navy-Slate) atau Terang terkalibrasi WCAG 2.1.
              </p>
            </div>
            <NativeSelect
              id="set-theme"
              value={settings.theme}
              onChange={(e) => void setThemePreference(e.target.value as ThemePreference)}
              className="sm:w-48"
            >
              <option value="dark">Gelap (Default)</option>
              <option value="light">Terang</option>
              <option value="system">Ikuti Sistem</option>
            </NativeSelect>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Sembunyikan Nominal Saldo (Privacy Mask)
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Menyamarkan angka keuangan saat membuka Finora di tempat umum.
              </p>
            </div>
            <Switch
              aria-label="Sembunyikan nominal saldo secara default"
              checked={settings.showBalancesMasked}
              onCheckedChange={(checked) => void updateSettings({ showBalancesMasked: checked })}
            />
          </div>
        </div>
      </Card>

      {/* Financial Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferensi Keuangan (IDR)</CardTitle>
        </CardHeader>
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label htmlFor="set-week" className="text-sm font-medium text-[var(--text-primary)]">
                Hari Awal Minggu
              </label>
              <p className="text-xs text-[var(--text-secondary)]">
                Digunakan untuk pengelompokan periode mingguan.
              </p>
            </div>
            <NativeSelect
              id="set-week"
              value={String(settings.firstDayOfWeek)}
              onChange={(e) =>
                void updateSettings({
                  firstDayOfWeek: e.target.value === '0' ? 0 : 1,
                })
              }
              className="sm:w-48"
            >
              <option value="1">Senin</option>
              <option value="0">Minggu</option>
            </NativeSelect>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label htmlFor="set-thresh" className="text-sm font-medium text-[var(--text-primary)]">
                Ambang Peringatan Anggaran Default (%)
              </label>
              <p className="text-xs text-[var(--text-secondary)]">
                Rentang 50% – 95% (default 80%).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="set-thresh"
                type="number"
                min={50}
                max={95}
                value={thresholdDraft}
                onChange={(e) => setThresholdDraft(Number(e.target.value))}
                className="w-24"
              />
              <Button size="sm" variant="secondary" onClick={() => void handleThresholdSave()}>
                Simpan
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Storage Health & Backup Shortcut */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-[var(--accent-primary)]" aria-hidden="true" />
            <CardTitle>Penyimpanan Lokal & Backup</CardTitle>
          </div>
          <Badge tone={storageInfo?.persisted ? 'success' : 'neutral'}>
            {storageInfo?.persisted ? 'Persisten' : 'Standar Browser'}
          </Badge>
        </CardHeader>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-4">
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Estimasi Terpakai</p>
              <p className="font-semibold tabular-nums mt-0.5">
                {formatMb(storageInfo?.usageBytes ?? null)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Kuota Browser</p>
              <p className="font-semibold tabular-nums mt-0.5">
                {formatMb(storageInfo?.quotaBytes ?? null)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={() => void handleRequestPersist()}>
              <ShieldCheck className="w-4 h-4" />
              Minta Penyimpanan Persisten
            </Button>
            <Link
              href="/app/settings/backup"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-[var(--accent-primary)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] font-semibold text-sm"
            >
              <DatabaseBackup className="w-4 h-4" />
              Buka Backup & Restore
            </Link>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/40">
        <CardHeader>
          <div className="flex items-center gap-2 text-[var(--status-danger-text)]">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            <CardTitle className="text-[var(--status-danger-text)]">Zona Bahaya</CardTitle>
          </div>
        </CardHeader>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Menghapus seluruh transaksi, anggaran, target, jadwal berulang, dan kategori kustom dari browser ini secara permanen. Buatlah Backup JSON terlebih dahulu bila Anda masih membutuhkan data tersebut.
        </p>
        <label className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)] mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={reseedDefault}
            onChange={(e) => setReseedDefault(e.target.checked)}
          />
          <span>Siapkan ulang 13 kategori sistem default kosong setelah reset</span>
        </label>
        <Button variant="destructive" onClick={() => setResetOpen(true)}>
          <Trash2 className="w-4 h-4" />
          Hapus Semua Data Lokal
        </Button>
      </Card>

      <TypedConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Hapus Seluruh Data Lokal?"
        description="Tindakan ini mengosongkan seluruh catatan keuangan Anda di FinoraDB dan tidak dapat dibatalkan."
        requiredKeyword="HAPUS"
        confirmLabel="Hapus Permanen"
        loading={resetting}
        onConfirm={handleConfirmFactoryReset}
      />
    </div>
  );
}
