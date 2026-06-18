'use client'
import { useCouponFilterStore } from '@/stores/useCouponFilterStore'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

const typeFilters = [
  { label: 'All', value: 'all' },
  { label: 'Codes', value: 'code' },
  { label: 'Deals', value: 'deal' },
  { label: 'Cashback', value: 'cashback' },
] as const

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Most Used', value: 'popular' },
] as const

export function CouponFilters() {
  const { type, sortBy, setType, setSortBy } = useCouponFilterStore()
  const activeCount = (type !== 'all' ? 1 : 0) + (sortBy !== 'featured' ? 1 : 0)

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
      {/* Type pills */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {typeFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setType(f.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
              type === f.value
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

      {/* Sort dropdown */}
      <div className="relative flex-shrink-0">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'featured' | 'newest' | 'popular')}
          className="appearance-none pl-3 pr-8 py-1.5 rounded-full text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      </div>

      {/* Mobile active filter count badge */}
      {activeCount > 0 && (
        <span className="md:hidden bg-primary text-white text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0">
          {activeCount} Filter{activeCount > 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}
