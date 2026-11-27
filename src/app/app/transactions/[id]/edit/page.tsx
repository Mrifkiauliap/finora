'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileQuestion } from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProviders';
import { EmptyState } from '@/components/shared/EmptyState';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { Card } from '@/components/ui/Card';
import type { TransactionRecord } from '@/db/types';
import { getTransactionById } from '@/services/transactionService';

export default function EditTransactionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { bootstrapReady } = useAppContext();

  const [loading, setLoading] = React.useState(true);
  const [tx, setTx] = React.useState<TransactionRecord | null>(null);

  React.useEffect(() => {
    if (!bootstrapReady || !params.id) return;
    let cancelled = false;
    setLoading(true);
    void getTransactionById(params.id).then((res) => {
      if (cancelled) return;
      if (res.ok) setTx(res.data);
      else setTx(null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [bootstrapReady, params.id]);

  if (!bootstrapReady || loading) {
    return (
      <Card className="max-w-xl mx-auto h-96 animate-pulse bg-[var(--bg-surface)]" />
    );
  }

  if (!tx) {
    return (
      <div className="max-w-xl mx-auto">
        <EmptyState
          icon={FileQuestion}
          title="Transaksi tidak ditemukan"
          description="Transaksi yang Anda cari mungkin sudah dihapus."
          actionLabel="Kembali ke Daftar Transaksi"
          onAction={() => router.push('/app/transactions')}
        />
      </div>
    );
  }

  return <TransactionForm mode="edit" initialTransaction={tx} />;
}
