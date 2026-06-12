import { create } from 'zustand'

type CouponType = 'all' | 'code' | 'deal' | 'cashback'
type SortBy = 'featured' | 'newest' | 'popular'

interface CouponFilterState {
  type: CouponType
  sortBy: SortBy
  setType: (type: CouponType) => void
  setSortBy: (sortBy: SortBy) => void
  reset: () => void
}

export const useCouponFilterStore = create<CouponFilterState>((set) => ({
  type: 'all',
  sortBy: 'featured',
  setType: (type) => set({ type }),
  setSortBy: (sortBy) => set({ sortBy }),
  reset: () => set({ type: 'all', sortBy: 'featured' }),
}))
