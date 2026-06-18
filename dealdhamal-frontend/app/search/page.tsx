import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SearchPageContent } from './SearchPageContent'
import { Skeleton } from '@/components/ui/Skeleton'

export const metadata: Metadata = {
  title: 'Search Coupons & Deals | DealDhamal',
  robots: { index: false, follow: false },
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Skeleton Search Bar */}
          <div className="relative">
            <Skeleton className="h-12 w-full rounded-full animate-pulse" />
          </div>
          {/* Skeleton Result Items */}
          <div className="space-y-4 pt-6">
            <Skeleton className="h-6 w-32 animate-pulse" />
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}
