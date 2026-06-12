import type { Metadata } from 'next'
import Link from 'next/link'
import { api } from '@/lib/api'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { Tag } from 'lucide-react'

export const revalidate = 3600 // ISR hourly

export const metadata: Metadata = {
  title: 'Browse Coupons by Category',
  description: 'Shop by category and find the best verified discount codes, coupon deals, and cashback rewards for fashion, electronics, travel & more.',
}

export default async function CategoriesPage() {
  const categories = await api.getCategories().catch(() => [])

  // Group categories alphabetically for neat listing
  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="space-y-8 bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Tag className="w-6 h-6 text-primary" /> Browse by Category
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Select a category to find coupon codes and cashback offers.
        </p>
      </div>

      {sortedCategories.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          No categories found.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Visual Grid */}
          <CategoryGrid categories={sortedCategories} />

          {/* Alphabetical List for Detail browsing */}
          <div className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">All Categories A-Z</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {sortedCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}` as any}
                  className="text-sm text-gray-600 hover:text-primary transition-colors py-1.5 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
