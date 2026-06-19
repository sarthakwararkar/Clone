'use client'
import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Coupon } from '@/types'
import { CouponModal } from '@/components/coupons/CouponModal'

interface BigSavingCouponsProps {
  coupons: Coupon[]
}

export function BigSavingCoupons({ coupons }: BigSavingCouponsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75
      scrollContainerRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
          Big Saving Coupon Codes
        </h2>
        
        {/* Navigation Arrows */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full border border-gray-250 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-primary transition-all shadow-sm cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full border border-gray-255 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-primary transition-all shadow-sm cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Area */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {coupons.map((coupon) => {
          const cashbackText = coupon.store.cashback_rate 
            ? `${coupon.store.cashback_rate.includes('Up to') ? 'Upto' : 'Flat'} ${coupon.store.cashback_rate.replace('Up to ', '')} Cashback`
            : 'Flat 6.1% Cashback';

          return (
            <div
              key={coupon.id}
              className="w-[270px] min-w-[270px] snap-start bg-white border border-gray-150 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group"
            >
              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Top Store Info */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-[80px] h-[36px] bg-white border border-gray-100 rounded-lg flex items-center justify-center p-1.5 flex-shrink-0">
                      {coupon.store.logo_url ? (
                        <Image
                          src={coupon.store.logo_url}
                          alt={coupon.store.name}
                          width={72}
                          height={28}
                          className="object-contain w-full h-full"
                          unoptimized
                        />
                      ) : (
                        <span className="text-gray-400 font-bold text-[10px]">
                          {coupon.store.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-gray-500 truncate max-w-[150px]">
                      {coupon.store.name}
                    </span>
                  </div>

                  {/* Coupon Title */}
                  <Link href={`/coupons/${coupon.id}`}>
                    <h3 className="text-[14px] font-extrabold text-gray-900 mt-4.5 line-clamp-2 leading-snug group-hover:text-primary transition-colors min-h-[40px]">
                      {coupon.title}
                    </h3>
                  </Link>
                </div>

                {/* Cashback pill */}
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-50">
                  <span className="w-4.5 h-4.5 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
                    </svg>
                  </span>
                  <span className="text-[11px] font-black text-[#008c48]">
                    {cashbackText}
                  </span>
                </div>
              </div>

              {/* Scalloped Wavy Edge Separator */}
              <div 
                className="h-2 w-full relative overflow-hidden" 
                style={{ 
                  backgroundImage: 'radial-gradient(circle at 6px 0px, transparent 4.5px, #E84141 5px)', 
                  backgroundSize: '12px 100%' 
                }}
              />

              {/* Show Coupon Action Button */}
              <button
                onClick={() => setActiveCoupon(coupon)}
                className="bg-primary hover:bg-[#C62F2F] text-white font-extrabold text-[13px] py-3.5 text-center transition-colors rounded-b-2xl w-full cursor-pointer"
              >
                Show Coupon
              </button>
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
