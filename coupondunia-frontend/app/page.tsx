import type { Metadata } from 'next'
import { api } from '@/lib/api'
import { HeroBanner } from '@/components/home/HeroBanner'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { FeaturedStores } from '@/components/home/FeaturedStores'
import { TrendingCoupons } from '@/components/home/TrendingCoupons'
import { NewsletterBanner } from '@/components/home/NewsletterBanner'

export const revalidate = 3600 // ISR hourly

export const metadata: Metadata = {
  title: 'Best Coupons & Deals in India | Save More Today',
  description: 'Verified promo codes, cashback rewards, and hot deals for Amazon, Flipkart, Myntra & 100+ stores. Save big with CouponIndia!',
  openGraph: {
    title: 'Best Coupons & Deals in India | Save More Today',
    description: 'Verified promo codes, cashback rewards, and hot deals for Amazon, Flipkart, Myntra & 100+ stores. Save big with CouponIndia!',
  },
}

export default async function Homepage() {
  // Fetch homepage data in parallel
  const [categories, storesResponse, couponsResponse] = await Promise.all([
    api.getCategories().catch(() => []),
    api.getStores({ featured: true, limit: 12 }).catch(() => ({ data: [], total: 0 })),
    api.getCoupons({ featured: true, limit: 12 }).catch(() => ({ data: [], total: 0 })),
  ])

  const featuredStores = storesResponse.data
  const featuredCoupons = couponsResponse.data

  return (
    <div className="space-y-12">
      {/* Hero banner carousel */}
      {featuredCoupons.length > 0 && (
        <HeroBanner coupons={featuredCoupons.slice(0, 5)} />
      )}

      {/* Category Grid */}
      {categories.length > 0 && (
        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Shop by Category
          </h2>
          <CategoryGrid categories={categories} />
        </section>
      )}

      {/* Top Stores */}
      {featuredStores.length > 0 && (
        <FeaturedStores stores={featuredStores} />
      )}

      {/* Today's Best Deals */}
      {featuredCoupons.length > 0 && (
        <TrendingCoupons coupons={featuredCoupons} />
      )}

      {/* Newsletter signup */}
      <NewsletterBanner />
    </div>
  )
}
