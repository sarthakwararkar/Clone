'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { STALE_TIMES } from '@/lib/queryClient'

interface UseStoresParams {
  category?: string
  featured?: boolean
  page?: number
  limit?: number
}

export function useStores(params: UseStoresParams = {}) {
  return useQuery({
    queryKey: ['stores', params],
    queryFn: () => api.getStores(params),
    staleTime: STALE_TIMES.stores,
  })
}
