'use client'

import { useAuthStore } from '@/stores/useAuthStore'
import { AvatarUpload } from '@/components/account/AvatarUpload'
import { WalletOverview } from '@/components/account/WalletOverview'
import { ProfileForm } from '@/components/account/ProfileForm'
import { PasswordChangeForm } from '@/components/account/PasswordChangeForm'

export function ProfileDashboard() {
  const { user } = useAuthStore()
  const isOAuth = user?.provider === 'google'

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-xl font-bold text-gray-800">My Account Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your personal profile, cashback wallet withdrawals, and security settings.
        </p>
      </div>
      
      {/* Top Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card & Avatar */}
        <div className="lg:col-span-1">
          <AvatarUpload />
        </div>
        
        {/* Cashback Wallet */}
        <div className="lg:col-span-2">
          <WalletOverview />
        </div>
      </div>
      
      {/* Bottom Section Grid */}
      <div className={isOAuth ? "w-full" : "grid grid-cols-1 lg:grid-cols-2 gap-6"}>
        {/* Profile Details Form */}
        <ProfileForm />
        
        {/* Change Password Form */}
        {!isOAuth && <PasswordChangeForm />}
      </div>
    </div>
  )
}
