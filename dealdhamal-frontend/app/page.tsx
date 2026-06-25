import type { Metadata } from 'next'
import { api } from '@/lib/api'
import { HeroBanner } from '@/components/home/HeroBanner'
import { BigSavingCoupons } from '@/components/home/BigSavingCoupons'
import { FeaturedStores } from '@/components/home/FeaturedStores'
import { TrendingCoupons } from '@/components/home/TrendingCoupons'
import { NewsletterBanner } from '@/components/home/NewsletterBanner'
import { HomePageSchema } from '@/components/seo/HomePageSchema'

export const revalidate = 3600 // ISR hourly

export const metadata: Metadata = {
  title: 'Best Coupons & Deals in India | Save More Today',
  description: 'Verified promo codes, cashback rewards, and hot deals for Amazon, Flipkart, Myntra & 100+ stores. Save big with DealDhamal!',
  openGraph: {
    title: 'Best Coupons & Deals in India | Save More Today',
    description: 'Verified promo codes, cashback rewards, and hot deals for Amazon, Flipkart, Myntra & 100+ stores. Save big with DealDhamal!',
  },
}

export default async function Homepage() {
  // Fetch homepage data in parallel
  const [categories, storesResponse, couponsResponse, dealsResponse] = await Promise.all([
    api.getCategories().catch(() => []),
    api.getStores({ featured: true, limit: 12 }).catch(() => ({ data: [], total: 0 })),
    api.getCoupons({ type: 'code', featured: true, diverse: true, limit: 12 }).catch(() => ({ data: [], total: 0 })),
    api.getCoupons({ type: 'deal', sort: 'latest', diverse: true, limit: 12 }).catch(() => ({ data: [], total: 0 })),
  ])

  const featuredStores = storesResponse.data
  const featuredCoupons = couponsResponse.data
  const bestDeals = dealsResponse.data

  return (
    <div className="space-y-12">
      <HomePageSchema featuredStores={featuredStores} />
      {/* Hero banner carousel */}
      {featuredCoupons.length > 0 && (
        <HeroBanner coupons={featuredCoupons.slice(0, 5)} />
      )}

      {/* Big Saving Coupon Codes */}
      {featuredCoupons.length > 0 && (
        <BigSavingCoupons coupons={featuredCoupons} />
      )}

      {/* Top Stores */}
      {featuredStores.length > 0 && (
        <FeaturedStores stores={featuredStores} />
      )}

      {/* Today's Best Deals */}
      {bestDeals.length > 0 && (
        <TrendingCoupons coupons={bestDeals} />
      )}

      {/* Newsletter signup */}
      <NewsletterBanner />
    </div>
  )
}
