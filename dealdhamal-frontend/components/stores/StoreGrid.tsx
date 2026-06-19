import type { Store } from '@/types'
import { StoreCard } from './StoreCard'

interface StoreGridProps {
  stores: Store[]
  variant?: 'default' | 'flip'
}

export function StoreGrid({ stores, variant = 'default' }: StoreGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} variant={variant} />
      ))}
    </div>
  )
}
