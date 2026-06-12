'use client'
import { useQuery } from '@tanstack/react-query'
import { StoreForm } from '@/components/admin/StoreForm'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/api'

export default function AdminNewStorePage() {
  // Fetch categories to populate store category selection dropdown
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: () => api.getCategories(),
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
        <h1 className="text-xl font-bold text-gray-800">Add New Store</h1>
        <p className="text-xs text-gray-500 mt-1">Create an online merchant brand with details and cashback rate.</p>
      </div>

      <StoreForm categories={categories} />
    </div>
  )
}
