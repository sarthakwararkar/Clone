'use client'
import { useQuery } from '@tanstack/react-query'
import { CouponForm } from '@/components/admin/CouponForm'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/api'

export default function AdminNewCouponPage() {
  // Fetch all stores to populate the searchable store select input
  const { data: storesResponse, isLoading } = useQuery({
    queryKey: ['adminAllStores'],
    queryFn: () => api.getStores({ limit: 1000 }),
  })

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-96 w-full rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4 max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-gray-800">Add New Coupon</h1>
        <p className="text-xs text-gray-500 mt-1">Publish a shopping coupon code, deal, or cashback offer.</p>
      </div>

      {storesResponse && (
        <CouponForm stores={storesResponse.data} />
      )}
    </div>
  )
}
