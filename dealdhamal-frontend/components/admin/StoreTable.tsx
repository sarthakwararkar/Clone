'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Pencil, ChevronUp, ChevronDown, Search } from 'lucide-react'
import type { Store } from '@/types'
import { Pagination } from '@/components/ui/Pagination'
import { StoreCashbackBadge } from '@/components/stores/StoreCashbackBadge'

interface StoreTableProps {
  stores: Store[]
  total: number
  page: number
  limit: number
  onPageChange: (page: number) => void
}

type SortKey = 'name' | 'slug' | 'cashback_rate' | 'coupon_count'
type SortDir = 'asc' | 'desc'

export function StoreTable({ stores, total, page, limit, onPageChange }: StoreTableProps) {
  const [search, setSearch] = useState('')
  const [featuredFilter, setFeaturedFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === 'asc' ? (
        <ChevronUp className="w-3.5 h-3.5 inline ml-1" />
      ) : (
        <ChevronDown className="w-3.5 h-3.5 inline ml-1" />
      )
    ) : null

  const filtered = stores
    .filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.slug.toLowerCase().includes(search.toLowerCase())
      const matchFeatured =
        featuredFilter === 'all' ||
        (featuredFilter === 'featured' && s.is_featured) ||
        (featuredFilter === 'regular' && !s.is_featured)
      return matchSearch && matchFeatured
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir
      if (sortKey === 'slug') return a.slug.localeCompare(b.slug) * dir
      if (sortKey === 'cashback_rate') {
        const aRate = a.cashback_rate || ''
        const bRate = b.cashback_rate || ''
        return aRate.localeCompare(bRate) * dir
      }
      if (sortKey === 'coupon_count') {
        const aCount = a.coupon_count || 0
        const bCount = b.coupon_count || 0
        return (aCount - bCount) * dir
      }
      return 0
    })

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Filter bar */}
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search stores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={featuredFilter}
          onChange={(e) => setFeaturedFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
        >
          <option value="all">All Stores</option>
          <option value="featured">Featured Only</option>
          <option value="regular">Regular Only</option>
        </select>
        <Link href="/admin/stores/new">
          <button className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors whitespace-nowrap">
            + New Store
          </button>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 w-24">Logo</th>
              <th
                className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-primary"
                onClick={() => handleSort('name')}
              >
                Name <SortIcon col="name" />
              </th>
              <th
                className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-primary"
                onClick={() => handleSort('slug')}
              >
                Slug <SortIcon col="slug" />
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
              <th
                className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-primary"
                onClick={() => handleSort('cashback_rate')}
              >
                Cashback Rate <SortIcon col="cashback_rate" />
              </th>
              <th
                className="text-center px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-primary"
                onClick={() => handleSort('coupon_count')}
              >
                Coupons / Deals <SortIcon col="coupon_count" />
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Featured</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((store) => (
              <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="w-10 h-10 rounded-md border border-gray-100 overflow-hidden flex items-center justify-center bg-white p-1">
                    {store.logo_url ? (
                      <Image
                        src={store.logo_url}
                        alt={store.name}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-sm font-bold text-primary">
                        {store.name.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">{store.name}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{store.slug}</td>
                <td className="px-4 py-3 text-gray-600">
                  {store.category?.name || '—'}
                </td>
                <td className="px-4 py-3">
                  {store.cashback_rate ? (
                    <StoreCashbackBadge rate={store.cashback_rate} />
                  ) : (
                    <span className="text-gray-400 text-xs">No Cashback</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-gray-600">
                  {store.coupon_count ?? 0} C / {store.deal_count ?? 0} D
                </td>
                <td className="px-4 py-3 text-center">
                  {store.is_featured ? '⭐' : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/stores/${store.slug}/edit` as any}>
                      <button className="p-1.5 text-gray-400 hover:text-primary transition-colors" aria-label="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-500">No stores found</div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-100">
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  )
}
