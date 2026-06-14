import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { SignupForm } from '@/components/auth/SignupForm'
import { OAuthButtons } from '@/components/auth/OAuthButtons'

export const metadata: Metadata = {
  title: 'Sign Up Free — DealDhamal',
  description: 'Create a free DealDhamal account to save coupons and get deal alerts.',
  robots: { index: false, follow: false },
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const params = await searchParams
  const next = params.next ?? '/'
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect(next as any)
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm mt-8">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-black text-gray-900">Create Account</h1>
        <p className="text-sm text-gray-500">Sign up to unlock cashback benefits and exclusive deals</p>
      </div>

      <Suspense fallback={<div className="h-48 flex items-center justify-center text-sm text-gray-400">Loading form...</div>}>
        <SignupForm />
      </Suspense>

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
