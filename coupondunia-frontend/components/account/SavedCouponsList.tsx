import type { Coupon } from '@/types'
import { CouponList } from '@/components/coupons/CouponList'

interface SavedCouponsListProps {
  coupons: Coupon[]
}

export function SavedCouponsList({ coupons }: SavedCouponsListProps) {
  return <CouponList coupons={coupons} />
}
