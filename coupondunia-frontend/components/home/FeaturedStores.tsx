import Link from 'next/link'
import type { Store } from '@/types'
import { StoreGrid } from '@/components/stores/StoreGrid'

interface FeaturedStoresProps {
  stores: Store[]
}

export function FeaturedStores({ stores }: FeaturedStoresProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">Top Stores</h2>
        <Link
          href="/stores"
          className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          View All Stores →
        </Link>
      </div>
      <StoreGrid stores={stores} />
    </section>
  )
}
