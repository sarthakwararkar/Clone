'use client'
import { useState } from 'react'
import { Trash2, Bell } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDealAlerts } from '@/hooks/useDealAlerts'
import { alertSchema, type AlertSchemaValues } from '@/schemas/alertSchema'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'

export function AlertsList() {
  const { alerts, isLoading, subscribe, unsubscribe, isSubscribing } = useDealAlerts()
  const [modalOpen, setModalOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AlertSchemaValues>({
    resolver: zodResolver(alertSchema),
  })

  const onSubmit = (data: AlertSchemaValues) => {
    subscribe(data)
    reset()
    setModalOpen(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Deal Alerts</h2>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          <Bell className="w-4 h-4" /> Add Alert
        </Button>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No alerts yet. Set up alerts to get notified about deals.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {alert.store?.name ?? alert.category?.name ?? 'All Deals'}
                </p>
                <p className="text-xs text-gray-500">{alert.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${alert.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {alert.is_active ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => unsubscribe(alert.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Delete alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Deal Alert">
        <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(onSubmit)(e) }} className="space-y-4">
          <div>
            <label htmlFor="alert-email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email address
            </label>
            <input
              id="alert-email"
              type="email"
              {...register('email')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <Button type="submit" variant="primary" className="w-full" loading={isSubscribing}>
            Subscribe
          </Button>
        </form>
      </Modal>
    </div>
  )
}
