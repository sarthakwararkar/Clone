'use client'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { KeyRound, Sparkles, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface LoginPromptModalProps {
  isOpen: boolean
  onClose: () => void
  redirectPath?: string
}

export function LoginPromptModal({ isOpen, onClose, redirectPath }: LoginPromptModalProps) {
  const router = useRouter()

  const handleLoginRedirect = () => {
    onClose()
    const path = redirectPath ? `?next=${encodeURIComponent(redirectPath)}` : ''
    router.push(`/login${path}` as any)
  }

  const handleSignupRedirect = () => {
    onClose()
    const path = redirectPath ? `?next=${encodeURIComponent(redirectPath)}` : ''
    router.push(`/signup${path}` as any)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="text-center py-4 space-y-6">
        {/* Icon Container */}
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 relative">
          <KeyRound className="w-8 h-8 text-primary" />
          <Sparkles className="w-4 h-4 text-amber-500 absolute -top-1 -right-1 animate-bounce" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Unlock Verified Coupons &amp; Deals
          </h2>
          <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
            Members get instant access to verified coupon codes, exclusive discounts, and cashback offers. Log in or create a free account to continue.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            variant="primary"
            className="w-full py-2.5 font-bold shadow-lg shadow-primary/20 text-sm"
            onClick={handleLoginRedirect}
          >
            Log In to Your Account
          </Button>
          
          <Button
            variant="secondary"
            className="w-full py-2.5 font-semibold text-sm"
            onClick={handleSignupRedirect}
          >
            Create a Free Account
          </Button>
        </div>

        {/* Footer info */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
          <span>No credit card required. 100% Free.</span>
        </div>
      </div>
    </Modal>
  )
}
