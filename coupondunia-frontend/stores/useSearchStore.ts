import { create } from 'zustand'

interface SearchState {
  query: string
  isDropdownOpen: boolean
  setQuery: (query: string) => void
  openDropdown: () => void
  closeDropdown: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  isDropdownOpen: false,
  setQuery: (query) => set({ query }),
  openDropdown: () => set({ isDropdownOpen: true }),
  closeDropdown: () => set({ isDropdownOpen: false }),
}))
