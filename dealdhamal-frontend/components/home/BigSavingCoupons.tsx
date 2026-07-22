'use client'
import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Ticket } from 'lucide-react'
import type { Coupon } from '@/types'
import { CouponModal } from '@/components/coupons/CouponModal'

interface BigSavingCouponsProps {
  coupons: Coupon[]
}

// Helper to sanitize potentially corrupted store logo URLs (like Wikipedia SVG for Ajio)
function sanitizeLogoUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.includes('AJIO_Logo.svg') || url.toLowerCase().includes('ajio')) {
    return '/ajio-logo.svg'
  }
  return url
}

interface BigSavingCouponCardProps {
  coupon: Coupon
  onSelect: (coupon: Coupon) => void
}

function BigSavingCouponCard({ coupon, onSelect }: BigSavingCouponCardProps) {
  const [logoError, setLogoError] = useState(false)
  const [bannerError, setBannerError] = useState(false)
  const isFeatured = coupon.is_featured

  const discountText = coupon.discount_value 
    ? (coupon.discount_value.includes('%') || coupon.discount_value.includes('$') || coupon.discount_value.includes('₹')
        ? coupon.discount_value 
        : `${coupon.discount_value} OFF`)
    : 'Special Offer'

  // Use real affiliate images only — banner_url (from Admitad/vCommission creative) takes priority,
  // then logo_url (store brand logo from affiliate network). No generic stock photos.
  const logoUrl = sanitizeLogoUrl(coupon.store.logo_url)
  const bannerUrl = coupon.store.banner_url
  const initials = coupon.store.name.slice(0, 2).toUpperCase()
  const hasRealBanner = !!bannerUrl && !bannerError
  const hasRealLogo = !!logoUrl && !logoError

  // Bigger card sizes and slightly reduced negative margin overlap to show larger details clearly
  const cardClass = isFeatured
    ? "w-[350px] min-w-[350px] md:w-[380px] md:min-w-[380px] glass-card glass-card-featured tilted-card tilted-card-hover tilted-card-featured-hover featured rounded-[24px] overflow-hidden flex flex-col relative shadow-purple-900/10 z-10 -mr-4 last:mr-0 group cursor-pointer animate-[fade-in_0.3s_ease-out]"
    : "w-[310px] min-w-[310px] md:w-[340px] md:min-w-[340px] glass-card glass-card-hover tilted-card tilted-card-hover rounded-[22px] overflow-hidden flex flex-col relative z-0 -mr-4 last:mr-0 cursor-pointer group animate-[fade-in_0.2s_ease-out]"

  return (
    <div
      className={cardClass}
      onClick={() => onSelect(coupon)}
    >
      {/* Card Image Header — real affiliate banner or store logo, no stock photos */}
      <div className="h-48 bg-neutral-100 dark:bg-white m-3 rounded-2xl relative overflow-hidden flex items-center justify-center p-3 border border-white/10 group-hover:scale-[0.98] transition-transform duration-300">
        {coupon.is_exclusive ? (
          <span className="absolute top-3 left-3 text-[9px] font-black tracking-widest text-teal-400 bg-brandDark/85 border border-teal-400/30 px-2 py-0.5 rounded shadow z-10">
            EXCLUSIVE
          </span>
        ) : (
          <span className={`absolute top-3 left-3 text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded shadow z-10 ${
            coupon.code && coupon.code.trim()
              ? 'text-cyan-300 bg-slate-900/90 border border-cyan-400/30'
              : 'text-emerald-300 bg-slate-900/90 border border-emerald-400/30'
          }`}>
            {coupon.code && coupon.code.trim() ? 'COUPON CODE' : 'DEAL OFFER'}
          </span>
        )}

        {hasRealBanner ? (
          /* Real affiliate banner creative (e.g. from Admitad) */
          <>
            <img
              src={bannerUrl!}
              alt={coupon.store.name}
              className="object-contain max-h-full max-w-full hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={() => setBannerError(true)}
            />
            {/* Store logo overlay in top-right corner */}
            {hasRealLogo && (
              <div className="absolute top-3 right-3 w-20 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center p-1.5 shadow-md z-10">
                <img
                  src={logoUrl!}
                  alt={coupon.store.name}
                  className="object-contain max-h-full max-w-full"
                  loading="lazy"
                  onError={() => setLogoError(true)}
                />
              </div>
            )}
          </>
        ) : hasRealLogo ? (
          /* Real affiliate store logo (from vCommission / Cuelinks / Admitad) */
          <img
            src={logoUrl!}
            alt={coupon.store.name}
            className="object-contain max-h-[75%] max-w-[85%] hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={() => setLogoError(true)}
          />
        ) : (
          /* Branded initials fallback — honest, no misleading stock photos */
          <div className="w-full h-full flex items-center justify-center">
            <span className={`text-5xl font-black tracking-tighter uppercase select-none ${isFeatured ? 'text-purple-400/60' : 'text-teal-400/60'}`}>
              {initials}
            </span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="px-5 pb-5 pt-1 flex-1 flex flex-col justify-between text-white">
        <div>
          {/* Header Discount & Icon */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-6.5 h-6.5 rounded-lg ${isFeatured ? 'bg-purple-600/20 border border-purple-500/30 text-purple-400' : 'bg-teal-500/20 border border-teal-500/30 text-teal-400'} flex items-center justify-center`}>
                <Ticket className="w-4 h-4" />
              </div>
              <span className={`text-lg font-black tracking-tight ${isFeatured ? 'text-purple-400' : 'text-teal-400'}`}>
                {discountText}
              </span>
            </div>
            {/* Store Logo Tag Inline - made larger pill layout for clear visibility */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1">
              {logoUrl && !logoError && (
                <div className="w-9 h-5.5 bg-white rounded flex items-center justify-center p-0.5 overflow-hidden">
                  <img
                    src={logoUrl}
                    alt={coupon.store.name}
                    className="object-contain w-full h-full"
                    onError={() => setLogoError(true)}
                  />
                </div>
              )}
              <span className="text-[11px] font-black text-gray-300 tracking-wider uppercase truncate max-w-[90px]">
                {coupon.store.name}
              </span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="text-sm md:text-base font-extrabold text-white tracking-tight line-clamp-1 mb-1.5 group-hover:text-cyan-400 transition-colors">
            {coupon.title}
          </h3>
          {/* Description */}
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4 font-medium">
            {coupon.description || 'Verified promo code for extra savings at checkout.'}
          </p>
        </div>

        {/* Action Area / Real Claims Data */}
        <div>
          <div className="mb-4 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider">
            <span className="text-gray-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              VERIFIED
            </span>
            {coupon.used_count > 0 && (
              <span className="text-cyan-400">{coupon.used_count} Claims Today</span>
            )}
          </div>

          {/* Wavy Separator */}
          <div className={`my-3 opacity-30 ${isFeatured ? 'wave-divider-featured' : 'wave-divider'}`}></div>

          {/* CTA Button - Solid Cyan color style */}
          <button
            className="w-full py-3 px-4 rounded-xl font-extrabold text-xs tracking-wider transition-all duration-300 uppercase shadow-md bg-cyan-400 hover:bg-cyan-300 text-[#0B0F19] hover:shadow-cyan-400/20 active:scale-95 cursor-pointer"
          >
            {coupon.code ? 'Show Code' : 'Get Deal'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function BigSavingCoupons({ coupons }: BigSavingCouponsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const cardWidth = 360 // adjusted scroll distance for larger card sizes
      const scrollTo = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - cardWidth 
        : scrollContainerRef.current.scrollLeft + cardWidth
      scrollContainerRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      })
    }
  }

  // Translate vertical wheel scroll to horizontal scrolling
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      // Only horizontal scroll if container has horizontal scroll content
      if (container.scrollWidth > container.clientWidth) {
        if (e.deltaY !== 0) {
          e.preventDefault()
          // Smooth increment scroll position directly
          container.scrollLeft += e.deltaY * 1.2
        }
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return (
    <section className="relative bg-[#0B0F19] text-white rounded-[28px] p-6 md:p-10 shadow-2xl border border-white/5 overflow-hidden">
      {/* Grid overlay background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      {/* Glowing colored radial gradients */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-teal-500/5 rounded-full blur-[90px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Big Saving Coupon Codes</span>
            <span className="text-[9px] font-bold tracking-widest text-teal-400 border border-teal-400/30 px-1.5 py-0.5 rounded bg-teal-950/30 uppercase">PRO</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Exclusive, high-end discounts. Grab them before they expire.
          </p>
        </div>
        
        {/* Navigation Arrows */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-teal-400 transition-all shadow-sm cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-teal-400 transition-all shadow-sm cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Area with 3D perspective. Removed scroll snapping to allow smooth mouse wheel scroll */}
      <div
        ref={scrollContainerRef}
        className="flex gap-0 overflow-x-auto py-14 px-12 -mx-12 scrollbar-none perspective-container"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {coupons.map((coupon) => (
          <BigSavingCouponCard
            key={coupon.id}
            coupon={coupon}
            onSelect={setActiveCoupon}
          />
        ))}
      </div>

      {/* Detail Modal */}
      {activeCoupon && (
        <CouponModal
          coupon={activeCoupon}
          isOpen={!!activeCoupon}
          onClose={() => setActiveCoupon(null)}
        />
      )}
    </section>
  )
}
