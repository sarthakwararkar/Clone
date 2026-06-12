'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { STALE_TIMES } from '@/lib/queryClient'

interface UseCouponsParams {
  store?: string
  category?: string
  type?: string
  featured?: boolean
  page?: number
  limit?: number
}

export function useCoupons(params: UseCouponsParams = {}) {
  return useQuery({
    queryKey: ['coupons', params],
    queryFn: () => api.getCoupons(params),
    staleTime: STALE_TIMES.coupons,
  })
}
