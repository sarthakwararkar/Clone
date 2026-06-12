import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { api } from '@/lib/api'
import { CouponDetailClient } from './CouponDetailClient'

export const revalidate = 1800 // ISR 30 mins

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const p = await params
  try {
    const coupon = await api.getCoupon(p.id)
    return {
      title: `${coupon.title} — ${coupon.store.name} Promo Code`,
      description: `Get verified ${coupon.store.name} coupon: "${coupon.title}". Expiring soon. Claim your discount now!`,
    }
  } catch {
    return {
      title: 'Verified Promo Code & Discount',
      description: 'Get verified coupons and discount codes.',
    }
  }
}

export default async function CouponPage({ params }: PageProps) {
  const p = await params
  let coupon
  
  try {
    coupon = await api.getCoupon(p.id)
  } catch (err: any) {
    if (err.status === 404) {
      notFound()
    }
    throw err
  }

  // Fetch more coupons from the same store, filtering out the current coupon
  const storeCouponsResponse = await api
    .getCoupons({ store: coupon.store.slug, limit: 7 })
    .catch(() => ({ data: [] }))

  const moreCoupons = storeCouponsResponse.data.filter((c) => c.id !== coupon.id).slice(0, 6)

  return <CouponDetailClient coupon={coupon} moreCoupons={moreCoupons} />
}
