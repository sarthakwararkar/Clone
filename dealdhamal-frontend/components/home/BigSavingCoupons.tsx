'use client'
import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Ticket } from 'lucide-react'
import type { Coupon } from '@/types'
import { CouponModal } from '@/components/coupons/CouponModal'

interface BigSavingCouponsProps {
  coupons: Coupon[]
}

// Client-side helper to resolve accurate product images from titles/keywords
function getProductImage(title: string, storeName: string): string {
  const t = title.toLowerCase()
  const s = storeName.toLowerCase()
  
  // Tech category keywords
  if (t.includes('watch') || t.includes('wearable') || t.includes('chrono') || t.includes('fitbit') || t.includes('smartwatch')) {
    return 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80'
  }
  if (t.includes('phone') || t.includes('mobile') || t.includes('iphone') || t.includes('samsung') || t.includes('oneplus') || t.includes('pixel') || t.includes('smartphone')) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'
  }
  if (t.includes('headphone') || t.includes('earphone') || t.includes('earbuds') || t.includes('airpods') || t.includes('audio') || t.includes('soundbar') || t.includes('speaker')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
  }
  if (t.includes('mouse') || t.includes('keyboard') || t.includes('gaming') || t.includes('controller') || t.includes('joystick') || t.includes('razer')) {
    return 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80'
  }
  if (t.includes('laptop') || t.includes('macbook') || t.includes('notebook') || t.includes('computer') || t.includes('pc')) {
    return 'https://images.unsplash.com/photo-1496181130204-7552cc14ac1b?w=600&auto=format&fit=crop&q=80'
  }
  if (t.includes('camera') || t.includes('dslr') || t.includes('lens') || t.includes('gopro')) {
    return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80'
  }
  
  // Fashion keywords
  if (t.includes('shoe') || t.includes('runner') || t.includes('sneaker') || t.includes('boots') || t.includes('footwear') || s.includes('nike') || s.includes('adidas') || s.includes('puma') || s.includes('bata')) {
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80'
  }
  if (t.includes('jacket') || t.includes('coat') || t.includes('leather') || t.includes('denim')) {
    return 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80'
  }
  if (t.includes('bag') || t.includes('backpack') || t.includes('luggage') || t.includes('wallet') || t.includes('handbag')) {
    return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80'
  }
  if (t.includes('shirt') || t.includes('t-shirt') || t.includes('tee') || t.includes('apparel') || t.includes('clothing') || t.includes('dress') || t.includes('jeans')) {
    return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80'
  }

  // Home keywords
  if (t.includes('light') || t.includes('lamp') || t.includes('ambient') || t.includes('led') || t.includes('bulb')) {
    return 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80'
  }
  if (t.includes('purifier') || t.includes('humidifier') || t.includes('filter') || t.includes('ac')) {
    return 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=80'
  }
  if (t.includes('coffee') || t.includes('brew') || t.includes('espresso') || t.includes('maker') || t.includes('grinder') || t.includes('teapot')) {
    return 'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=600&auto=format&fit=crop&q=80'
  }
  
  // Gaming
  if (t.includes('vr') || t.includes('headset') || t.includes('oculus') || t.includes('quest') || t.includes('virtual')) {
    return 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&auto=format&fit=crop&q=80'
  }
  
  // Default fallback
  return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
}

