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

export const revalidate = 60 // Revalidate every minute so live data is always fresh

export const metadata: Metadata = {
  title: 'Best Coupons & Deals in India | Save More Today',
  description: 'Verified promo codes, cashback rewards, and hot deals for Amazon, Flipkart, Myntra & 100+ stores. Save big with DealDhamal!',
  openGraph: {
    title: 'Best Coupons & Deals in India | Save More Today',
    description: 'Verified promo codes, cashback rewards, and hot deals for Amazon, Flipkart, Myntra & 100+ stores. Save big with DealDhamal!',
  },
}

export default async function Homepage() {
  // Fetch homepage data in parallel with robust fallbacks
  const [
    categories,
    storesResponse,
    allCouponsResponse,
    aiStoresResponse,
    aiDealsResponse,
    exclusiveDealsResponse,
  ] = await Promise.all([
    api.getCategories().catch(() => []),
    api.getStores({ sort: 'most_deals', limit: 12 }).catch(() => ({ data: [], total: 0 })),
    // Fetch active coupons with smart sorting to populate HeroBanner, BigSavingCoupons, and TrendingCoupons
    api.getCoupons({ limit: 60, sort: 'smart' }).catch(() => ({ data: [], total: 0 })),
    api.getStores({ category: 'ai-tools', limit: 100 }).catch(() => ({ data: [] })),
    api.getCoupons({ category: 'ai-tools', type: 'deal', limit: 12 }).catch(() => ({ data: [] })),
    api.getExclusiveDeals(16).catch(() => ({ data: [] })),
  ])

  const featuredStores = storesResponse.data || []
  const allCoupons = allCouponsResponse.data || []
  const aiStores = aiStoresResponse.data || []
  const aiDeals = aiDealsResponse.data || []
  const exclusiveDeals = exclusiveDealsResponse.data || []

  // 1. Hero Banner items: items marked featured first, or top 5 coupons/deals
  const featuredItems = allCoupons.filter((c) => c.is_featured)
  const heroBannerItems = featuredItems.length >= 3 ? featuredItems : allCoupons.slice(0, 6)

  // 2. Segregate Coupon Codes vs Deals
  const promoCodesOnly = allCoupons.filter((c) => Boolean(c.code && c.code.trim()))
  const dealsOnly = allCoupons.filter((c) => !c.code || !c.code.trim())

  // BigSavingCoupons section: prioritized promo codes, guaranteed non-empty fallback
  const bigSavingItems = promoCodesOnly.length > 0 ? promoCodesOnly : allCoupons.slice(0, 12)

  // Filter AI deals out of Trending Deals section
  const aiStoreSlugs = new Set(aiStores.map((s: any) => s.slug))
  const nonAiDealsSource = dealsOnly.length > 0 ? dealsOnly : allCoupons
  const nonAiDeals = nonAiDealsSource
    .filter((coupon) => coupon.store?.slug && !aiStoreSlugs.has(coupon.store.slug))
    .slice(0, 12)

  return (
    <IntroSplash>
      <ClientButterflyOverlay />
      <div className="space-y-12 relative z-10">
        <HomePageSchema featuredStores={featuredStores} />

        {/* Top Scrollable Billboard / Hero Banner — ALWAYS VISIBLE */}
        {heroBannerItems.length > 0 && (
          <HeroBanner coupons={heroBannerItems.slice(0, 5)} />
        )}

        {/* Big Saving Coupon Codes Section — ALWAYS VISIBLE */}
        {bigSavingItems.length > 0 && (
          <BigSavingCoupons coupons={bigSavingItems.slice(0, 12)} />
        )}

        {/* Top Stores */}
        {featuredStores.length > 0 && (
          <FeaturedStores stores={featuredStores} />
        )}

        {/* Today's Best Deals & Offers — STRICTLY DEALS */}
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

