import Link from 'next/link'
import type { Coupon } from '@/types'
import { TopDealsCarousel } from '@/components/home/TopDealsCarousel'
import { Sparkles } from 'lucide-react'

interface AiDealsSectionProps {
  coupons: Coupon[]
}

export function AiDealsSection({ coupons }: AiDealsSectionProps) {
  if (!coupons || coupons.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">Hot AI SaaS Deals</h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-violet-100 text-violet-700 animate-pulse border border-violet-200 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            AI Special
          </span>
        </div>
        <Link
          href="/ai"
          className="text-sm font-semibold text-violet-600 hover:text-violet-800 transition-colors"
        >
          Explore AI Deals →
        </Link>
      </div>
      <TopDealsCarousel coupons={coupons} />
    </section>
  )
}
