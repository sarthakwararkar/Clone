import { MetadataRoute } from 'next'

const BASE_URL = 'https://dealdhamal.vercel.app'
const API_URL = process.env.NEXT_PUBLIC_API_URL?.endsWith('/')
  ? process.env.NEXT_PUBLIC_API_URL.slice(0, -1)
  : process.env.NEXT_PUBLIC_API_URL

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/stores`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/terms`, lastModified: new Date('2026-06-13'), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date('2026-06-13'), changeFrequency: 'yearly', priority: 0.2 },
  ]

  let storeUrls: MetadataRoute.Sitemap = []
  try {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/stores?limit=1000`, {
        next: { revalidate: 3600 }
      })
      if (res.ok) {
        const body = await res.json()
        const stores = body?.data?.data || body?.data || []
        if (Array.isArray(stores)) {
          storeUrls = stores.map((store: any) => ({
            url: `${BASE_URL}/stores/${store.slug}`,
            priority: 0.8,
            changeFrequency: 'daily',
            lastModified: store.created_at ? new Date(store.created_at) : new Date(),
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
            changeFrequency: 'daily',
            lastModified: category.created_at ? new Date(category.created_at) : new Date(),
          }))
        }
      }
    }
  } catch (error) {
    console.error('Sitemap categories fetch error:', error)
  }

  return [...staticPages, ...storeUrls, ...categoryUrls]
}
