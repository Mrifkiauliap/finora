'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={hasError || undefined}
        className={cn(
          'w-full h-11 sm:h-10 px-3.5 rounded-lg text-sm bg-[var(--bg-canvas)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
          hasError
            ? 'border-[var(--status-danger)] focus:outline-none'
            : 'border-[var(--border-control)] focus:border-[var(--accent-primary)]',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={hasError || undefined}
        className={cn(
          'w-full px-3.5 py-2.5 rounded-lg text-sm bg-[var(--bg-canvas)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border transition-colors duration-150 disabled:opacity-50',
          hasError
            ? 'border-[var(--status-danger)]'
            : 'border-[var(--border-control)] focus:border-[var(--accent-primary)]',
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, hasError, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        aria-invalid={hasError || undefined}
        className={cn(
          'w-full h-11 sm:h-10 px-3 rounded-lg text-sm bg-[var(--bg-canvas)] text-[var(--text-primary)] border transition-colors duration-150 disabled:opacity-50',
          hasError
            ? 'border-[var(--status-danger)]'
            : 'border-[var(--border-control)] focus:border-[var(--accent-primary)]',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
NativeSelect.displayName = 'NativeSelect';
