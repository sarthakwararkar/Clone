'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Bookmark, Share2, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Coupon } from '@/types'
import { getDealTheme } from '@/lib/dealImages'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSavedCoupons } from '@/hooks/useSavedCoupons'
import { cn } from '@/lib/utils'
import { LoginPromptModal } from '@/components/auth/LoginPromptModal'
import { ShareModal } from './ShareModal'

interface PremiumDealCardProps {
  coupon: Coupon
}

export function PremiumDealCard({ coupon }: PremiumDealCardProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [loginPromptOpen, setLoginPromptOpen] = useState(false)
  const { user } = useAuthStore()
  const { isSaved, save, unsave } = useSavedCoupons()
  const router = useRouter()
  
  const saved = isSaved(coupon.id)
  const initials = coupon.store.name.slice(0, 2).toUpperCase()
  
  // Get dynamic visual theme from regex match of titles/categories
  const theme = getDealTheme(coupon.title, coupon.store.name, coupon.store.category?.name)

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      setLoginPromptOpen(true)
      return
    }
    if (saved) {
      unsave(coupon.id)
    } else {
      save(coupon.id, coupon.store.name)
    }
  }

  const handleCardClick = () => {
    if (!user) {
      setLoginPromptOpen(true)
    } else {
      router.push(`/coupons/${coupon.id}`)
    }
  }

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShareModalOpen(true)
  }

  const handleGrabDeal = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      setLoginPromptOpen(true)
    } else {
      router.push(`/coupons/${coupon.id}?redirect=true`)
    }
  }

  return (
    <>
      <div
        className={cn(
          "relative flex-shrink-0 w-[290px] h-[170px] sm:w-[320px] sm:h-[180px] rounded-2xl overflow-hidden shadow-md p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group select-none bg-gradient-to-br snap-start cursor-pointer",
          theme.gradient
        )}
        onClick={handleCardClick}
      >
        {/* Ambient background glow */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500 pointer-events-none" />

        {/* Top Header: Store Logo and Action Bar */}
        <div className="flex justify-between items-start z-10">
          <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md overflow-hidden flex-shrink-0">
            {coupon.store.logo_url ? (
              <Image
                src={coupon.store.logo_url}
                alt={coupon.store.name}
                width={40}
                height={40}
                className="object-contain"
              />
            ) : (
              <span className="text-gray-800 font-extrabold text-sm">{initials}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleShareClick}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-sm transition-all border border-white/5 shadow-sm"
              aria-label="Share deal"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleSaveToggle}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-sm transition-all border border-white/5 shadow-sm"
              aria-label={saved ? 'Unsave deal' : 'Save deal'}
            >
              <Bookmark
                className={cn('w-3.5 h-3.5 transition-colors', saved ? 'fill-white text-white' : 'text-white/85')}
              />
            </button>
          </div>
        </div>

        {/* Center: Offer & Cashback Rate */}
        <div className="flex-1 flex flex-col justify-end pr-24 z-10 mt-2">
          <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-tight drop-shadow-sm line-clamp-1">
            {coupon.discount_value || "HOT DEAL"}
          </h3>
          <p className="text-[10px] sm:text-xs text-white/80 font-medium line-clamp-2 mt-0.5 mb-2.5 drop-shadow-sm leading-snug">
            {coupon.title}
          </p>

          {coupon.store.cashback_rate && (
            <div className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wide w-fit uppercase border border-white/10",
              theme.badgeBg
            )}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
              {coupon.store.cashback_rate}
            </div>
          )}
        </div>

        {/* Right side floating product image */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 pointer-events-none z-10 flex items-center justify-center">
          <Image
            src={theme.imageUrl}
            alt="deal product illustration"
            width={100}
            height={100}
            className="object-contain drop-shadow-2xl animate-float"
            priority={false}
          />
        </div>

        {/* Bottom CTA Button */}
        <div className="absolute right-4 bottom-4 z-10" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleGrabDeal}
            className={cn(
              "px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-extrabold shadow-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1",
              theme.btnBg
            )}
          >
            Grab Deal
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareUrl={`/coupons/${coupon.id}`}
        title={coupon.title}
      />
      <LoginPromptModal
        isOpen={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        redirectPath={`/coupons/${coupon.id}`}
      />
    </>
  )
}
