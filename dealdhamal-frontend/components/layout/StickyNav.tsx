'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Top Offers', id: 'hero-banner' },
  { label: 'Categories', id: 'categories' },
  { label: 'Coupons', id: 'coupons' },
  { label: 'Stores', id: 'stores' },
  { label: 'Deals', id: 'deals' },
  { label: 'AI Deals', id: 'ai-deals' },
]

export function StickyNav() {
  const [activeId, setActiveId] = useState<string>('')
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Set sticky state when scrolling past the header (approx 64px)
      setIsSticky(window.scrollY > 64)

      // Determine active section based on scroll position
      let current = ''
      for (const item of navItems) {
        const element = document.getElementById(item.id)
        if (element) {
          const rect = element.getBoundingClientRect()
          // If the top of the element is near the top of the viewport
          if (rect.top <= 120 && rect.bottom > 120) {
            current = item.id
            break
          }
        }
      }
      if (current) setActiveId(current)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToId = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100 // offset for sticky header + nav
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <div
      className={cn(
        "w-full z-30 transition-all duration-300 border-b border-gray-100 bg-white/80 backdrop-blur-md hidden sm:block",
        isSticky ? "fixed top-16 left-0 right-0 shadow-sm" : "relative"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-6 overflow-x-auto no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToId(item.id)}
            className={cn(
              "whitespace-nowrap text-sm font-medium transition-colors hover:text-primary relative py-3",
              activeId === item.id ? "text-primary" : "text-gray-600"
            )}
          >
            {item.label}
            {activeId === item.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
