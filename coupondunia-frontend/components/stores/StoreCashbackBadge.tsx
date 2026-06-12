import type { Store } from '@/types'
import { cn } from '@/lib/utils'

interface StoreCashbackBadgeProps {
  rate: string
  className?: string
}

export function StoreCashbackBadge({ rate, className }: StoreCashbackBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 bg-accent/10 text-accent text-xs font-semibold px-2.5 py-1 rounded-full',
        className
      )}
    >
      <span className="text-accent">💰</span>
      {rate} Cashback
    </span>
  )
}
