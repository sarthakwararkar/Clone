import type { Coupon } from '@/types'
import { CouponCard } from './CouponCard'

interface CouponListProps {
  coupons: Coupon[]
}

export function CouponList({ coupons }: CouponListProps) {
  return (
    <div className="flex flex-col gap-3">
      {coupons.map((coupon) => (
        <CouponCard key={coupon.id} coupon={coupon} view="list" />
      ))}
    </div>
  )
}
