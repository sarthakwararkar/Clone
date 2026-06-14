import type { Metadata } from 'next'
import { api } from '@/lib/api'
import { StoresPageClient } from './StoresPageClient'

export const revalidate = 3600 // ISR hourly

export const metadata: Metadata = {
  title: 'All Stores — Coupons & Cashback Offers | DealDhamal',
  description: 'Browse coupons and cashback offers from 500+ Indian stores. Find deals from Flipkart, Amazon, Myntra, Swiggy, Zomato, Nykaa and more.',
  alternates: { canonical: 'https://www.dealdhamal.in/stores' },
}

interface PageProps {
  searchParams: Promise<{
    category?: string
    page?: string
  }>
}

export default async function StoresPage({ searchParams }: PageProps) {
  const params = await searchParams
  const category = params.category
  const currentPage = params.page ? parseInt(params.page, 10) : 1

  const [categories, storesResponse] = await Promise.all([
    api.getCategories().catch(() => []),
    api.getStores({ category, page: currentPage, limit: 24 }).catch(() => ({ data: [], total: 0 })),
  ])

  return (
    <StoresPageClient
      categories={categories}
      initialStores={storesResponse.data}
      totalStores={storesResponse.total}
      page={currentPage}
      category={category}
    />
  )
}
