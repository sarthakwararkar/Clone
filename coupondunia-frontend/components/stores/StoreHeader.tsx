import Image from 'next/image'
import type { Store } from '@/types'
import { StoreCashbackBadge } from './StoreCashbackBadge'
import { Button } from '@/components/ui/Button'
import { ExternalLink, Tag } from 'lucide-react'
import { ensureExternalLink } from '@/lib/utils'

interface StoreHeaderProps {
  store: Store
  couponCount: number
}

export function StoreHeader({ store, couponCount }: StoreHeaderProps) {
  const initials = store.name.slice(0, 2).toUpperCase()

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Logo */}
          <div className="w-24 h-24 rounded-2xl border border-gray-200 bg-white shadow-sm flex items-center justify-center overflow-hidden p-2 flex-shrink-0">
            {store.logo_url ? (
              <Image
                src={store.logo_url}
                alt={store.name}
                width={96}
                height={96}
                className="object-contain w-full h-full"
                priority
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-primary-light flex items-center justify-center">
                <span className="text-primary font-bold text-2xl">{initials}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>

            {store.description && (
              <p className="text-gray-600 mt-1 max-w-prose text-sm leading-relaxed">
                {store.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-3">
              {store.cashback_rate && (
                <StoreCashbackBadge rate={store.cashback_rate} />
              )}
              <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                <Tag className="w-3.5 h-3.5" />
                {couponCount} active coupon{couponCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* CTA */}
          {store.affiliate_url && (
            <a
              href={ensureExternalLink(store.affiliate_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md px-6 py-3 text-base"
            >
              <ExternalLink className="w-4 h-4" />
              Visit Store
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
