'use client';

import * as React from 'react';
import { formatIdrInputDisplay, parseIdrDigits } from '@/domain/money';
import { cn } from '@/lib/cn';

export interface CurrencyInputProps {
  id: string;
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
}

export function CurrencyInput({
  id,
  label,
  value,
  onChange,
  error,
  placeholder = '0',
  disabled = false,
  required = false,
  helperText,
}: CurrencyInputProps) {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const displayValue = formatIdrInputDisplay(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseIdrDigits(e.target.value);
    onChange(parsed);
  };

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[var(--text-primary)]"
      >
        {label}
        {required ? <span className="text-[var(--status-danger-text)] ml-1">*</span> : null}
      </label>
      <div className="relative flex items-center">
        <span
          aria-hidden="true"
          className="absolute left-3.5 text-sm font-semibold text-[var(--text-secondary)] select-none pointer-events-none"
        >
          Rp
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            'w-full h-11 sm:h-10 pl-10 pr-3.5 rounded-lg text-sm tabular-nums font-medium bg-[var(--bg-canvas)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border transition-colors duration-150 disabled:opacity-50',
            error
              ? 'border-[var(--status-danger)]'
              : 'border-[var(--border-control)] focus:border-[var(--accent-primary)]'
          )}
        />
      </div>
      {error ? (
        <p id={errorId} className="text-xs text-[var(--status-danger-text)]">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-[var(--text-secondary)]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
