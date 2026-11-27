import {
  Briefcase,
  Car,
  Coffee,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  MoreHorizontal,
  PiggyBank,
  Plane,
  Receipt,
  ShoppingBag,
  Smartphone,
  Tag,
  Target,
  TrendingUp,
  Utensils,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  receipt: Receipt,
  'shopping-bag': ShoppingBag,
  'gamepad-2': Gamepad2,
  'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap,
  wallet: Wallet,
  briefcase: Briefcase,
  gift: Gift,
  'trending-up': TrendingUp,
  home: Home,
  plane: Plane,
  coffee: Coffee,
  smartphone: Smartphone,
  target: Target,
  'piggy-bank': PiggyBank,
  tag: Tag,
  'more-horizontal': MoreHorizontal,
};

export function CategoryIcon({
  name,
  className = 'w-4 h-4',
}: {
  name: string;
  className?: string;
}) {
  const IconComp = ICON_MAP[name] ?? Tag;
  return <IconComp className={className} aria-hidden="true" strokeWidth={1.75} />;
}
