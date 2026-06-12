'use client'
import { useRef, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useSearchStore } from '@/stores/useSearchStore'
import { SearchDropdown } from './SearchDropdown'

export function SearchBar() {
  const { query, isDropdownOpen, setQuery, openDropdown, closeDropdown } = useSearchStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Close dropdown on route change
  useEffect(() => {
    closeDropdown()
  }, [pathname, closeDropdown])

  // Click outside handler
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [closeDropdown])

  const handleChange = useCallback(
    (value: string) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setQuery(value)
        if (value.length > 1) openDropdown()
        else closeDropdown()
      }, 350)
    },
    [setQuery, openDropdown, closeDropdown]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputRef.current?.value) {
      closeDropdown()
      router.push(`/search?q=${encodeURIComponent(inputRef.current.value)}`)
    }
    if (e.key === 'Escape') closeDropdown()
  }

  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = ''
    setQuery('')
    closeDropdown()
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Search coupons, stores..."
          defaultValue={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (query.length > 1) openDropdown() }}
          className="w-full pl-9 pr-9 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          aria-label="Search"
          autoComplete="off"
        />
        {query.length > 0 && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isDropdownOpen && <SearchDropdown query={query} />}
    </div>
  )
}
