'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { STALE_TIMES } from '@/lib/queryClient'

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => api.search(query),
    enabled: query.length > 1,
    staleTime: STALE_TIMES.search,
  })
}
