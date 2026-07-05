import {
  UtensilsCrossed, Car, ShoppingBag, Gamepad2, Receipt, Heart,
  GraduationCap, Wallet, MoreHorizontal, type LucideIcon,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed, Car, ShoppingBag, Gamepad2, Receipt, Heart,
  GraduationCap, Wallet, MoreHorizontal,
}

interface CategoryIconProps {
  icon: string
  color: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CategoryIcon({ icon, color, size = 'md', className }: CategoryIconProps) {
  const Icon = ICON_MAP[icon] ?? MoreHorizontal
  const sizeMap = { sm: 14, md: 18, lg: 22 }
  const boxMap = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-11 h-11' }

  return (
    <div
      className={cn('rounded-xl flex items-center justify-center shrink-0', boxMap[size], className)}
      style={{ backgroundColor: `${color}18`, color }}
    >
      <Icon size={sizeMap[size]} />
    </div>
  )
}
