'use client'
import { useMemo } from 'react'
import type { Coupon } from '@/types'
import { CouponList } from '@/components/coupons/CouponList'
import { CouponFilters } from '@/components/coupons/CouponFilters'
import { useCouponFilterStore } from '@/stores/useCouponFilterStore'
import { EmptyState } from '@/components/ui/EmptyState'
import { Tag } from 'lucide-react'

interface StoreCouponsListProps {
  initialCoupons: Coupon[]
}

export function StoreCouponsList({ initialCoupons }: StoreCouponsListProps) {
  const { type, sortBy } = useCouponFilterStore()

  const sorted = useMemo(() => {
    return [...initialCoupons].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      if (sortBy === 'popular') {
        return b.used_count - a.used_count
      }
      // default: featured
      if (a.is_featured && !b.is_featured) return -1
      if (!a.is_featured && b.is_featured) return 1
      return b.success_rate - a.success_rate
    })
  }, [initialCoupons, sortBy])

  // Segment into codes vs deals (cashback treated as deal for display)
  const codes = useMemo(() => sorted.filter((c) => c.coupon_type === 'code'), [sorted])
  const deals = useMemo(() => sorted.filter((c) => c.coupon_type !== 'code'), [sorted])

  // When a type pill is selected, show only that filtered subset in a flat list
  const filteredSingle = useMemo(() => {
    if (type === 'all') return null
    return sorted.filter((c) => c.coupon_type === type)
  }, [sorted, type])

  const isEmpty = type === 'all' ? codes.length === 0 && deals.length === 0 : filteredSingle!.length === 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-800">
          Active Coupons &amp; Offers
        </h2>
        <CouponFilters />
      </div>

      {isEmpty ? (
        <div className="py-8 bg-white border border-gray-100 rounded-xl">
          <EmptyState
            icon={Tag}
            title="No Coupons or Deals Found"
            description="There are no active coupons or deals that match the selected filters."
          />
        </div>
      ) : type !== 'all' ? (
        /* A specific type pill is active — show flat filtered list */
        <CouponList coupons={filteredSingle!} variant="premium" />
      ) : (
        /* Default "All" view — split into two labelled sections */
        <div className="space-y-8">
          {codes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  <Tag className="w-3 h-3" />
                  Coupon Codes
                </span>
                <span className="text-sm text-gray-400 font-medium">{codes.length} available</span>
              </div>
              <CouponList coupons={codes} variant="premium" />
            </div>
          )}

          {deals.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  <Tag className="w-3 h-3" />
                  Deals &amp; Offers
                </span>
                <span className="text-sm text-gray-400 font-medium">{deals.length} available</span>
              </div>
              <CouponList coupons={deals} variant="premium" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
