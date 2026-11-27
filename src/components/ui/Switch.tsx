'use client';

import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/cn';

export const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-[var(--border-control)] bg-[var(--bg-canvas)] transition-colors data-[state=checked]:bg-[var(--accent-primary)] data-[state=checked]:border-[var(--accent-primary)] disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'pointer-events-none block h-5 w-5 rounded-full bg-[var(--text-primary)] data-[state=checked]:bg-[var(--accent-foreground)] shadow-sm transition-transform translate-x-0.5 data-[state=checked]:translate-x-5'
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = 'Switch';
