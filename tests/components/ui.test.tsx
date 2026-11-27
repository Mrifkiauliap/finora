import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BudgetProgressCard } from '@/components/budgets/BudgetProgressCard';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { MoneyText } from '@/components/shared/MoneyText';
import { TypedConfirmDialog } from '@/components/shared/TypedConfirmDialog';

const mockPush = vi.fn();
let mockPathname = '/app';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
}));

vi.mock('@/components/providers/AppProviders', () => ({
  useAppContext: () => ({
    settings: undefined,
    resolvedTheme: 'dark',
    isMasked: false,
    togglePrivacyMask: vi.fn().mockResolvedValue(undefined),
    setThemePreference: vi.fn().mockResolvedValue(undefined),
    showToast: vi.fn(),
    bootstrapReady: true,
    recurringGeneratedCount: 0,
    cappedRuleIds: [],
  }),
}));

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

  it('CommandPalette opens on Ctrl+K, filters commands, navigates on Enter, and closes on Escape', async () => {
    const user = userEvent.setup();
    mockPush.mockClear();

    const Wrapper = () => {
      const [open, setOpen] = React.useState(false);
      return <CommandPalette open={open} onOpenChange={setOpen} />;
    };

    render(<Wrapper />);
    expect(screen.queryByRole('combobox', { name: 'Cari perintah' })).not.toBeInTheDocument();

    await user.keyboard('{Control>}k{/Control}');

    const input = await screen.findByRole('combobox', { name: 'Cari perintah' });
    expect(input).toBeInTheDocument();
    expect(screen.getByText('Aksi Cepat')).toBeInTheDocument();
    expect(screen.getByText('Navigasi')).toBeInTheDocument();

    await user.type(input, 'laporan');
    expect(screen.getByRole('option', { name: /Laporan & Ekspor/i })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Anggaran Bulanan/i })).not.toBeInTheDocument();

    await user.keyboard('{Enter}');
    expect(mockPush).toHaveBeenCalledWith('/app/reports');
    await waitFor(() => {
      expect(screen.queryByRole('combobox', { name: 'Cari perintah' })).not.toBeInTheDocument();
    });

    await user.keyboard('{Control>}k{/Control}');
    expect(await screen.findByRole('combobox', { name: 'Cari perintah' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('combobox', { name: 'Cari perintah' })).not.toBeInTheDocument();
    });
  });

  it('MobileBottomNav renders 5 slots and opens grouped Menu Aplikasi bottom sheet', async () => {
    const user = userEvent.setup();
    mockPathname = '/app';

    render(<MobileBottomNav />);

    expect(screen.getByRole('link', { name: 'Beranda' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Transaksi' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Anggaran' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Target' })).toBeInTheDocument();

    const moreBtn = screen.getByRole('button', { name: 'Lainnya' });
    expect(moreBtn).toBeInTheDocument();

    await user.click(moreBtn);

    expect(await screen.findByText('Menu Aplikasi')).toBeInTheDocument();
    expect(screen.getByText('KEUANGAN & PERENCANAAN')).toBeInTheDocument();
    expect(screen.getByText('PENGELOLAAN & SISTEM')).toBeInTheDocument();
    expect(screen.getByText('Tambah pemasukan atau pengeluaran baru')).toBeInTheDocument();
    expect(screen.getByText('Cadangkan atau pulihkan database JSON lokal')).toBeInTheDocument();
  });
});
