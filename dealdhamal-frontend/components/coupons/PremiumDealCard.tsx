'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Bookmark, Share2, ExternalLink, Calendar, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Coupon } from '@/types'
import { useAuthStore } from '@/stores/useAuthStore'
import { getDealTheme } from '@/lib/dealImages'
import { useSavedCoupons } from '@/hooks/useSavedCoupons'
import { cn, formatAddedDate, formatExpiryInfo } from '@/lib/utils'
import { LoginPromptModal } from '@/components/auth/LoginPromptModal'
import { ShareModal } from './ShareModal'

interface PremiumDealCardProps {
  coupon: Coupon
  isAi?: boolean
}

export function PremiumDealCard({ coupon, isAi }: PremiumDealCardProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [loginPromptOpen, setLoginPromptOpen] = useState(false)
  const [bannerError, setBannerError] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const { user } = useAuthStore()
  const { isSaved, save, unsave } = useSavedCoupons()
  const router = useRouter()
  
  const saved = isSaved(coupon.id)
  
  const addedDateStr = formatAddedDate(coupon.created_at)
  const expiryInfo = formatExpiryInfo(coupon.expires_at)
  
  // Use real affiliate images only:
  // 1. store.banner_url — real affiliate creative from Admitad/vCommission
  // 2. store.logo_url — real store brand logo from affiliate network
  // If neither exists, we show styled initials (no fake Unsplash stock photos)
  const hasAffiliateBanner = !bannerError && !!coupon.store.banner_url
  const hasAffiliateLogo = !logoError && !!coupon.store.logo_url
  const affiliateDealImage = hasAffiliateBanner
    ? coupon.store.banner_url!
    : hasAffiliateLogo
      ? coupon.store.logo_url!
      : null
  const initials = coupon.store.name.slice(0, 2).toUpperCase()
  
  // Gradient/button color theme only — imageUrl from getDealTheme is intentionally unused
  const theme = getDealTheme(coupon.title, coupon.store.name, coupon.store.category?.name, isAi)

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
    router.push(`/coupons/${coupon.id}`)
  }

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShareModalOpen(true)
  }

  const handleGrabDeal = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/coupons/${coupon.id}?redirect=true`)
  }

  return (
    <>
      <div
        className={cn(
          "relative flex-shrink-0 w-[320px] h-[190px] sm:w-[370px] sm:h-[210px] rounded-3xl overflow-hidden shadow-lg p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group select-none bg-gradient-to-br snap-start cursor-pointer",
          theme.gradient
        )}
        onClick={handleCardClick}
      >
        {/* Ambient background glow */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500 pointer-events-none" />

        {/* Top Header: Store Logo and Action Bar */}
        <div className="flex justify-between items-start z-10">
          <div className="w-11 h-11 rounded-2xl bg-white p-2 flex items-center justify-center shadow-md overflow-hidden flex-shrink-0 border border-white/5">
            {coupon.store.logo_url ? (
              <Image
                src={coupon.store.logo_url}
                alt={coupon.store.name}
                width={44}
                height={44}
                className="object-contain"
                unoptimized
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-gray-800 font-extrabold text-sm">{initials}</span>
            )}
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleShareClick}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-sm transition-all border border-white/10 shadow-sm"
              aria-label="Share deal"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleSaveToggle}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-sm transition-all border border-white/10 shadow-sm"
              aria-label={saved ? 'Unsave deal' : 'Save deal'}
            >
              <Bookmark
                className={cn('w-4 h-4 transition-colors', saved ? 'fill-white text-white' : 'text-white/85')}
              />
            </button>
          </div>
        </div>

        {/* Center: Offer & Cashback Rate */}
        <div className="flex-1 flex flex-col justify-end pr-28 sm:pr-32 z-10 mt-1">
          <h3 className="text-lg sm:text-xl font-black tracking-tight text-white leading-tight drop-shadow-sm line-clamp-1">
            {coupon.discount_value || "HOT DEAL"}
          </h3>
          <p className="text-xs sm:text-sm text-white/90 font-medium line-clamp-2 mt-0.5 mb-1.5 drop-shadow-sm leading-snug">
            {coupon.title}
          </p>

          {/* Dates & Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-black/30 text-white/90 border border-white/10">
              <Calendar className="w-2.5 h-2.5 text-white/70" />
              {addedDateStr}
            </span>
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border border-white/10",
              expiryInfo.isUrgent ? 'bg-amber-500/40 text-amber-200 font-bold' : 'bg-black/30 text-white/90'
            )}>
              <Clock className="w-2.5 h-2.5 text-white/70" />
              {expiryInfo.text}
            </span>

            {coupon.store.cashback_rate && (
              <div className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide w-fit uppercase border border-white/15",
                theme.badgeBg
              )}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                {coupon.store.cashback_rate}
              </div>
            )}
          </div>
        </div>

        {/* Styled image on the right (Tilted Polaroid frame) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 z-10 pointer-events-none">
          <div className="w-full h-full relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-black/10 rotate-6 group-hover:rotate-3 group-hover:scale-105 transition-all duration-300">
            {affiliateDealImage ? (
              <Image
                src={affiliateDealImage}
                alt={coupon.store.name}
                fill
                className={hasAffiliateBanner ? 'object-cover' : 'object-contain p-1'}
                priority={false}
                sizes="(max-width: 640px) 96px, 112px"
                unoptimized
                onError={() => hasAffiliateBanner ? setBannerError(true) : setLogoError(true)}
              />
            ) : (
              /* Branded initials — no fake stock photos */
              <div className="w-full h-full flex items-center justify-center bg-white/10">
                <span className="text-white/70 font-black text-xl tracking-tighter uppercase select-none">{initials}</span>
              </div>
            )}
            {/* Bottom gradient shadow overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div className="absolute right-4 bottom-4 z-10" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleGrabDeal}
            className={cn(
              "px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold shadow-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5",
              theme.btnBg
            )}
          >
            Grab Deal
            <ExternalLink className="w-3 h-3" />
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
