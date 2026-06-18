import { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dealdhamal.vercel.app'
const BASE_URL = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL

const API_URL = process.env.NEXT_PUBLIC_API_URL?.endsWith('/')
  ? process.env.NEXT_PUBLIC_API_URL.slice(0, -1)
  : process.env.NEXT_PUBLIC_API_URL

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/stores`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/best-offers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/terms`, lastModified: new Date('2026-06-13'), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date('2026-06-13'), changeFrequency: 'yearly', priority: 0.2 },
  ]

  let storeUrls: MetadataRoute.Sitemap = []
  try {
    if (API_URL) {
      // First page of stores
      const res = await fetch(`${API_URL}/api/stores?limit=100&page=1`, {
        next: { revalidate: 3600 }
      })
      if (res.ok) {
        const body = await res.json()
        let stores = body?.data || []
        const pagination = body?.pagination

        // Fetch remaining pages if any
        if (pagination && pagination.totalPages > 1) {
          const totalPages = Math.min(pagination.totalPages, 5) // fetch up to 500 stores
          const promises = []
          for (let p = 2; p <= totalPages; p++) {
            promises.push(
              fetch(`${API_URL}/api/stores?limit=100&page=${p}`, {
                next: { revalidate: 3600 }
              }).then(async (r) => {
                if (r.ok) {
                  const b = await r.json()
                  return b?.data || []
                }
                return []
              }).catch(() => [])
            )
          }
          const results = await Promise.all(promises)
          for (const pageStores of results) {
            stores = [...stores, ...pageStores]
          }
        }

        if (Array.isArray(stores)) {
          storeUrls = stores.map((store: any) => ({
            url: `${BASE_URL}/stores/${store.slug}`,
            priority: 0.8,
            changeFrequency: 'daily',
            lastModified: store.updated_at ? new Date(store.updated_at) : (store.created_at ? new Date(store.created_at) : new Date()),
          }))
        }
      }
    }
  } catch (error) {
    console.error('Sitemap stores fetch error:', error)
  }

  let categoryUrls: MetadataRoute.Sitemap = []
  try {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/categories`, {
        next: { revalidate: 3600 }
      })
      if (res.ok) {
        const body = await res.json()
        const categories = body?.data || body || []
        if (Array.isArray(categories)) {
          categoryUrls = categories.map((category: any) => ({
            url: `${BASE_URL}/categories/${category.slug}`,
            priority: 0.7,
            changeFrequency: 'weekly',
            lastModified: category.updated_at ? new Date(category.updated_at) : (category.created_at ? new Date(category.created_at) : new Date()),
          }))
        }
      }
    }
  } catch (error) {
    console.error('Sitemap categories fetch error:', error)
  }

  let couponUrls: MetadataRoute.Sitemap = []
  try {
    if (API_URL) {
      // First page of coupons
      const res = await fetch(`${API_URL}/api/coupons?limit=100&page=1`, {
        next: { revalidate: 3600 }
      })
      if (res.ok) {
        const body = await res.json()
        let coupons = body?.data || []
        const pagination = body?.pagination

        // Fetch remaining pages if any
        if (pagination && pagination.totalPages > 1) {
          const totalPages = Math.min(pagination.totalPages, 10) // fetch up to 1000 coupons (10 pages)
          const promises = []
          for (let p = 2; p <= totalPages; p++) {
            promises.push(
              fetch(`${API_URL}/api/coupons?limit=100&page=${p}`, {
                next: { revalidate: 3600 }
              }).then(async (r) => {
                if (r.ok) {
                  const b = await r.json()
                  return b?.data || []
                }
                return []
              }).catch(() => [])
            )
          }
          const results = await Promise.all(promises)
          for (const pageCoupons of results) {
            coupons = [...coupons, ...pageCoupons]
          }
        }

        if (Array.isArray(coupons)) {
          couponUrls = coupons.map((coupon: any) => ({
            url: `${BASE_URL}/coupons/${coupon.id}`,
            priority: 0.7,
            changeFrequency: 'daily',
            lastModified: coupon.updated_at ? new Date(coupon.updated_at) : (coupon.created_at ? new Date(coupon.created_at) : new Date()),
          }))
        }
      }
    }
  } catch (error) {
    console.error('Sitemap coupons fetch error:', error)
  }

  return [...staticPages, ...storeUrls, ...categoryUrls, ...couponUrls]
}

