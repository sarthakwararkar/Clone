import Link from 'next/link'
import type { Category } from '@/types'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { Grid3X3 } from 'lucide-react'

interface PopularCategoriesProps {
  categories: Category[]
}

export function PopularCategories({ categories }: PopularCategoriesProps) {
  if (!categories || categories.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">Popular Categories</h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-700 border border-blue-200 shadow-sm">
            <Grid3X3 className="w-3.5 h-3.5 text-blue-600" />
            Browse
          </span>
        </div>
        <Link
          href="/categories"
          className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          View All →
        </Link>
      </div>
      <CategoryGrid categories={categories} />
    </section>
  )
}
