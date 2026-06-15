export const dynamic = 'force-dynamic'

import { SavedCouponsList } from '@/components/account/SavedCouponsList'

export default function SavedCouponsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Saved Coupons</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your bookmarked collection of active discount codes and shopping deals.
        </p>
      </div>

      <SavedCouponsList />
    </div>
  )
}
