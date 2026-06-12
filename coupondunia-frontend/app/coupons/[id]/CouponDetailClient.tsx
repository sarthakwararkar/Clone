'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Bookmark, Clock, CheckCircle, ArrowLeft } from 'lucide-react'
import type { Coupon } from '@/types'
import { CouponCard } from '@/components/coupons/CouponCard'
import { CouponModal } from '@/components/coupons/CouponModal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { timeAgo, formatDiscount } from '@/lib/utils'
import { useSavedCoupons } from '@/hooks/useSavedCoupons'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

interface CouponDetailClientProps {
  coupon: Coupon
  moreCoupons: Coupon[]
}

export function CouponDetailClient({ coupon, moreCoupons }: CouponDetailClientProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { user } = useAuth()
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
      save(coupon.id)
    }
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav className="text-xs text-gray-500 flex items-center gap-2">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>&gt;</span>
        <Link href="/stores" className="hover:text-primary transition-colors">Stores</Link>
        <span>&gt;</span>
        <Link href={`/stores/${coupon.store.slug}`} className="hover:text-primary transition-colors">
          {coupon.store.name}
        </Link>
        <span>&gt;</span>
        <span className="text-gray-700 font-medium truncate max-w-xs">{coupon.title}</span>
      </nav>

      {/* Main Detail Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start relative">
        {/* Bookmark Trigger */}
        <button
          onClick={handleSaveToggle}
          className="absolute top-6 right-6 p-2 rounded-full border border-gray-100 hover:bg-gray-50 transition-colors"
          aria-label={saved ? 'Unsave Coupon' : 'Save Coupon'}
        >
          <Bookmark className={`w-5 h-5 ${saved ? 'fill-primary text-primary' : 'text-gray-400'}`} />
        </button>

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
            <span>•</span>
            <span>{coupon.used_count} times used</span>
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
            <Link href={`/stores/${coupon.store.slug}`}>
              <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                Visit Store
              </Button>
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
              <CouponCard key={c.id} coupon={c} view="list" />
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
    </div>
  )
}
