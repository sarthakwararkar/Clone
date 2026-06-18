'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { SearchResults } from '@/components/search/SearchResults'

export function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryParam = searchParams.get('q') ?? ''
  
  const [inputVal, setInputVal] = useState(queryParam)

  // Sync state if queryParam updates from header or external search
  useEffect(() => {
    setInputVal(queryParam)
  }, [queryParam])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputVal.trim()) {
      router.push(`/search?q=${encodeURIComponent(inputVal.trim())}` as any)
    }
  }

  const handleClear = () => {
    setInputVal('')
    router.push('/search' as any)
  }

  return (
    <div className="space-y-8">
      {/* Search Input Container */}
      <form onSubmit={handleSearchSubmit} className="relative w-full max-w-2xl mx-auto">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Search for stores, brands, or coupon codes..."
          className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-full text-base font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        {inputVal && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Results Rendering */}
      {queryParam.trim().length > 1 ? (
        <SearchResults query={queryParam.trim()} />
      ) : (
        <div className="text-center py-16 text-gray-400 font-medium bg-white rounded-2xl border border-gray-100 shadow-sm max-w-2xl mx-auto px-4">
          <Search className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <p className="text-sm">Type 2 or more characters to start searching for discounts</p>
        </div>
      )}
    </div>
  )
}
