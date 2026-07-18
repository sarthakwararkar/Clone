'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useSearch } from '@/hooks/useSearch'
import { useCouponFilterStore } from '@/stores/useCouponFilterStore'
import { StoreGrid } from '@/components/stores/StoreGrid'
import { CouponGrid } from '@/components/coupons/CouponGrid'
import { CouponFilters } from '@/components/coupons/CouponFilters'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { trackSearch } from '@/lib/analytics'
import type { Coupon } from '@/types'

interface SearchResultsProps {
  query: string
}

export function SearchResults({ query }: SearchResultsProps) {
  const router = useRouter()
  const { data, isLoading, isError } = useSearch(query)
  const { type, sortBy } = useCouponFilterStore()

  useEffect(() => {
    if (!isLoading && data) {
      const totalResults = (data.stores?.length ?? 0) + (data.coupons?.length ?? 0)
      trackSearch(query, totalResults)
    }
  }, [isLoading, data, query])

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div>
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="py-12">
        <EmptyState
          icon={Search}
          title="Search Failed"
          description="We couldn't process your search query. Please try again."
          actionLabel="Go Home"
          onAction={() => router.push('/' as any)}
        />
      </div>
    )
  }

  const { stores = [], coupons = [] } = data

  // Apply filters and sorting to coupons
  const filteredCoupons = coupons
    .filter((c) => {
      if (type === 'all') return true
      return c.coupon_type === type
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      if (sortBy === 'popular') {
        return b.used_count - a.used_count
      }
      // default: featured first, then by success rate or newest
      if (a.is_featured && !b.is_featured) return -1
      if (!a.is_featured && b.is_featured) return 1
      return b.success_rate - a.success_rate
    })

  const totalResults = stores.length + filteredCoupons.length

  if (totalResults === 0) {
    return (
      <div className="py-12">
        <EmptyState
          icon={Search}
          title={`No results for "${query}"`}
          description="Try checking for typos, using different keywords, or browse popular categories instead."
          actionLabel="Browse Categories"
          onAction={() => router.push('/categories' as any)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Stores Section */}
      {stores.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            Stores <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">{stores.length}</span>
          </h2>
          <StoreGrid stores={stores} />
        </div>
      )}

      {/* Coupons Section */}
      {coupons.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              Coupons &amp; Deals <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">{filteredCoupons.length}</span>
            </h2>
            <CouponFilters />
          </div>

          {filteredCoupons.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-gray-100 text-gray-500 text-sm">
              No coupons or deals match the selected filters.
            </div>
          ) : (
            <CouponGrid coupons={filteredCoupons} />
          )}
        </div>
      )}
    </div>
  )
}
