import type { Metadata } from 'next'
import { api } from '@/lib/api'
import { StoreGrid } from '@/components/stores/StoreGrid'
import { CategoryCouponsList } from '@/app/categories/[slug]/CategoryCouponsList'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Sparkles } from 'lucide-react'

export const revalidate = 600 // Cache for 10 minutes

export const metadata: Metadata = {
  title: 'Evergreen AI Tools & SaaS Deals | DealDhamal',
  description: 'Explore the best free trials, promo codes, and evergreen deals on AI products. Find offers for ChatGPT, Midjourney, Jasper AI, Copy.ai and more.',
  keywords: ['ai deals', 'chatgpt coupons', 'midjourney free trial', 'ai tools discount', 'saas offers'],
  alternates: { canonical: 'https://www.dealdhamal.in/ai' },
}

export default async function AiDealsPage() {
  const aiSlug = 'ai-tools'

  // Fetch categories, stores, and coupons in parallel to prevent waterfalls
  const [categories, storesResponse, couponsResponse] = await Promise.all([
    api.getCategories().catch(() => []),
    api.getStores({ category: aiSlug, limit: 12 }).catch(() => ({ data: [] })),
    api.getCoupons({ category: aiSlug, limit: 100 }).catch(() => ({ data: [] })),
  ])

  const category = categories.find((c) => c.slug === aiSlug)
  const aiStores = storesResponse.data
  const aiCoupons = couponsResponse.data

  return (
    <div className="space-y-10">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'AI Deals' },
        ]}
      />

      {/* Hero Header with sleek modern AI theme gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 md:p-12 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -ml-16 -mb-16 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold tracking-wide uppercase backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            Artificial Intelligence
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Evergreen AI Tools &amp; SaaS Deals
          </h1>
          <p className="text-sm md:text-base text-indigo-100 max-w-xl font-medium">
            Explore verified coupons, promo codes, and exclusive free trials for top-tier AI products. Save on writing, designing, coding, and productivity assistants.
          </p>
        </div>
      </div>

      {/* Featured AI Stores */}
      {aiStores.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Top AI Product Stores
          </h2>
          <StoreGrid stores={aiStores} />
        </div>
      )}

      {/* Coupons listing section */}
      <div className="space-y-4">
        <CategoryCouponsList initialCoupons={aiCoupons} />
      </div>
    </div>
  )
}
