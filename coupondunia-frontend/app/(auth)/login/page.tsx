import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from '@/components/auth/LoginForm'
import { OAuthButtons } from '@/components/auth/OAuthButtons'

export const metadata: Metadata = {
  title: 'Sign In | CouponIndia',
  description: 'Sign in to your CouponIndia account to save coupons, track cashback, and manage deal alerts.',
}

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect('/')
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm mt-8">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-black text-gray-900">Welcome Back</h1>
        <p className="text-sm text-gray-500">Sign in to access your saved coupons &amp; cashback</p>
      </div>

      <LoginForm />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-100"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-400">Or continue with</span>
        </div>
      </div>

      <OAuthButtons />
    </div>
  )
}
