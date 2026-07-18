'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSearch } from '@/hooks/useSearch'
import { useSearchStore } from '@/stores/useSearchStore'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDiscount } from '@/lib/utils'
import { trackSearch } from '@/lib/analytics'

interface SearchDropdownProps {
  query: string
}

export function SearchDropdown({ query }: SearchDropdownProps) {
  const { data: results, isLoading } = useSearch(query)
  const { closeDropdown } = useSearchStore()
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && results) {
      const totalResults = (results.stores?.length ?? 0) + (results.coupons?.length ?? 0)
      trackSearch(query, totalResults)
    }
  }, [isLoading, results, query])

  const stores = results?.stores?.slice(0, 3) ?? []
  const coupons = results?.coupons?.slice(0, 5) ?? []
  const hasResults = stores.length > 0 || coupons.length > 0

  const handleSeeAll = () => {
    closeDropdown()
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto">
      {isLoading && (
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-7 h-7 rounded-md flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && hasResults && (
        <>
          {stores.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                Stores
              </div>
              {stores.map((store) => (
                <Link
                  key={store.id}
                  href={`/stores/${store.slug}`}
                  onClick={closeDropdown}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-md border border-gray-100 overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                    {store.logo_url ? (
                      <Image src={store.logo_url} alt={store.name} width={28} height={28} className="object-contain" />
                    ) : (
                      <span className="text-xs font-bold text-primary">{store.name[0]}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-800 truncate flex-1 min-w-0 pr-2">{store.name}</span>
                  {store.coupon_count !== undefined && (
                    <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
                      {store.coupon_count > 0 && `${store.coupon_count} coupon${store.coupon_count !== 1 ? 's' : ''}`}
                      {store.coupon_count > 0 && (store.deal_count ?? 0) > 0 && ', '}
                      {(store.deal_count ?? 0) > 0 && `${store.deal_count} deal${store.deal_count !== 1 ? 's' : ''}`}
                      {store.coupon_count === 0 && (store.deal_count ?? 0) === 0 && '0 offers'}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}

          {coupons.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                Coupons &amp; Deals
              </div>
              {coupons.map((coupon) => (
                <Link
                  key={coupon.id}
                  href={`/coupons/${coupon.id}`}
                  onClick={closeDropdown}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 truncate">{coupon.store?.name}</p>
                    <p className="text-sm text-gray-800 truncate">{coupon.title}</p>
                  </div>
                  <span className="ml-auto text-xs font-semibold text-primary flex-shrink-0">
                    {formatDiscount(coupon.discount_value)}
                  </span>
                </Link>
              ))}
            </div>
          )}

          <button
            onClick={handleSeeAll}
            className="w-full text-center text-sm text-primary py-3 border-t border-gray-100 hover:bg-primary-light transition-colors font-medium"
          >
            See all results for &ldquo;{query}&rdquo; →
          </button>
        </>
      )}

      {!isLoading && !hasResults && query.length > 1 && (
        <div className="py-6 text-center text-sm text-gray-500">
          No results for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  )
}
