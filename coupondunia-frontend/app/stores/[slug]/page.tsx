import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { api } from '@/lib/api'
import { StoreHeader } from '@/components/stores/StoreHeader'
import { StoreCouponsList } from './StoreCouponsList'

export const revalidate = 3600 // ISR hourly

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  try {
    const storesResponse = await api.getStores({ limit: 50 })
    return storesResponse.data.map((store) => ({
      slug: store.slug,
    }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const p = await params
  try {
    const storeDetail = await api.getStore(p.slug)
    const store = storeDetail.store
    const year = new Date().getFullYear()
    const rateStr = store.cashback_rate ? ` | Up to ${store.cashback_rate} Cashback` : ''
    return {
      title: `${store.name} Coupons & Promo Codes ${year}${rateStr}`,
      description: `Save with verified ${store.name} promo codes, discount coupons, and cashback deals for ${year}. Get the best discounts today!`,
      openGraph: {
        title: `${store.name} Coupons & Promo Codes ${year}${rateStr}`,
        description: `Save with verified ${store.name} promo codes, discount coupons, and cashback deals for ${year}. Get the best discounts today!`,
      },
    }
  } catch {
    return {
      title: 'Store Coupons & Promo Codes',
      description: 'Find top store coupons and deals.',
    }
  }
}

export default async function StorePage({ params }: PageProps) {
  const p = await params
  let storeDetail
  
  try {
    // Fetch store details (which returns { store: Store, coupons: Coupon[] })
    storeDetail = await api.getStore(p.slug)
  } catch (err: any) {
    if (err.status === 404) {
      notFound()
    }
    throw err
  }

  const store = storeDetail.store

  // Fetch all store coupons using public coupons API to allow filtering/pagination
  const couponsResponse = await api
    .getCoupons({ store: p.slug, limit: 100 })
    .catch(() => ({ data: [] }))

  return (
    <div className="space-y-8">
      {/* Store Hero Header */}
      <StoreHeader store={store} couponCount={store.coupon_count ?? 0} />

      {/* Coupons filter & list */}
      <StoreCouponsList initialCoupons={couponsResponse.data} />
    </div>
  )
}
