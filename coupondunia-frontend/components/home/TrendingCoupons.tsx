import Link from 'next/link'
import type { Coupon } from '@/types'
import { CouponGrid } from '@/components/coupons/CouponGrid'

interface TrendingCouponsProps {
  coupons: Coupon[]
}

export function TrendingCoupons({ coupons }: TrendingCouponsProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">Today&apos;s Best Deals</h2>
        <Link
          href="/stores"
          className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          View All →
        </Link>
      </div>
      <CouponGrid coupons={coupons} view="grid" />
    </section>
  )
}
