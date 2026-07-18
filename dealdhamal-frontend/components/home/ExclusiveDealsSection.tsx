import Link from 'next/link'
import type { Coupon } from '@/types'
import { TopDealsCarousel } from '@/components/home/TopDealsCarousel'
import { Zap } from 'lucide-react'

interface ExclusiveDealsSectionProps {
  coupons: Coupon[]
}

export function ExclusiveDealsSection({ coupons }: ExclusiveDealsSectionProps) {
  if (!coupons || coupons.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">Exclusive Affiliate Deals</h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-orange-100 text-orange-700 border border-orange-200 shadow-sm animate-pulse">
            <Zap className="w-3.5 h-3.5 text-orange-600" />
            Exclusive
          </span>
        </div>
        <Link
          href="/best-offers"
          className="text-sm font-semibold text-orange-600 hover:text-orange-800 transition-colors"
        >
          View All →
        </Link>
      </div>
      <TopDealsCarousel coupons={coupons} />
    </section>
  )
}
