import { ArrowDownLeft, ArrowUpRight, ShieldCheck, Utensils, Wallet } from 'lucide-react';

/**
 * Pratinjau UI statis berbasis data ilustrasi murni (zero IndexedDB access).
 * Mengacu pada estetika kartu berlapis dark-emerald referensi.
 */
export function DashboardPreviewMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[540px] pt-2 pb-10 sm:pb-12">
      {/* Main App Preview Frame */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 sm:p-6 shadow-[var(--overlay-shadow)] sm:ml-10">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Ringkasan November</p>
            <p className="text-lg font-bold text-[var(--text-primary)] mt-0.5">
              Selamat Datang
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-semibold text-[var(--accent-primary)]">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            Pratinjau Ilustrasi
          </span>
        </div>

        {/* Income & Expense Mini Cards */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3.5">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>Pemasukan</span>
              <ArrowDownLeft className="w-3.5 h-3.5 text-[var(--status-success)]" aria-hidden="true" />
            </div>
            <p className="mt-1.5 text-base sm:text-lg font-bold tabular-nums text-[var(--text-primary)]">
              Rp 8.500.000
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3.5">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>Pengeluaran</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[var(--status-danger-text)]" aria-hidden="true" />
            </div>
            <p className="mt-1.5 text-base sm:text-lg font-bold tabular-nums text-[var(--text-primary)]">
              Rp 3.240.000
            </p>
          </div>
        </div>

        {/* Budget & Recent Activity Preview Rows */}
        <div className="mt-4 space-y-2.5">
          <div className="rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3.5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-[var(--text-primary)]">
                Anggaran Makanan & Minuman
              </span>
              <span className="tabular-nums font-semibold text-[var(--accent-primary)]">
                64% terpakai
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--bg-surface)] overflow-hidden">
              <div className="h-full w-[64%] rounded-full bg-[var(--accent-primary)]" />
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-full bg-amber-500/15 text-[var(--status-warning)] flex items-center justify-center shrink-0">
                <Utensils className="w-4 h-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                  Makan Siang Harian
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">Hari Ini • QRIS</p>
              </div>
            </div>
            <span className="text-xs font-semibold tabular-nums text-[var(--status-danger-text)] shrink-0">
              -Rp 38.000
            </span>
          </div>

          <div className="rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3.5 flex items-center justify-between gap-3 sm:opacity-60">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-full bg-emerald-500/15 text-[var(--accent-primary)] flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                  Proyek Desain UI
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">Kemarin • Transfer</p>
              </div>
            </div>
            <span className="text-xs font-semibold tabular-nums text-[var(--status-success)] shrink-0">
              +Rp 2.500.000
            </span>
          </div>
        </div>
      </div>

      {/* Overlapping Floating Trend Card (Inspired by Reference) */}
      <div className="mt-4 sm:mt-0 sm:absolute sm:left-0 sm:bottom-0 w-full sm:w-[290px] rounded-2xl bg-[var(--bg-elevated)]/95 backdrop-blur-md border border-[var(--border-subtle)] p-4 shadow-[var(--overlay-shadow)]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-medium text-[var(--text-secondary)]">
              Saldo Tersedia
            </p>
            <p className="text-xl font-bold tabular-nums text-[var(--text-primary)] mt-0.5">
              Rp 14.260.000
            </p>
            <span className="inline-block mt-1 text-xs font-semibold tabular-nums text-[var(--status-success)]">
              +18,4% rasio tabungan
            </span>
          </div>
          <span className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)]">
            <Wallet className="w-4 h-4" aria-hidden="true" />
          </span>
        </div>

        {/* Clean SVG Sparkline Curve */}
        <svg
          viewBox="0 0 260 92"
          className="w-full h-24 mt-3 overflow-visible"
          role="img"
          aria-label="Ilustrasi grafik tren saldo meningkat"
        >
          <defs>
            <linearGradient id="finoraCurveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="20" x2="260" y2="20" stroke="#263449" strokeDasharray="3 3" />
          <line x1="0" y1="50" x2="260" y2="50" stroke="#263449" strokeDasharray="3 3" />
          <line x1="0" y1="80" x2="260" y2="80" stroke="#263449" strokeDasharray="3 3" />
          <path
            d="M 4 68 C 32 70, 48 56, 72 58 C 96 60, 112 36, 138 38 C 164 40, 178 52, 202 34 C 220 22, 238 26, 252 18 L 252 88 L 4 88 Z"
            fill="url(#finoraCurveFill)"
          />
          <path
            d="M 4 68 C 32 70, 48 56, 72 58 C 96 60, 112 36, 138 38 C 164 40, 178 52, 202 34 C 220 22, 238 26, 252 18"
            fill="none"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="252" cy="18" r="6" fill="#10B981" fillOpacity="0.25" />
          <circle cx="252" cy="18" r="3.5" fill="#34D399" />
        </svg>
      </div>
    </div>
  );
}
