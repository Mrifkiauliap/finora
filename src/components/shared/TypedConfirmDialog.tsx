'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function TypedConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  requiredKeyword,
  confirmLabel = 'Konfirmasi',
  loading = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  requiredKeyword: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}) {
  const [typed, setTyped] = React.useState('');

  React.useEffect(() => {
    if (!open) setTyped('');
  }, [open]);

  const isMatched = typed.trim() === requiredKeyword;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle className="text-lg font-semibold text-[var(--text-primary)]">
          {title}
        </AlertDialogTitle>
        <AlertDialogDescription className="mt-2 text-sm text-[var(--text-secondary)]">
          {description}
        </AlertDialogDescription>
        <div className="mt-4 space-y-2">
          <label
            htmlFor="typed-confirm-input"
            className="block text-xs font-medium text-[var(--text-secondary)]"
          >
            Ketik <strong className="text-[var(--text-primary)]">{requiredKeyword}</strong> untuk melanjutkan:
          </label>
          <Input
            id="typed-confirm-input"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={requiredKeyword}
            autoComplete="off"
          />
        </div>
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={loading}>
              Batal
            </Button>
          </AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={!isMatched || loading}
            onClick={() => void onConfirm()}
          >
            {loading ? 'Memproses...' : confirmLabel}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
