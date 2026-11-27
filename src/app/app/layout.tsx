import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { AppProviders } from '@/components/providers/AppProviders';

export const metadata: Metadata = {
  title: {
    default: 'Dashboard Keuangan',
    template: '%s | Finora App',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function FinanceAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppProviders>
      <AppShell>{children}</AppShell>
    </AppProviders>
  );
}
