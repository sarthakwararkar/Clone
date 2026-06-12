import { CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'code' | 'deal' | 'cashback' | 'exclusive' | 'verified'

interface BadgeProps {
  variant: BadgeVariant
  className?: string
}

const config: Record<BadgeVariant, { label: string; className: string; icon?: boolean }> = {
  code: { label: 'CODE', className: 'bg-primary text-white' },
  deal: { label: 'DEAL', className: 'bg-green-500 text-white' },
  cashback: { label: 'CASHBACK', className: 'bg-accent text-white' },
  exclusive: { label: 'EXCLUSIVE', className: 'bg-purple-600 text-white' },
  verified: { label: 'VERIFIED', className: 'bg-blue-500 text-white', icon: true },
}

export function Badge({ variant, className }: BadgeProps) {
  const { label, className: variantClass, icon } = config[variant]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full text-xs font-semibold px-2 py-0.5',
        variantClass,
        className
      )}
    >
      {icon && <CheckCircle className="w-3 h-3" />}
      {label}
    </span>
  )
}
