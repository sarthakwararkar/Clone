'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Bookmark, Clock, CheckCircle, ArrowLeft, Share2 } from 'lucide-react'
import type { Coupon } from '@/types'
import { CouponCard } from '@/components/coupons/CouponCard'
import { CouponModal } from '@/components/coupons/CouponModal'
import { ShareModal } from '@/components/coupons/ShareModal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { timeAgo, formatDiscount, truncate } from '@/lib/utils'
import { useSavedCoupons } from '@/hooks/useSavedCoupons'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

interface CouponDetailClientProps {
  coupon: Coupon
  moreCoupons: Coupon[]
}

export function CouponDetailClient({ coupon, moreCoupons }: CouponDetailClientProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const { user, isLoading } = useAuth()
  const { isSaved, save, unsave } = useSavedCoupons()
  const initials = coupon.store.name.substring(0, 2).toUpperCase()

  const saved = isSaved(coupon.id)

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      toast.error('Login to save coupons')
      return
    }
    if (saved) {
      unsave(coupon.id)
    } else {
      save(coupon.id, coupon.store.name)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Breadcrumbs Skeleton */}
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        {/* Detail Card Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-24 h-24 rounded-2xl bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-10 bg-gray-200 rounded w-40" />
          </div>
        </div>
      </div>
    )
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Stores', href: '/stores' },
    { label: coupon.store.name, href: `/stores/${coupon.store.slug}` },
    { label: truncate(coupon.title, 40) }
  ]

  if (!user) {
    return (
      <div className="space-y-8">
        <Breadcrumb items={breadcrumbItems} />

        {/* Lock Screen detail card */}
        <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 md:p-10 flex flex-col items-center justify-center text-center min-h-[350px]">
          {/* Blurred background preview elements */}
          <div className="absolute inset-0 opacity-15 filter blur-[6px] pointer-events-none select-none flex flex-col md:flex-row gap-6 p-8 items-start">
            <div className="w-24 h-24 rounded-2xl bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-4 text-left w-full">
              <div className="h-4 bg-gray-400 rounded w-1/4" />
              <div className="h-8 bg-gray-400 rounded w-3/4" />
              <div className="h-4 bg-gray-400 rounded w-1/2" />
            </div>
          </div>

          {/* Central Unlock Card */}
          <div className="relative z-10 max-w-md mx-auto space-y-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 relative">
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              {/* Lock Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-primary animate-bounce">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Unlock This Coupon</h1>
              <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                Unlock verified promo codes, cashback details, and exclusive store rewards for <span className="font-semibold text-primary">{coupon.store.name}</span>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 w-full">
              <Link
                href={`/login?next=/coupons/${coupon.id}`}
                className="flex-1 inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-lg shadow-primary/20 px-4 py-2 text-sm w-full font-bold text-center"
              >
                Login to Reveal
              </Link>
              <Link
                href={`/signup?next=/coupons/${coupon.id}`}
                className="flex-1 inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white text-primary border-2 border-primary hover:bg-primary-light focus:ring-primary px-4 py-2 text-sm w-full font-semibold text-center"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>

        {/* More Offers Section (Blurred / Locked) */}
        {moreCoupons.length > 0 && (
          <div className="space-y-4 opacity-50 pointer-events-none select-none">
            <h2 className="text-lg font-bold text-gray-400">
              More Offers from {coupon.store.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {moreCoupons.map((c) => (
                <CouponCard key={c.id} coupon={c} view="list" variant="premium" />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Breadcrumb items={breadcrumbItems} />

      {/* Main Detail Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start relative">
        {/* Action Triggers */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <button
            onClick={() => setShareModalOpen(true)}
            className="p-2 rounded-full border border-gray-100 hover:bg-gray-50 transition-colors text-gray-400 hover:text-primary"
            aria-label="Share Coupon"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleSaveToggle}
            className="p-2 rounded-full border border-gray-100 hover:bg-gray-50 transition-colors"
            aria-label={saved ? 'Unsave Coupon' : 'Save Coupon'}
          >
            <Bookmark className={`w-5 h-5 ${saved ? 'fill-primary text-primary' : 'text-gray-400'}`} />
          </button>
        </div>

        {/* Store Logo Column */}
        <div className="w-24 h-24 rounded-2xl border border-gray-100 p-2 flex items-center justify-center bg-white shadow-sm flex-shrink-0">
          {coupon.store.logo_url ? (
            <Image
              src={coupon.store.logo_url}
              alt={coupon.store.name}
              width={80}
              height={80}
              className="object-contain"
            />
          ) : (
            <div className="w-full h-full bg-primary-light flex items-center justify-center">
              <span className="text-primary font-bold text-xl">{initials}</span>
            </div>
          )}
        </div>

        {/* Coupon Info Column */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant={coupon.coupon_type} />
              {coupon.is_exclusive && <Badge variant="exclusive" />}
              {coupon.is_verified && <Badge variant="verified" />}
            </div>
            
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
              {coupon.title}
            </h1>
            
            <p className="text-sm text-gray-500">
              Offer from{' '}
              <Link href={`/stores/${coupon.store.slug}`} className="text-primary hover:underline font-semibold">
                {coupon.store.name}
              </Link>
            </p>
          </div>

          {/* Details Row */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {coupon.expires_at ? `Expires ${timeAgo(coupon.expires_at)}` : 'No Expiry'}
            </span>
            {coupon.used_count > 0 && (
              <>
                <span>•</span>
                <span>{coupon.used_count} times used</span>
              </>
            )}
            {coupon.success_rate > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
                  {coupon.success_rate}% Success Rate
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {coupon.description && (
            <div className="pt-2 border-t border-gray-50">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Details &amp; Terms
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {coupon.description}
              </p>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              size="lg"
              className="px-8 shadow-lg shadow-primary/20"
              onClick={() => setModalOpen(true)}
            >
              {coupon.coupon_type === 'code' ? 'Reveal Coupon Code' : 'Get This Deal'}
            </Button>
            <Link
              href={`/stores/${coupon.store.slug}`}
              className="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 bg-transparent text-gray-600 hover:bg-gray-100 px-6 py-3 text-base w-full sm:w-auto text-center"
            >
              Visit Store
            </Link>
          </div>
        </div>
      </div>

      {/* More Offers Section */}
      {moreCoupons.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">
            More Offers from {coupon.store.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {moreCoupons.map((c) => (
              <CouponCard key={c.id} coupon={c} view="list" variant="premium" />
            ))}
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
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
    </div>
  )
}
