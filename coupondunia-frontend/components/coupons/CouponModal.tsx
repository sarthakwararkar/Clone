'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import type { Coupon } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { ensureExternalLink } from '@/lib/utils'

interface CouponModalProps {
  coupon: Coupon
  isOpen: boolean
  onClose: () => void
}

export function CouponModal({ coupon, isOpen, onClose }: CouponModalProps) {
  const [copied, setCopied] = useState(false)
  const [reported, setReported] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const initials = coupon.store.name.slice(0, 2).toUpperCase()

  // Fire click tracking on mount
  useEffect(() => {
    if (isOpen) {
      api.clickCoupon(coupon.id).catch(() => {})
    }
  }, [isOpen, coupon.id])

  // Countdown to auto-close
  useEffect(() => {
    if (!isOpen) {
      setCountdown(60)
      return
    }
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval)
          onClose()
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isOpen, onClose])

  const handleCopy = useCallback(async () => {
    if (!coupon.code) return
    try {
      await navigator.clipboard.writeText(coupon.code)
      setCopied(true)
      toast.success('Coupon code copied! ✓')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy code')
    }
  }, [coupon.code])

  const handleReport = async (worked: boolean) => {
    try {
      await api.reportCoupon(coupon.id, worked)
      setReported(true)
    } catch {
      toast.error('Failed to submit feedback')
    }
  }

  const handleVisitStore = () => {
    window.open(ensureExternalLink(coupon.affiliate_url), '_blank', 'noopener,noreferrer')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg border border-gray-100 bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
          {coupon.store.logo_url ? (
            <Image src={coupon.store.logo_url} alt={coupon.store.name} width={40} height={40} className="object-contain" />
          ) : (
            <div className="w-full h-full bg-primary-light flex items-center justify-center">
              <span className="text-primary font-bold text-sm">{initials}</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-500">{coupon.store.name}</p>
          <p className="text-sm font-semibold text-gray-900 line-clamp-1">{coupon.title}</p>
        </div>
      </div>

      {coupon.coupon_type === 'code' && coupon.code ? (
        <>
          <p className="text-sm text-gray-500 mb-3">Your Coupon Code</p>
          <div className="bg-gray-50 border-2 border-dashed border-primary rounded-xl p-6 text-center mb-4">
            <p className="text-3xl font-mono font-bold text-primary tracking-widest select-all">
              {coupon.code}
            </p>
          </div>

          <Button
            variant="secondary"
            className="w-full mb-3"
            onClick={() => void handleCopy()}
          >
            {copied ? '✓ Copied!' : 'Copy Code'}
          </Button>
        </>
      ) : null}

      <Button
        variant="primary"
        className="w-full mb-5"
        onClick={handleVisitStore}
      >
        Go to {coupon.store.name} →
      </Button>

      {/* Report section */}
      <div className="border-t border-gray-100 pt-4">
        {reported ? (
          <p className="text-center text-sm text-gray-500 py-2">Thanks for your feedback! 🙏</p>
        ) : (
          <>
            <p className="text-center text-sm text-gray-500 mb-3">Did this work?</p>
            <div className="flex gap-3">
              <button
                onClick={() => void handleReport(true)}
                className="flex-1 py-2 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 text-sm font-medium transition-colors"
              >
                👍 Worked!
              </button>
              <button
                onClick={() => void handleReport(false)}
                className="flex-1 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition-colors"
              >
                👎 Didn&apos;t Work
              </button>
            </div>
          </>
        )}
      </div>

      {/* Countdown */}
      <p className="text-center text-xs text-gray-400 mt-4">
        Auto-closing in {countdown}s
      </p>
    </Modal>
  )
}
