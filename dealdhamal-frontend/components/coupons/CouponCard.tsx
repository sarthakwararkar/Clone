'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Bookmark, Clock, CheckCircle, Share2, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Coupon } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CouponModal } from './CouponModal'
import { ShareModal } from './ShareModal'
import { LoginPromptModal } from '@/components/auth/LoginPromptModal'
import { maskCode, timeAgo, formatNumber } from '@/lib/utils'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSavedCoupons } from '@/hooks/useSavedCoupons'
import { cn } from '@/lib/utils'
import { getDealTheme } from '@/lib/dealImages'

interface CouponCardProps {
  coupon: Coupon
  view?: 'grid' | 'list'
  variant?: 'default' | 'premium'
}

export function CouponCard({ coupon, view = 'list', variant = 'default' }: CouponCardProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [loginPromptOpen, setLoginPromptOpen] = useState(false)
  const [affiliateImgError, setAffiliateImgError] = useState(false)
  const { user } = useAuthStore()
  const { isSaved, save, unsave } = useSavedCoupons()
  const router = useRouter()
  const saved = isSaved(coupon.id)

  const initials = coupon.store.name.slice(0, 2).toUpperCase()

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      setLoginPromptOpen(true)
      return
    }
    if (saved) unsave(coupon.id)
    else save(coupon.id, coupon.store.name)
  }

  const handleReveal = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      setLoginPromptOpen(true)
    } else {
      setModalOpen(true)
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

  if (variant === 'premium') {
    const theme = getDealTheme(coupon.title, coupon.store.name, coupon.store.category?.name)

    // Use real affiliate images only (banner or logo from affiliate network)
    // No Unsplash stock photo fallbacks — show initials if no real image exists
    const hasAffiliateBanner = !affiliateImgError && !!coupon.store.banner_url
    const hasAffiliateLogo = !affiliateImgError && !!coupon.store.logo_url
    const affiliateDealImage = hasAffiliateBanner
      ? coupon.store.banner_url!
      : hasAffiliateLogo
        ? coupon.store.logo_url!
        : null
    
    return (
      <>
        <div
          className={cn(
            "relative w-full h-[190px] sm:h-[210px] rounded-3xl overflow-hidden shadow-lg p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group select-none bg-gradient-to-br cursor-pointer border border-white/5",
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

          {/* Center: Offer details */}
          <div className="flex-1 flex flex-col justify-end pr-28 sm:pr-32 z-10 mt-2">
            <Link
              href={`/stores/${coupon.store.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] sm:text-xs font-bold text-white/70 uppercase tracking-widest hover:text-white transition-colors w-fit mb-0.5"
            >
              {coupon.store.name}
            </Link>

            <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight drop-shadow-sm line-clamp-1">
              {coupon.discount_value || "HOT DEAL"}
            </h3>
            <p className="text-xs sm:text-sm text-white/90 font-medium line-clamp-2 mt-0.5 mb-1.5 drop-shadow-sm leading-snug">
              {coupon.title}
            </p>

            {/* Badges / Meta Info */}
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              {coupon.store.cashback_rate && (
                <div className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide w-fit uppercase border border-white/15",
                  theme.badgeBg
                )}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  {coupon.store.cashback_rate}
                </div>
              )}
              
              {coupon.is_verified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">
                  Verified
                </span>
              )}

              {coupon.is_exclusive && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase bg-amber-500/20 text-amber-300 border border-amber-500/20">
                  Exclusive
                </span>
              )}
            </div>

            {/* Expiry & Used count */}
            <div className="flex items-center gap-2 text-[10px] text-white/70 mt-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-white/60" />
                {coupon.expires_at ? `Expires ${timeAgo(coupon.expires_at)}` : 'No Expiry'}
              </span>
              {coupon.used_count > 0 && (
                <>
                  <span>•</span>
                  <span>{formatNumber(coupon.used_count)} used</span>
                </>
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
                  onError={() => setAffiliateImgError(true)}
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
            {coupon.coupon_type === 'code' ? (
              <button
                onClick={handleReveal}
                className="border border-dashed border-white/40 hover:border-white/60 bg-white/10 hover:bg-white/20 text-white rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 text-xs font-bold font-mono tracking-wider backdrop-blur-sm shadow-md"
              >
                {coupon.code ? maskCode(coupon.code) : '••••••'}
                <span className="ml-1.5 text-[10px] text-white/80 bg-white/10 px-1.5 py-0.5 rounded-md font-sans font-bold">
                  REVEAL
                </span>
              </button>
            ) : (
              <button
                onClick={handleReveal}
                className={cn(
                  "px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold shadow-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5",
                  theme.btnBg
                )}
              >
                Grab Deal
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <CouponModal
          coupon={coupon}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
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

  if (view === 'grid') {
    return (
      <>
        <div
          className="relative bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center group"
          onClick={handleCardClick}
        >
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
            <button
              onClick={handleShareClick}
              className="p-1.5 rounded-full bg-white/90 hover:bg-white border border-gray-100 shadow-sm transition-all text-gray-400 hover:text-primary"
              aria-label="Share coupon"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleSaveToggle}
              className="p-1.5 rounded-full bg-white/90 hover:bg-white border border-gray-100 shadow-sm transition-all"
              aria-label={saved ? 'Unsave coupon' : 'Save coupon'}
            >
              <Bookmark
                className={cn('w-3.5 h-3.5 transition-colors', saved ? 'fill-primary text-primary' : 'text-gray-400')}
              />
            </button>
          </div>

          <div className="w-16 h-16 rounded-xl border border-gray-100 bg-white flex items-center justify-center overflow-hidden">
            {coupon.store.logo_url ? (
              <Image src={coupon.store.logo_url} alt={coupon.store.name} width={64} height={64} className="object-contain" />
            ) : (
              <div className="w-full h-full bg-primary-light flex items-center justify-center">
                <span className="text-primary font-bold text-lg">{initials}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-2 hover:text-primary">{coupon.store.name}</p>
          <p className="text-sm font-semibold text-gray-900 line-clamp-2 mt-1">{coupon.title}</p>
          <div className="mt-1">
            <Badge variant={coupon.coupon_type} />
          </div>

          <div className="w-full mt-3" onClick={(e) => e.stopPropagation()}>
            <Button
              variant={coupon.coupon_type === 'code' ? 'secondary' : 'primary'}
              size="sm"
              className="w-full"
              onClick={handleReveal}
            >
              {coupon.coupon_type === 'code' ? 'Reveal Code' : 'Get Deal'}
            </Button>
          </div>
        </div>

        <CouponModal coupon={coupon} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} shareUrl={`/coupons/${coupon.id}`} title={coupon.title} />
        <LoginPromptModal isOpen={loginPromptOpen} onClose={() => setLoginPromptOpen(false)} redirectPath={`/coupons/${coupon.id}`} />
      </>
    )
  }

  // List view
  return (
    <>
      {/* Desktop List View Layout */}
      <div
        className="hidden sm:flex bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group items-start gap-4"
        onClick={handleCardClick}
      >
        {/* Logo */}
        <div className="w-12 h-12 rounded-lg border border-gray-100 bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
          {coupon.store.logo_url ? (
            <Image src={coupon.store.logo_url} alt={coupon.store.name} width={48} height={48} className="object-contain" />
          ) : (
            <div className="w-full h-full bg-primary-light flex items-center justify-center">
              <span className="text-primary font-bold">{initials}</span>
            </div>
          )}
        </div>

        {/* Center */}
        <div className="flex-1 min-w-0 px-1">
          <Link
            href={`/stores/${coupon.store.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-gray-500 hover:text-primary transition-colors"
          >
            {coupon.store.name}
          </Link>
          <p className="text-base font-semibold text-gray-900 line-clamp-2 mt-0.5">{coupon.title}</p>

          <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
            <Badge variant={coupon.coupon_type} />
            {coupon.is_exclusive && <Badge variant="exclusive" />}
            {coupon.is_verified && <Badge variant="verified" />}
          </div>

          <div className="flex items-center gap-1 mt-1">
            {coupon.expires_at ? (
              <>
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">Expires {timeAgo(coupon.expires_at)}</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">No Expiry</span>
              </>
            )}
          </div>

          {coupon.success_rate > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-24 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{ width: `${coupon.success_rate}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{coupon.success_rate}% success</span>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0 w-36" onClick={(e) => e.stopPropagation()}>
          {coupon.used_count > 0 && (
            <span className="text-xs text-gray-400">{formatNumber(coupon.used_count)} used</span>
          )}

          {coupon.coupon_type === 'code' ? (
            <div
              className="border-2 border-dashed border-primary rounded-lg px-3 py-2 cursor-pointer hover:bg-primary-light transition-colors text-center"
              onClick={handleReveal}
            >
              <p className="font-mono text-sm font-semibold text-primary">
                {coupon.code ? maskCode(coupon.code) : '••••••'}
              </p>
              <p className="text-xs text-gray-400">Tap to reveal</p>
            </div>
          ) : (
            <Button variant="primary" size="sm" onClick={handleReveal}>
              Get Deal →
            </Button>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleShareClick}
              aria-label="Share coupon"
              className="text-gray-300 hover:text-primary transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleSaveToggle}
              aria-label={saved ? 'Unsave coupon' : 'Save coupon'}
            >
              <Bookmark
                className={cn('w-5 h-5 transition-colors', saved ? 'fill-primary text-primary' : 'text-gray-300 hover:text-gray-400')}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile List View Layout */}
      <div
        className="sm:hidden bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3.5 cursor-pointer relative"
        onClick={handleCardClick}
      >
        {/* Header Row: Logo, Store Name, and Action Buttons */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg border border-gray-100 bg-white flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
              {coupon.store.logo_url ? (
                <Image src={coupon.store.logo_url} alt={coupon.store.name} width={40} height={40} className="object-contain" />
              ) : (
                <div className="w-full h-full bg-primary-light flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">{initials}</span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <Link
                href={`/stores/${coupon.store.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-semibold text-gray-500 hover:text-primary transition-colors block truncate"
              >
                {coupon.store.name}
              </Link>
              {coupon.used_count > 0 && (
                <span className="text-[10px] text-gray-400">{formatNumber(coupon.used_count)} used</span>
              )}
            </div>
          </div>

          {/* Actions: Share & Save */}
          <div className="flex items-center gap-2.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleShareClick}
              aria-label="Share coupon"
              className="p-1.5 rounded-full text-gray-400 hover:text-primary transition-colors hover:bg-gray-50 border border-gray-100"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleSaveToggle}
              aria-label={saved ? 'Unsave coupon' : 'Save coupon'}
              className="p-1.5 rounded-full border border-gray-100 hover:bg-gray-50"
            >
              <Bookmark
                className={cn('w-4 h-4 transition-colors', saved ? 'fill-primary text-primary font-bold' : 'text-gray-400')}
              />
            </button>
          </div>
        </div>

        {/* Coupon Title */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
            {coupon.title}
          </h3>
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={coupon.coupon_type} />
          {coupon.is_exclusive && <Badge variant="exclusive" />}
          {coupon.is_verified && <Badge variant="verified" />}
        </div>

        {/* Expiry & Success Rate info */}
        {(coupon.expires_at || coupon.success_rate > 0) && (
          <div className="flex items-center justify-between gap-4 pt-2.5 border-t border-gray-50 text-[11px]">
            {coupon.expires_at ? (
              <div className="flex items-center gap-1 text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Expires {timeAgo(coupon.expires_at)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="font-semibold">No Expiry</span>
              </div>
            )}

            {coupon.success_rate > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400">{coupon.success_rate}% success</span>
                <div className="w-12 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: `${coupon.success_rate}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA Button at Bottom */}
        <div className="w-full pt-1" onClick={(e) => e.stopPropagation()}>
          {coupon.coupon_type === 'code' ? (
            <button
              onClick={handleReveal}
              className="w-full border-2 border-dashed border-primary bg-primary-light/30 hover:bg-primary-light/50 rounded-xl py-2.5 text-center cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-sm font-bold text-primary tracking-wider">
                  {coupon.code ? maskCode(coupon.code) : '••••••'}
                </span>
                <span className="text-xs font-bold text-primary-dark/80 bg-primary-light px-2 py-0.5 rounded-md">
                  REVEAL CODE
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={handleReveal}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-sm py-2.5 rounded-xl text-center cursor-pointer transition-colors shadow-sm"
            >
              Get Deal →
            </button>
          )}
        </div>
      </div>

      <CouponModal coupon={coupon} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} shareUrl={`/coupons/${coupon.id}`} title={coupon.title} />
      <LoginPromptModal isOpen={loginPromptOpen} onClose={() => setLoginPromptOpen(false)} redirectPath={`/coupons/${coupon.id}`} />
    </>
  )
}
