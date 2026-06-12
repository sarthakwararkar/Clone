'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { api } from '@/lib/api'

interface CouponReportButtonProps {
  couponId: string
}

export function CouponReportButton({ couponId }: CouponReportButtonProps) {
  const [reported, setReported] = useState(false)

  const handleReport = async (worked: boolean) => {
    try {
      await api.reportCoupon(couponId, worked)
      setReported(true)
      toast.success('Thanks for your feedback!')
    } catch {
      toast.error('Failed to submit feedback')
    }
  }

  if (reported) {
    return <p className="text-center text-sm text-gray-500 py-2">Thanks for your feedback! 🙏</p>
  }

  return (
    <div className="flex items-center gap-3 justify-center">
      <p className="text-sm text-gray-500">Did this work?</p>
      <button
        onClick={() => void handleReport(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 text-sm"
      >
        <ThumbsUp className="w-4 h-4" /> Worked!
      </button>
      <button
        onClick={() => void handleReport(false)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-sm"
      >
        <ThumbsDown className="w-4 h-4" /> Didn&apos;t Work
      </button>
    </div>
  )
}
