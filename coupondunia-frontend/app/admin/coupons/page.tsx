'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CouponTable } from '@/components/admin/CouponTable'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/api'

export default function AdminCouponsPage() {
  const [page, setPage] = useState(1)
  const limit = 20

  const { data: response, isLoading } = useQuery({
    queryKey: ['adminCoupons', { page, limit }],
    queryFn: () => api.adminGetCoupons({ page, limit }),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Manage Coupons</h1>
          <p className="text-xs text-gray-500">Create, edit, or delete platform shopping coupons.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      ) : (
        response && (
          <CouponTable
            coupons={response.data}
            total={response.total}
            page={page}
            limit={limit}
            onPageChange={setPage}
          />
        )
      )}
    </div>
  )
}
