import { QueryClient } from '@tanstack/react-query'

const ONE_HOUR = 60 * 60 * 1000
const THIRTY_MIN = 30 * 60 * 1000
const TEN_MIN = 10 * 60 * 1000
const FIVE_MIN = 5 * 60 * 1000

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: TEN_MIN,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient()
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

export const STALE_TIMES = {
  categories: ONE_HOUR,
  stores: THIRTY_MIN,
  coupons: TEN_MIN,
  search: FIVE_MIN,
}
