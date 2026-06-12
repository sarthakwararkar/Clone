import type { Coupon } from '@/types'
import { CouponCard } from './CouponCard'

interface CouponGridProps {
  coupons: Coupon[]
  view?: 'grid' | 'list'
}

export function CouponGrid({ coupons, view = 'grid' }: CouponGridProps) {
  return (
    <div className={
      view === 'grid'
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
        : 'flex flex-col gap-3'
    }>
      {coupons.map((coupon) => (
        <CouponCard key={coupon.id} coupon={coupon} view={view} />
      ))}
    </div>
  )
}
