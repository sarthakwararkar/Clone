'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { STALE_TIMES } from '@/lib/queryClient'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
    staleTime: STALE_TIMES.categories,
  })
}
