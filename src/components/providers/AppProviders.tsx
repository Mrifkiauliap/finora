'use client';

import * as React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { db } from '@/db/database';
import type { AppSettingsRecord, ThemePreference } from '@/db/types';
import { initializeApp } from '@/services/bootstrapService';
import { updateSettings } from '@/services/settingsService';
import { ErrorFallback } from '@/components/shared/ErrorFallback';

export type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  tone: ToastTone;
  message: string;
}

interface AppContextValue {
  settings: AppSettingsRecord | undefined;
  resolvedTheme: 'dark' | 'light';
  isMasked: boolean;
  togglePrivacyMask: () => Promise<void>;
  setThemePreference: (theme: ThemePreference) => Promise<void>;
  showToast: (message: string, tone?: ToastTone) => void;
  bootstrapReady: boolean;
  recurringGeneratedCount: number;
  cappedRuleIds: string[];
}

const AppContext = React.createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = React.useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext harus dipanggil di dalam AppProviders.');
  }
  return ctx;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [bootstrapReady, setBootstrapReady] = React.useState(false);
  const [bootstrapError, setBootstrapError] = React.useState<string | null>(null);
  const [recurringGeneratedCount, setRecurringGeneratedCount] = React.useState(0);
  const [cappedRuleIds, setCappedRuleIds] = React.useState<string[]>([]);
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const [systemPrefersDark, setSystemPrefersDark] = React.useState(true);

  const settings = useLiveQuery(() => db.appSettings.get('default'), [], undefined);

  const runBootstrap = React.useCallback(async () => {
    setBootstrapError(null);
    const res = await initializeApp();
    if (!res.ok) {
      setBootstrapError(res.error.message);
      setBootstrapReady(false);
      return;
    }
    setRecurringGeneratedCount(res.data.recurringGeneratedCount);
    setCappedRuleIds(res.data.cappedRuleIds);
    setBootstrapReady(true);
  }, []);

  React.useEffect(() => {
    void runBootstrap();
  }, [runBootstrap]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefersDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const themePref: ThemePreference = settings?.theme ?? 'dark';
  const resolvedTheme: 'dark' | 'light' =
    themePref === 'system' ? (systemPrefersDark ? 'dark' : 'light') : themePref;

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  const showToast = React.useCallback((message: string, tone: ToastTone = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev.slice(-3), { id, tone, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const togglePrivacyMask = React.useCallback(async () => {
    const next = !(settings?.showBalancesMasked ?? false);
    const res = await updateSettings({ showBalancesMasked: next });
    if (res.ok) {
      showToast(
        next ? 'Nominal disamarkan untuk privasi.' : 'Nominal ditampilkan kembali.',
        'info'
      );
    }
  }, [settings?.showBalancesMasked, showToast]);

  const setThemePreference = React.useCallback(
    async (theme: ThemePreference) => {
      await updateSettings({ theme });
    },
    []
  );

  const value: AppContextValue = {
    settings,
    resolvedTheme,
    isMasked: settings?.showBalancesMasked ?? false,
    togglePrivacyMask,
    setThemePreference,
    showToast,
    bootstrapReady,
    recurringGeneratedCount,
    cappedRuleIds,
  };

  if (bootstrapError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-canvas)]">
        <ErrorFallback
          title="Penyimpanan Lokal Tidak Tersedia"
          description={bootstrapError}
          onRetry={() => void runBootstrap()}
        />
      </div>
    );
  }

  return (
    <AppContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="no-print fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] sm:w-auto pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-center gap-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-4 py-3 text-sm text-[var(--text-primary)] shadow-[var(--overlay-shadow)]"
          >
            {toast.tone === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--status-success)]" />
            ) : toast.tone === 'error' ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-[var(--status-danger-text)]" />
            ) : (
              <Info className="w-4 h-4 shrink-0 text-[var(--accent-primary)]" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              aria-label="Tutup notifikasi"
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}
