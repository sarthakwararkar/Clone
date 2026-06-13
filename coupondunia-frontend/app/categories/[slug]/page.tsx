import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { api } from '@/lib/api'
import { StoreGrid } from '@/components/stores/StoreGrid'
import { CategoryCouponsList } from './CategoryCouponsList'

export const revalidate = 3600 // ISR hourly

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const p = await params
  try {
    const categories = await api.getCategories()
    const category = categories.find((c) => c.slug === p.slug)
    if (!category) throw new Error('Category not found')
    
    return {
      title: `${category.name} Coupons & Promo Codes | DealDhamal`,
      description: `Get verified coupon codes, promo offers, and cashback deals for stores in the ${category.name} category. Save more today!`,
    }
  } catch {
    return {
      title: 'Category Coupons & Deals',
      description: 'Browse top category coupons and deals.',
    }
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const p = await params
  
  // Get category details by looking up the slug in the category list
  const categories = await api.getCategories().catch(() => [])
  const category = categories.find((c) => c.slug === p.slug)

  if (!category) {
    notFound()
  }

  // Fetch stores and coupons for this category in parallel
  const [storesResponse, couponsResponse] = await Promise.all([
    api.getStores({ category: p.slug, limit: 8 }).catch(() => ({ data: [] })),
    api.getCoupons({ category: p.slug, limit: 100 }).catch(() => ({ data: [] })),
  ])

  const categoryStores = storesResponse.data
  const categoryCoupons = couponsResponse.data

  return (
    <div className="space-y-10">
      {/* Category Heading */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          {category.name} Coupons &amp; Deals
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse top stores and verified offers under {category.name.toLowerCase()} category.
        </p>
      </div>

      {/* Featured Stores under this category */}
      {categoryStores.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">
            Top Stores in {category.name}
          </h2>
          <StoreGrid stores={categoryStores} />
        </div>
      )}

      {/* Coupons listing section */}
      <CategoryCouponsList initialCoupons={categoryCoupons} />
    </div>
  )
}
