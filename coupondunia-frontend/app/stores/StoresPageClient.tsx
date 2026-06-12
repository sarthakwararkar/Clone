'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Store, Category } from '@/types'
import { StoreGrid } from '@/components/stores/StoreGrid'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import { Grid } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoresPageClientProps {
  categories: Category[]
  initialStores: Store[]
  totalStores: number
  page: number
  category?: string
}

export function StoresPageClient({
  categories,
  initialStores,
  totalStores,
  page,
  category,
}: StoresPageClientProps) {
  const router = useRouter()
  const limit = 24
  const totalPages = Math.ceil(totalStores / limit)

  const handleCategoryChange = (slug?: string) => {
    const query = new URLSearchParams()
    if (slug) query.set('category', slug)
    query.set('page', '1')
    router.push(`/stores?${query.toString()}` as any)
  }

  const handlePageChange = (newPage: number) => {
    const query = new URLSearchParams()
    if (category) query.set('category', category)
    query.set('page', String(newPage))
    router.push(`/stores?${query.toString()}` as any)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">All Stores</h1>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-100 no-scrollbar">
        <button
          onClick={() => handleCategoryChange(undefined)}
          className={cn(
            'px-4 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors',
            !category
              ? 'bg-primary text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          )}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.slug)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors',
              category === cat.slug
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Stores list */}
      {initialStores.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={Grid}
            title="No Stores Found"
            description="There are currently no stores listed in this category."
            actionLabel="View All Stores"
            onAction={() => handleCategoryChange(undefined)}
          />
        </div>
      ) : (
        <div className="space-y-8">
          <StoreGrid stores={initialStores} />
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}
