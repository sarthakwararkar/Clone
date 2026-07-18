import Link from 'next/link'
import Image from 'next/image'
import type { Store } from '@/types'
import { StoreCashbackBadge } from './StoreCashbackBadge'
import { ExternalLink } from 'lucide-react'

interface StoreCardProps {
  store: Store
  variant?: 'default' | 'flip'
}

export function StoreCard({ store, variant = 'default' }: StoreCardProps) {
  const initials = store.name.slice(0, 2).toUpperCase()

  if (variant === 'flip') {
    return (
      <Link
        href={`/stores/${store.slug}`}
        className="block cursor-pointer group w-full text-current decoration-transparent"
      >
        <div className="flex flex-col items-center text-center w-full">
          {/* Card Flipping Container */}
          <div className="w-full aspect-square relative perspective-1000">
            <div className="w-full h-full absolute transition-transform duration-500 preserve-3d group-hover:rotate-x-180">
              {/* Front Face: Logo */}
              <div className="absolute inset-0 w-full h-full bg-white rounded-xl border border-gray-100 flex items-center justify-center p-3 sm:p-4 shadow-sm backface-hidden">
                {store.logo_url ? (
                  <Image
                    src={store.logo_url}
                    alt={store.name}
                    width={100}
                    height={100}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-lg bg-primary-light flex items-center justify-center">
                    <span className="text-primary font-bold text-lg sm:text-xl">{initials}</span>
                  </div>
                )}
              </div>

              {/* Back Face: Coupon Count */}
              <div className="absolute inset-0 w-full h-full bg-primary rounded-xl flex flex-col items-center justify-center p-2 text-white backface-hidden rotate-x-180">
                <div className="flex flex-col gap-1 sm:gap-2">
                  <div className="flex items-center gap-1.5 justify-center">
                    <span className="text-sm sm:text-base font-bold">{store.coupon_count ?? 0}</span>
                    <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider opacity-95">Coupons</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center border-t border-white/20 pt-1 sm:pt-2">
                    <span className="text-sm sm:text-base font-bold">{store.deal_count ?? 0}</span>
                    <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider opacity-95">Deals</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Store Name underneath */}
          <div className="mt-2.5 flex items-center justify-center gap-1 max-w-full px-1">
            <span className="font-semibold text-gray-900 text-xs sm:text-sm group-hover:text-primary group-hover:underline transition-colors truncate max-w-[calc(100%-14px)]">
              {store.name}
            </span>
            <ExternalLink className="w-3 h-3 text-primary opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 flex-shrink-0" />
          </div>
        </div>
      </Link>
    )
  }

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
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 font-medium">
            {store.coupon_count > 0 && `${store.coupon_count} coupon${store.coupon_count !== 1 ? 's' : ''}`}
            {store.coupon_count > 0 && (store.deal_count ?? 0) > 0 && ' • '}
            {(store.deal_count ?? 0) > 0 && `${store.deal_count} deal${store.deal_count !== 1 ? 's' : ''}`}
            {store.coupon_count === 0 && (store.deal_count ?? 0) === 0 && '0 offers'}
          </p>
        )}
      </div>
    </Link>
  )
}
