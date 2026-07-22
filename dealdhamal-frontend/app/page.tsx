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
  // - featuredCodesResponse: only coupon codes for BigSavingCoupons section
  // - dealsResponse: only deals for TrendingCoupons section
  // - heroResponse: featured items of any type for the hero banner (fallback if no codes)
  const [
    categories,
    storesResponse,
    featuredCodesResponse,
    dealsResponse,
    heroFeaturedResponse,
    aiStoresResponse,
    aiDealsResponse,
    exclusiveDealsResponse,
  ] = await Promise.all([
    api.getCategories().catch(() => []),
    api.getStores({ sort: 'most_deals', limit: 12 }).catch(() => ({ data: [], total: 0 })),
    // BigSavingCoupons: coupon codes only
    api.getCoupons({ type: 'code', sort: 'smart', diverse: true, limit: 12 }).catch(() => ({ data: [], total: 0 })),
    // TrendingCoupons: deals only (no codes mixed in)
    api.getCoupons({ type: 'deal', sort: 'smart', diverse: true, limit: 40 }).catch(() => ({ data: [], total: 0 })),
    // Hero banner: any featured item (codes or deals) — ensures it never goes empty
    api.getCoupons({ featured: true, sort: 'smart', diverse: true, limit: 5 }).catch(() => ({ data: [], total: 0 })),
    api.getStores({ category: 'ai-tools', limit: 100 }).catch(() => ({ data: [] })),
    api.getCoupons({ category: 'ai-tools', type: 'deal', limit: 12 }).catch(() => ({ data: [] })),
    api.getExclusiveDeals(16).catch(() => ({ data: [] })),
  ])

  const featuredStores = storesResponse.data
  const featuredCoupons = featuredCodesResponse.data   // coupon codes for BigSavingCoupons
  const bestDeals = dealsResponse.data                 // deals for TrendingCoupons
  const heroItems = heroFeaturedResponse.data          // any featured item for HeroBanner
  const aiStores = aiStoresResponse.data
  const aiDeals = aiDealsResponse.data
  const exclusiveDeals = exclusiveDealsResponse.data

  const aiStoreSlugs = new Set(aiStores.map((s: any) => s.slug))
  const nonAiDeals = bestDeals
    .filter((coupon) => !aiStoreSlugs.has(coupon.store.slug))
    .slice(0, 12)

  // Hero banner: use any featured items; if none, fall back to codes, then deals
  const heroBannerItems = heroItems.length > 0
    ? heroItems
    : featuredCoupons.length > 0
      ? featuredCoupons
      : nonAiDeals

  return (
    <IntroSplash>
      <ClientButterflyOverlay />
      <div className="space-y-12 relative z-10">
        <HomePageSchema featuredStores={featuredStores} />
        {/* Hero banner carousel — shows any featured coupons or deals */}
        {heroBannerItems.length > 0 && (
          <HeroBanner coupons={heroBannerItems.slice(0, 5)} />
        )}

        {/* Big Saving Coupon Codes — coupon codes only, clearly segregated */}
        {featuredCoupons.length > 0 && (
          <BigSavingCoupons coupons={featuredCoupons} />
        )}

        {/* Top Stores */}
        {featuredStores.length > 0 && (
          <FeaturedStores stores={featuredStores} />
        )}

        {/* Today's Best Deals — deals & offers only, no coupon codes mixed in */}
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
