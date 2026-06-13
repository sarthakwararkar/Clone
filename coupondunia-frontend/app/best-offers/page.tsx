import type { Metadata } from 'next'
import { api } from '@/lib/api'
import { CouponCard } from '@/components/coupons/CouponCard'

export const revalidate = 600 // Cache for 10 minutes

export const metadata: Metadata = {
  title: 'Top 10 Best Offers & Coupons | CouponDunia',
  description: 'Discover the top 10 handpicked best offers, verified promo codes, and exclusive deals from top stores to maximize your savings today.',
}

export default async function BestOffersPage() {
  const couponsResponse = await api.getCoupons({ featured: true, limit: 10 }).catch(() => ({ data: [], total: 0 }))
  const coupons = couponsResponse.data

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="text-center space-y-2 max-w-xl mx-auto mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Today's Top 10 Best Offers
        </h1>
        <p className="text-sm text-gray-500">
          Handpicked, verified coupon codes, exclusive cashback rates, and discount deals to help you save maximum on your shopping.
        </p>
      </div>

      {coupons.length > 0 ? (
        <div className="space-y-4">
          {coupons.map((coupon, index) => (
            <div key={coupon.id} className="relative group">
              {/* Rank Badge */}
              <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-primary text-white font-black text-xs flex items-center justify-center shadow-md border-2 border-white z-10 group-hover:scale-110 transition-transform">
                #{index + 1}
              </div>
              <CouponCard coupon={coupon} view="list" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <p className="text-gray-500 font-medium">No active featured offers found. Check back later!</p>
        </div>
      )}
    </div>
  )
}
