import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { api } from '@/lib/api'
import { StoreHeader } from '@/components/stores/StoreHeader'
import { StoreCouponsList } from './StoreCouponsList'
import { StorePageSchema } from '@/components/seo/StorePageSchema'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

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
    return {
      title: `${store.name} Coupons & Promo Codes ${year} — Up to ${store.cashback_rate ?? '70%'} Off`,
      description: `Get the best ${store.name} coupon codes and cashback offers for ${year}. Verified codes updated daily. Save up to ${store.cashback_rate ?? '70%'} on ${store.name}.`,
      keywords: [`${store.name} coupons`, `${store.name} promo codes`, `${store.name} discount codes`, `${store.name} offers today`],
      openGraph: {
        title: `${store.name} Coupons — Up to ${store.cashback_rate ?? '70%'} Off | DealDhamal`,
        description: `Best ${store.name} coupon codes for ${year}. Verified deals updated daily.`,
        url: `https://www.dealdhamal.in/stores/${store.slug}`,
        images: store.logo_url ? [{ url: store.logo_url, width: 400, height: 400 }] : [{ url: '/og-image.png', width: 1200, height: 630 }],
      },
      alternates: { canonical: `https://www.dealdhamal.in/stores/${store.slug}` },
    }
  } catch {
    return { title: 'Store Coupons & Deals | DealDhamal' }
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
      <StorePageSchema store={store} coupons={couponsResponse.data} />
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Stores', href: '/stores' },
          { label: store.name },
        ]}
      />

      {/* Store Hero Header */}
      <StoreHeader store={store} couponCount={store.coupon_count ?? 0} />

      {/* Coupons filter & list */}
      <StoreCouponsList initialCoupons={couponsResponse.data} />
    </div>
  )
}
