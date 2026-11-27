'use client';

import { TransactionForm } from '@/components/transactions/TransactionForm';
import { useAppContext } from '@/components/providers/AppProviders';
import { Card } from '@/components/ui/Card';

export default function NewTransactionPage() {
  const { bootstrapReady } = useAppContext();

  if (!bootstrapReady) {
    return (
      <Card className="max-w-xl mx-auto h-96 animate-pulse bg-[var(--bg-surface)]" />
    );
  }

  return <TransactionForm mode="create" />;
}
