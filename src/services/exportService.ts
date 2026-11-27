import { db, type FinoraDatabase } from '@/db/database';
import { serializeTransactionsToCsv } from '@/domain/csvFormatter';
import { getLocalToday } from '@/domain/dates';
import { err, ok, type ServiceResult } from './errors';
import { queryTransactions, type TransactionFilterInput } from './transactionService';

export async function exportTransactionsCsv(
  filter: TransactionFilterInput = {},
  database: FinoraDatabase = db
): Promise<ServiceResult<{ filename: string; rowCount: number; csvContent: string; blob: Blob }>> {
  const queryRes = await queryTransactions(
    { ...filter, page: undefined, pageSize: undefined },
    database
  );
  if (!queryRes.ok) {
    return queryRes;
  }

  if (queryRes.data.items.length === 0) {
    return err('VALIDATION_ERROR', 'Tidak ada transaksi untuk diekspor pada filter ini.');
  }

  const csvContent = serializeTransactionsToCsv(queryRes.data.items);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = `finora-laporan-${getLocalToday()}.csv`;

  return ok({
    filename,
    rowCount: queryRes.data.items.length,
    csvContent,
    blob,
  });
}
