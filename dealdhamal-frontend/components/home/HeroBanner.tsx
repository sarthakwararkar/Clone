'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Coupon } from '@/types'
import { formatDiscount } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HeroBannerProps {
  coupons: Coupon[]
}

export function HeroBanner({ coupons }: HeroBannerProps) {
  const [current, setCurrent] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const slides = coupons.slice(0, 5)

  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const go = (idx: number) => setCurrent((idx + slides.length) % slides.length)

  useEffect(() => {
    if (!isHovered) {
      intervalRef.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isHovered, slides.length])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return
    const diff = touchStartX.current - touchEndX.current
    const swipeThreshold = 50 // Minimum swipe distance (pixels) to transition

    if (diff > swipeThreshold) {
      // Swipe left -> Show next slide
      go(current + 1)
    } else if (diff < -swipeThreshold) {
      // Swipe right -> Show previous slide
      go(current - 1)
    }

    touchStartX.current = null
    touchEndX.current = null
  }

  if (!slides.length) return null

  const slide = slides[current]

  return (
    <div
      className="relative rounded-2xl overflow-hidden h-64 md:h-80 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((s, idx) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-400"
          style={{ opacity: idx === current ? 1 : 0, zIndex: idx === current ? 1 : 0 }}
        >
          {s.store?.banner_url ? (
            <div className="absolute inset-0">
              <Image
                src={s.store.banner_url}
                alt={s.store.name}
                fill
                className="object-cover"
                priority={idx === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-orange-500" />
          )}
          <div className="relative z-10 h-full flex items-center justify-between px-4 sm:px-8 md:px-12">
            {/* Left: content */}
            <div className="flex-1 max-w-lg">
              <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                {s.store?.name}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight line-clamp-2">
                {s.title}
              </h2>
              <div className="mt-3 mb-5">
                <span className="inline-block bg-white text-primary font-bold text-lg px-4 py-1.5 rounded-lg">
                  {formatDiscount(s.discount_value)}
                </span>
              </div>
              <Link href={`/coupons/${s.id}`}>
                <button className="bg-white text-primary font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-light transition-colors shadow-md">
                  Get Deal →
                </button>
              </Link>
            </div>

            {/* Right: store logo */}
            {s.store?.logo_url && (
              <div className="hidden md:flex flex-shrink-0 ml-6">
                <div className="w-28 h-28 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden p-3">
                  <Image
                    src={s.store.logo_url}
                    alt={s.store.name}
                    width={112}
                    height={112}
                    className="object-contain w-full h-full"
                    priority={idx === 0}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Prev/Next arrows */}
      <button
        onClick={() => go(current - 1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white hidden sm:flex items-center justify-center transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => go(current + 1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white hidden sm:flex items-center justify-center transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`rounded-full transition-all ${idx === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
