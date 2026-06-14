import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { api } from '@/lib/api'
import { CouponDetailClient } from './CouponDetailClient'
import { CouponPageSchema } from '@/components/seo/CouponPageSchema'

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
      title: `${coupon.title} — ${coupon.store.name} Promo Code | DealDhamal`,
      description: `Use this ${coupon.store.name} coupon to get ${coupon.discount_value ?? 'a discount'} on your order. ${coupon.description ?? ''} Verified and working — click to reveal.`,
      openGraph: {
        title: `${coupon.title} | DealDhamal`,
        url: `https://www.dealdhamal.in/coupons/${coupon.id}`,
      },
      alternates: { canonical: `https://www.dealdhamal.in/coupons/${coupon.id}` },
    }
  } catch {
    return { title: 'Coupon Deal | DealDhamal' }
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

  return (
    <>
      <CouponPageSchema coupon={coupon} />
      <CouponDetailClient coupon={coupon} moreCoupons={moreCoupons} />
    </>
  )
}
