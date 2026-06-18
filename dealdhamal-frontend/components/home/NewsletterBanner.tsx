'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Mail } from 'lucide-react'
import { trackAlertSubscribe } from '@/lib/analytics'

export function NewsletterBanner() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    setLoading(true)
    try {
      await api.subscribeNewsletter(email)
      setSubscribed(true)
      trackAlertSubscribe()
      toast.success('Subscribed! You\'ll get the best deals in your inbox ✓')
    } catch {
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-gradient-to-r from-primary to-red-600 rounded-2xl p-8 md:p-12 text-center">
      <div className="max-w-xl mx-auto">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Get the best deals in your inbox
        </h2>
        <p className="text-red-100 mb-6">
          Subscribe to our newsletter and never miss a deal again.
        </p>

        {subscribed ? (
          <div className="bg-white/20 rounded-xl px-6 py-4 text-white font-semibold">
            🎉 You&apos;re subscribed! Check your inbox.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleSubmit() }}
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
            />
            <button
              onClick={() => void handleSubmit()}
              disabled={loading}
              className="bg-white text-primary font-semibold px-6 py-3 rounded-lg hover:bg-primary-light transition-colors disabled:opacity-70 whitespace-nowrap text-sm"
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
