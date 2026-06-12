'use client'
import { useQuery } from '@tanstack/react-query'
import { StatsCards } from '@/components/admin/StatsCards'
import { CouponTable } from '@/components/admin/CouponTable'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/api'

export function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => api.adminGetStats(),
  })

  const { data: couponsResponse, isLoading: couponsLoading } = useQuery({
    queryKey: ['adminCoupons', { page: 1, limit: 10 }],
    queryFn: () => api.adminGetCoupons({ page: 1, limit: 10 }),
  })

  if (statsLoading || couponsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-800 mb-1">Dashboard</h1>
        <p className="text-xs text-gray-500">Overview of CouponDunia platform performance.</p>
      </div>

      {stats && <StatsCards stats={stats} />}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Recent Coupons</h2>
        </div>
        
        {couponsResponse && (
          <CouponTable
            coupons={couponsResponse.data}
            total={couponsResponse.total}
            page={1}
            limit={10}
            onPageChange={() => {}}
          />
        )}
      </div>
    </div>
  )
}
