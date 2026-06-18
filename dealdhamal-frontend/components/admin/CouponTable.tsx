'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Pencil, Trash2, ChevronUp, ChevronDown, Search } from 'lucide-react'
import type { Coupon } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { maskCode, truncate, timeAgo } from '@/lib/utils'
import { api } from '@/lib/api'

interface CouponTableProps {
  coupons: Coupon[]
  total: number
  page: number
  limit: number
  onPageChange: (page: number) => void
}

type SortKey = 'title' | 'expires_at' | 'used_count'
type SortDir = 'asc' | 'desc'

export function CouponTable({ coupons, total, page, limit, onPageChange }: CouponTableProps) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('title')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const router = useRouter()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.adminDeleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] })
      toast.success('Coupon deleted')
      setDeletingId(null)
    },
    onError: () => {
      toast.error('Failed to delete coupon')
      setDeletingId(null)
    },
  })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col
      ? sortDir === 'asc'
        ? <ChevronUp className="w-3.5 h-3.5 inline ml-1" />
        : <ChevronDown className="w-3.5 h-3.5 inline ml-1" />
      : null

  const filtered = coupons
    .filter((c) => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.store?.name.toLowerCase().includes(search.toLowerCase())
      const matchType = typeFilter === 'all' || c.coupon_type === typeFilter
      return matchSearch && matchType
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'title') return a.title.localeCompare(b.title) * dir
      if (sortKey === 'expires_at') {
        const aD = a.expires_at ? new Date(a.expires_at).getTime() : Infinity
        const bD = b.expires_at ? new Date(b.expires_at).getTime() : Infinity
        return (aD - bD) * dir
      }
      if (sortKey === 'used_count') return (a.used_count - b.used_count) * dir
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
            placeholder="Search coupons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
        >
          <option value="all">All Types</option>
          <option value="code">Code</option>
          <option value="deal">Deal</option>
          <option value="cashback">Cashback</option>
        </select>
        <Link href="/admin/coupons/new">
          <button className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors whitespace-nowrap">
            + New Coupon
          </button>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 w-48">Store</th>
              <th
                className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-primary"
                onClick={() => handleSort('title')}
              >
                Title <SortIcon col="title" />
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Code</th>
              <th
                className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-primary"
                onClick={() => handleSort('expires_at')}
              >
                Expires <SortIcon col="expires_at" />
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">V</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">F</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center bg-white">
                      {coupon.store?.logo_url ? (
                        <Image src={coupon.store.logo_url} alt={coupon.store.name} width={28} height={28} className="object-contain" />
                      ) : (
                        <span className="text-xs font-bold text-primary">{coupon.store?.name?.[0]}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-600 truncate max-w-[100px]">{coupon.store?.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-800">{truncate(coupon.title, 50)}</td>
                <td className="px-4 py-3"><Badge variant={coupon.coupon_type} /></td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">
                  {coupon.code ? maskCode(coupon.code) : '—'}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {coupon.expires_at ? timeAgo(coupon.expires_at) : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  {coupon.is_verified ? '✓' : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  {coupon.is_featured ? '⭐' : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/coupons/${coupon.id}/edit`}>
                      <button className="p-1.5 text-gray-400 hover:text-primary transition-colors" aria-label="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Delete this coupon?')) {
                          setDeletingId(coupon.id)
                          deleteMutation.mutate(coupon.id)
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Delete"
                      disabled={deletingId === coupon.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-500">No coupons found</div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-100">
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  )
}
