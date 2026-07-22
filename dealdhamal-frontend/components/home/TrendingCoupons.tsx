import Link from 'next/link'
import type { Coupon } from '@/types'
import { TopDealsCarousel } from '@/components/home/TopDealsCarousel'
import { Tag } from 'lucide-react'

interface TrendingCouponsProps {
  coupons: Coupon[]
}

export function TrendingCoupons({ coupons }: TrendingCouponsProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">Today&apos;s Best Deals</h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-green-100 text-green-700 border border-green-200 shadow-sm">
            <Tag className="w-3.5 h-3.5 text-green-600" />
            Deals &amp; Offers
          </span>
        </div>
        <Link
          href="/stores"
          className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          View All →
        </Link>
      </div>
      <TopDealsCarousel coupons={coupons} />
    </section>
  )
}
