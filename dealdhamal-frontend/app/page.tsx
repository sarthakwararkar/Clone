import type { Metadata } from 'next'
import { api } from '@/lib/api'
import { HeroBanner } from '@/components/home/HeroBanner'
import { BigSavingCoupons } from '@/components/home/BigSavingCoupons'
import { FeaturedStores } from '@/components/home/FeaturedStores'
import { TrendingCoupons } from '@/components/home/TrendingCoupons'
import { AiDealsSection } from '@/components/home/AiDealsSection'
import { ExclusiveDealsSection } from '@/components/home/ExclusiveDealsSection'
import { NewsletterBanner } from '@/components/home/NewsletterBanner'
import { HomePageSchema } from '@/components/seo/HomePageSchema'
import IntroSplash from '@/components/ui/IntroSplash'
import ClientButterflyOverlay from '@/components/home/ClientButterflyOverlay'

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
  const [
    categories,
    storesResponse,
    couponsResponse,
    dealsResponse,
    aiStoresResponse,
    aiDealsResponse,
    exclusiveDealsResponse,
  ] = await Promise.all([
    api.getCategories().catch(() => []),
    api.getStores({ featured: true, limit: 12 }).catch(() => ({ data: [], total: 0 })),
    api.getCoupons({ type: 'code', featured: true, diverse: true, limit: 12 }).catch(() => ({ data: [], total: 0 })),
    api.getCoupons({ type: 'deal', sort: 'latest', diverse: true, limit: 40 }).catch(() => ({ data: [], total: 0 })),
    api.getStores({ category: 'ai-tools', limit: 100 }).catch(() => ({ data: [] })),
    api.getCoupons({ category: 'ai-tools', type: 'deal', limit: 12 }).catch(() => ({ data: [] })),
    api.getExclusiveDeals(16).catch(() => ({ data: [] })),
  ])

  const featuredStores = storesResponse.data
  const featuredCoupons = couponsResponse.data
  const bestDeals = dealsResponse.data
  const aiStores = aiStoresResponse.data
  const aiDeals = aiDealsResponse.data
  const exclusiveDeals = exclusiveDealsResponse.data

  const aiStoreSlugs = new Set(aiStores.map((s: any) => s.slug))
  const nonAiDeals = bestDeals
    .filter((coupon) => !aiStoreSlugs.has(coupon.store.slug))
    .slice(0, 12)

  return (
    <IntroSplash>
      <ClientButterflyOverlay />
      <div className="space-y-12 relative z-10">
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
        {nonAiDeals.length > 0 && (
          <TrendingCoupons coupons={nonAiDeals} />
        )}

        {/* Exclusive Affiliate Deals */}
        {exclusiveDeals.length > 0 && (
          <ExclusiveDealsSection coupons={exclusiveDeals} />
        )}

        {/* Hot AI SaaS Deals */}
        {aiDeals.length > 0 && (
          <AiDealsSection coupons={aiDeals} />
        )}

        {/* Newsletter signup */}
        <NewsletterBanner />
      </div>
    </IntroSplash>
  )
}
