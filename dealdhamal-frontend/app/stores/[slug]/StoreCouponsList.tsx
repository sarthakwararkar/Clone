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

  const filteredCoupons = useMemo(() => {
    return initialCoupons
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
        // default: featured
        if (a.is_featured && !b.is_featured) return -1
        if (!a.is_featured && b.is_featured) return 1
        return b.success_rate - a.success_rate
      })
  }, [initialCoupons, type, sortBy])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-800">
          Active Coupons &amp; Offers
        </h2>
        <CouponFilters />
      </div>

      {filteredCoupons.length === 0 ? (
        <div className="py-8 bg-white border border-gray-100 rounded-xl">
          <EmptyState
            icon={Tag}
            title="No Coupons or Deals Found"
            description="There are no active coupons or deals that match the selected filters."
          />
        </div>
      ) : (
        <CouponList coupons={filteredCoupons} variant="premium" />
      )}
    </div>
  )
}
