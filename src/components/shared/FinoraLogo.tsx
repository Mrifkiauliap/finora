import Image from 'next/image';
import { cn } from '@/lib/cn';

export function FinoraLogo({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/icons/icon-192x192.png"
      alt="Logo Finora"
      width={size}
      height={size}
      priority
      className={cn('rounded-xl shrink-0 object-cover', className)}
    />
  );
}
