'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={item.question}
            className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-sm sm:text-base font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]/60 transition-colors cursor-pointer"
            >
              <span>{item.question}</span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 shrink-0 text-[var(--text-secondary)] transition-transform duration-150',
                  isOpen && 'rotate-180 text-[var(--accent-primary)]'
                )}
                aria-hidden="true"
              />
            </button>
            {isOpen ? (
              <div className="px-5 pb-4 pt-1 text-sm leading-relaxed text-[var(--text-secondary)] border-t border-[var(--border-subtle)]/60">
                {item.answer}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
