import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BudgetProgressCard } from '@/components/budgets/BudgetProgressCard';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { MoneyText } from '@/components/shared/MoneyText';
import { TypedConfirmDialog } from '@/components/shared/TypedConfirmDialog';

describe('Finora UI Components', () => {
  it('MoneyText formats IDR and supports privacy masking', () => {
    const { rerender } = render(
      <MoneyText amount={150_000} variant="income" showSign />
    );
    expect(screen.getByText('+Rp 150.000')).toBeInTheDocument();

    rerender(<MoneyText amount={150_000} variant="income" showSign masked />);
    expect(screen.getByLabelText('Nominal disembunyikan')).toHaveTextContent('Rp •••••••');
  });

  it('CurrencyInput formats thousands on typing and outputs integer IDR', async () => {
    const user = userEvent.setup();
    const Wrapper = () => {
      const [val, setVal] = React.useState<number | null>(null);
      return (
        <CurrencyInput
          id="amt"
          label="Nominal"
          value={val}
          onChange={setVal}
        />
      );
    };
    render(<Wrapper />);
    const input = screen.getByLabelText('Nominal');
    await user.type(input, '35000abc');
    expect(input).toHaveValue('35.000');
  });

  it('BudgetProgressCard exposes semantic progressbar ARIA attributes', () => {
    render(
      <BudgetProgressCard
        budget={{
          id: 'b1',
          categoryId: 'cat-sys-food',
          categoryName: 'Makanan & Minuman',
          categoryIcon: 'utensils',
          categoryColor: '#F59E0B',
          month: '2026-11',
          limitAmount: 1_000_000,
          warningThresholdPct: 80,
          spentAmount: 850_000,
          remainingAmount: 150_000,
          utilizationPct: 85,
          status: 'warning',
          createdAt: '2026-11-01T00:00:00.000Z',
          updatedAt: '2026-11-01T00:00:00.000Z',
        }}
      />
    );

    const bar = screen.getByRole('progressbar', { name: /Makanan & Minuman/i });
    expect(bar).toHaveAttribute('aria-valuenow', '85');
    expect(screen.getByText('Mendekati Batas')).toBeInTheDocument();
  });

  it('TC-030: TypedConfirmDialog keeps confirm button disabled until exact keyword is typed', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <TypedConfirmDialog
        open
        onOpenChange={() => {}}
        title="Hapus Data"
        description="Konfirmasi hapus"
        requiredKeyword="HAPUS"
        confirmLabel="Hapus Permanen"
        onConfirm={onConfirm}
      />
    );

    const confirmBtn = screen.getByRole('button', { name: 'Hapus Permanen' });
    expect(confirmBtn).toBeDisabled();

    const input = screen.getByPlaceholderText('HAPUS');
    await user.type(input, 'hapus');
    expect(confirmBtn).toBeDisabled();

    await user.clear(input);
    await user.type(input, 'HAPUS');
    expect(confirmBtn).toBeEnabled();

    await user.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
