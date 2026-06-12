'use client'
import { AlertsList } from '@/components/account/AlertsList'

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Deal Alerts</h1>
        <p className="text-sm text-gray-500 mt-1">
          Subscribe to email updates for discounts and promo codes from your favorite categories and stores.
        </p>
      </div>

      <AlertsList />
    </div>
  )
}
