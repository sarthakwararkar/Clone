'use client'
import { Bookmark } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSavedCoupons } from '@/hooks/useSavedCoupons'
import { CouponList } from '@/components/coupons/CouponList'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

export default function SavedCouponsPage() {
  const router = useRouter()
  const { savedCoupons, isLoading } = useSavedCoupons()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="border-b border-gray-100 pb-4">
          <h1 className="text-xl font-bold text-gray-800">Saved Coupons</h1>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Saved Coupons</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your bookmarked collection of active discount codes and shopping deals.
        </p>
      </div>

      {savedCoupons.length === 0 ? (
        <div className="py-8">
          <EmptyState
            icon={Bookmark}
            title="No Saved Coupons Yet"
            description="You haven't saved any coupons. Browse today's trending deals to find and bookmark your favorites."
            actionLabel="Browse Deals"
            onAction={() => router.push('/' as any)}
          />
        </div>
      ) : (
        <CouponList coupons={savedCoupons} />
      )}
    </div>
  )
}
