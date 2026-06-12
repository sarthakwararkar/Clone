'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { StoreTable } from '@/components/admin/StoreTable'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/api'

export default function AdminStoresPage() {
  const [page, setPage] = useState(1)
  const limit = 20

  const { data: response, isLoading } = useQuery({
    queryKey: ['adminStores', { page, limit }],
    queryFn: () => api.getStores({ page, limit }),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Manage Stores</h1>
          <p className="text-xs text-gray-500">Create or edit platform merchants and online stores.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl animate-pulse" />
        </div>
      ) : (
        response && (
          <StoreTable
            stores={response.data}
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