export function BigSavingCoupons({ coupons }: BigSavingCouponsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const cardWidth = 320 // fixed offset for smooth scrolling
      const scrollTo = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - cardWidth 
        : scrollContainerRef.current.scrollLeft + cardWidth
      scrollContainerRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      })
    }
  }

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

      {/* Horizontal Scroll Area with 3D perspective */}
      <div
        ref={scrollContainerRef}
        className="flex gap-0 overflow-x-auto py-14 px-12 -mx-12 scrollbar-none snap-x snap-mandatory perspective-container"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {coupons.map((coupon) => {
          const isFeatured = coupon.is_featured
          
          // Formulate claimed percentage based on success_rate or dynamic fallback
          const claimedPct = coupon.success_rate || (Math.floor(parseInt(coupon.id.slice(0, 2), 16) % 30) + 60)

          const discountText = coupon.discount_value 
            ? (coupon.discount_value.includes('%') || coupon.discount_value.includes('$') || coupon.discount_value.includes('₹')
                ? coupon.discount_value 
                : `${coupon.discount_value} OFF`)
            : 'Special Offer'

          const productImage = getProductImage(coupon.title, coupon.store.name)

          const cardClass = isFeatured
            ? "w-[290px] min-w-[290px] md:w-[320px] md:min-w-[320px] snap-start glass-card glass-card-featured tilted-card tilted-card-hover tilted-card-featured-hover featured rounded-[22px] overflow-hidden flex flex-col relative shadow-purple-900/10 z-10 -mr-12 last:mr-0 group cursor-pointer"
            : "w-[260px] min-w-[260px] md:w-[280px] md:min-w-[280px] snap-start glass-card glass-card-hover tilted-card tilted-card-hover rounded-[20px] overflow-hidden flex flex-col relative z-0 -mr-12 last:mr-0 cursor-pointer group"

          return (
            <div
              key={coupon.id}
              className={cardClass}
              onClick={() => setActiveCoupon(coupon)}
            >
              {/* Card Image Header */}
              <div className="h-44 bg-neutral-100 dark:bg-white m-3 rounded-2xl relative overflow-hidden flex items-center justify-center p-3 border border-white/10 group-hover:scale-[0.98] transition-transform duration-300">
                {coupon.is_exclusive && (
                  <span className="absolute top-2.5 left-2.5 text-[9px] font-black tracking-widest text-teal-400 bg-brandDark/85 border border-teal-400/30 px-2 py-0.5 rounded shadow">
                    EXCLUSIVE
                  </span>
                )}
                {/* Product Image */}
                <img
                  src={productImage}
                  alt={coupon.title}
                  className="object-contain max-h-full max-w-full hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              {/* Card Content Body */}
              <div className="px-5 pb-5 pt-1 flex-1 flex flex-col justify-between text-white">
                <div>
                  {/* Header Discount & Icon */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg ${isFeatured ? 'bg-purple-600/20 border border-purple-500/30 text-purple-400' : 'bg-teal-500/20 border border-teal-500/30 text-teal-400'} flex items-center justify-center`}>
                        <Ticket className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-lg font-black tracking-tight ${isFeatured ? 'text-purple-400' : 'text-teal-400'}`}>
                        {discountText}
                      </span>
                    </div>
                    {/* Store Tag */}
                    <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase">
                      {coupon.store.name}
                    </span>
                  </div>

                  {/* Product Title */}
                  <h3 className="text-sm md:text-base font-extrabold text-white tracking-tight line-clamp-1 mb-1.5 group-hover:text-teal-400 transition-colors">
                    {coupon.title}
                  </h3>
                  {/* Description */}
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4 font-medium">
                    {coupon.description || 'Verified promo code for extra savings at checkout.'}
                  </p>
                </div>

                {/* Action Area / Progress Bar for Featured */}
                <div>
                  {isFeatured && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-[10px] font-extrabold text-gray-400 mb-1.5 uppercase tracking-wide">
                        <span>Claimed</span>
                        <span className="text-purple-400">{claimedPct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-teal-400 rounded-full" style={{ width: `${claimedPct}%` }}></div>
                      </div>
                    </div>
                  )}

                  {/* Wavy Separator */}
                  <div className={`my-3 opacity-30 ${isFeatured ? 'wave-divider-featured' : 'wave-divider'}`}></div>

                  {/* CTA Button */}
                  <button
                    className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs tracking-wider transition-all duration-300 uppercase shadow-md ${
                      isFeatured 
                        ? 'bg-gradient-to-r from-purple-500 to-teal-400 hover:from-purple-400 hover:to-teal-300 text-[#0B0F19] hover:shadow-purple-500/10 active:scale-98 cursor-pointer' 
                        : 'bg-white/5 hover:bg-white/10 text-white hover:text-teal-400 active:scale-98 border border-white/10 hover:border-teal-500/30 cursor-pointer'
                    }`}
                  >
                    {coupon.code ? 'Show Code' : 'Get Deal'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
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

