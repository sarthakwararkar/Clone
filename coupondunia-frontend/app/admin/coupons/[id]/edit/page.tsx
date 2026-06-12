'use client'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { CouponForm } from '@/components/admin/CouponForm'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/api'

export default function AdminEditCouponPage() {
  const params = useParams()
  const id = params.id as string

  // Fetch the current coupon detail to edit
  const { data: coupon, isLoading: couponLoading } = useQuery({
    queryKey: ['adminCoupon', id],
    queryFn: () => api.getCoupon(id),
    enabled: !!id,
  })

  // Fetch all stores to populate the store selector dropdown
  const { data: storesResponse, isLoading: storesLoading } = useQuery({
    queryKey: ['adminAllStores'],
    queryFn: () => api.getStores({ limit: 1000 }),
  })

  if (couponLoading || storesLoading) {
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
        <h1 className="text-xl font-bold text-gray-800">Edit Coupon</h1>
        <p className="text-xs text-gray-500 mt-1">Modify coupon code, details, or store configuration.</p>
      </div>

      {coupon && storesResponse && (
        <CouponForm initialData={coupon} stores={storesResponse.data} />
      )}
    </div>
  )
}
