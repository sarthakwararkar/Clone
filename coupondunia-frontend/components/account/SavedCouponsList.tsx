'use client'

import { Bookmark } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSavedCoupons } from '@/hooks/useSavedCoupons'
import { CouponList } from '@/components/coupons/CouponList'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

export function SavedCouponsList() {
  const router = useRouter()
  const { savedCoupons, isLoading } = useSavedCoupons()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (savedCoupons.length === 0) {
    return (
      <div className="py-8">
        <EmptyState
          icon={Bookmark}
          title="No Saved Coupons Yet"
          description="You haven't saved any coupons. Browse today's trending deals to find and bookmark your favorites."
          actionLabel="Browse Deals"
          onAction={() => router.push('/' as any)}
        />
      </div>
    )
  }

  return <CouponList coupons={savedCoupons} />
}
