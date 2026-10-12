'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log client error for debugging / telemetry
    console.error('Captured client application error:', error)
  }, [error])

  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-primary flex items-center justify-center mb-5">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 font-sans">
          Temporarily Unavailable
        </h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed font-sans">
          We encountered a display issue while rendering this page. You can try reloading or navigate back to the latest verified coupons.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reload Page
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Explore Deals
          </Link>
        </div>
      </div>
    </div>
  )
}
