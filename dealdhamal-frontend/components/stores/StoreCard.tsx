import Link from 'next/link'
import Image from 'next/image'
import type { Store } from '@/types'
import { StoreCashbackBadge } from './StoreCashbackBadge'

interface StoreCardProps {
  store: Store
}

export function StoreCard({ store }: StoreCardProps) {
  const initials = store.name.slice(0, 2).toUpperCase()

  return (
    <Link
      href={`/stores/${store.slug}`}
      className="block bg-white rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group border border-transparent hover:border-primary/10"
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-gray-100 bg-white flex items-center justify-center overflow-hidden p-1.5 sm:p-2 group-hover:shadow-sm transition-shadow">
          {store.logo_url ? (
            <Image
              src={store.logo_url}
              alt={store.name}
              width={80}
              height={80}
              className="object-contain w-full h-full"
            />
          ) : (
            <div className="w-full h-full rounded-lg bg-primary-light flex items-center justify-center">
              <span className="text-primary font-bold text-lg sm:text-xl">{initials}</span>
            </div>
          )}
        </div>

        <p className="font-semibold text-gray-900 mt-2 sm:mt-3 text-xs sm:text-sm group-hover:text-primary transition-colors truncate w-full">
          {store.name}
        </p>

        {store.cashback_rate && (
          <div className="mt-1 sm:mt-1.5 scale-90 sm:scale-100 origin-center">
            <StoreCashbackBadge rate={store.cashback_rate} />
          </div>
        )}

        {store.coupon_count !== undefined && (
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
            {store.coupon_count} coupon{store.coupon_count !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </Link>
  )
}
