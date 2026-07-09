'use client'
import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Coupon } from '@/types'
import { PremiumDealCard } from '@/components/coupons/PremiumDealCard'
import { cn } from '@/lib/utils'

interface TopDealsCarouselProps {
  coupons: Coupon[]
  isAi?: boolean
}

export function TopDealsCarousel({ coupons, isAi }: TopDealsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const checkScrollLimits = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setShowLeftArrow(scrollLeft > 5)
    // 5px tolerance buffer
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5)
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    checkScrollLimits()
    container.addEventListener('scroll', checkScrollLimits)
    window.addEventListener('resize', checkScrollLimits)

    return () => {
      container.removeEventListener('scroll', checkScrollLimits)
      window.removeEventListener('resize', checkScrollLimits)
    }
  }, [coupons])

  const scrollBy = (offset: number) => {
    const container = scrollContainerRef.current
    if (!container) return
    container.scrollBy({ left: offset, behavior: 'smooth' })
  }

  return (
    <div className="relative group/carousel w-full">
      {/* Left Chevron Slide Button */}
      <button
        onClick={() => scrollBy(-320)}
        className={cn(
          "absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md border border-gray-100 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 md:opacity-0 md:group-hover/carousel:opacity-100 disabled:opacity-0 disabled:pointer-events-none cursor-pointer",
          !showLeftArrow && "opacity-0 pointer-events-none"
        )}
        aria-label="Scroll left"
        disabled={!showLeftArrow}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Slider Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-4 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {coupons.map((coupon) => (
          <PremiumDealCard key={coupon.id} coupon={coupon} isAi={isAi} />
        ))}
      </div>

      {/* Right Chevron Slide Button */}
      <button
        onClick={() => scrollBy(320)}
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md border border-gray-100 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 md:opacity-0 md:group-hover/carousel:opacity-100 disabled:opacity-0 disabled:pointer-events-none cursor-pointer",
          !showRightArrow && "opacity-0 pointer-events-none"
        )}
        aria-label="Scroll right"
        disabled={!showRightArrow}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
