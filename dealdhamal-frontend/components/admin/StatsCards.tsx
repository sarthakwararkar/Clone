import type { AdminStats } from '@/types'
import { Tag, Store, Users, Clock } from 'lucide-react'

interface StatsCardsProps {
  stats: AdminStats
}

const cards = (stats: AdminStats) => [
  {
    label: 'Total Coupons',
    value: stats.totalCoupons,
    icon: Tag,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Total Stores',
    value: stats.totalStores,
    icon: Store,
    color: 'bg-green-50 text-green-600',
  },
  {
    label: 'Total Users',
    value: stats.totalUsers,
    icon: Users,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    label: 'Expiring This Week',
    value: stats.expiringThisWeek,
    icon: Clock,
    color: 'bg-orange-50 text-orange-600',
  },
]

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards(stats).map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-xl p-5 shadow-sm">
          <div className={`inline-flex p-2.5 rounded-xl ${color} mb-3`}>
            <Icon className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
}
