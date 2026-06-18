'use client'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { StoreForm } from '@/components/admin/StoreForm'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/api'

export default function AdminEditStorePage() {
  const params = useParams()
  const slug = params.slug as string

  // Fetch store details by slug
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['adminStore', slug],
    queryFn: () => api.getStore(slug),
    enabled: !!slug,
  })

  // Fetch categories to populate the category selection dropdown
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: () => api.getCategories(),
  })

  if (storeLoading || categoriesLoading) {
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
        <h1 className="text-xl font-bold text-gray-800">Edit Store</h1>
        <p className="text-xs text-gray-500 mt-1">Modify online store merchant details, URLs, or cashback rates.</p>
      </div>

      {store && (
        <StoreForm initialData={store.store} categories={categories} />
      )}
    </div>
  )
}
