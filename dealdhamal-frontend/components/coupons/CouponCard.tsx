'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Bookmark, Clock, CheckCircle, Share2 } from 'lucide-react'
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

interface CouponCardProps {
  coupon: Coupon
  view?: 'grid' | 'list'
}

export function CouponCard({ coupon, view = 'list' }: CouponCardProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [loginPromptOpen, setLoginPromptOpen] = useState(false)
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
          <span className="text-xs text-gray-400">{formatNumber(coupon.used_count)} used</span>

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
              <span className="text-[10px] text-gray-400">{formatNumber(coupon.used_count)} used</span>
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
