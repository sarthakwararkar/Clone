'use client'

import { useAuthStore } from '@/stores/useAuthStore'
import { AvatarUpload } from '@/components/account/AvatarUpload'
import { ProfileForm } from '@/components/account/ProfileForm'
import { PasswordChangeForm } from '@/components/account/PasswordChangeForm'

export function ProfileDashboard() {
  const { user } = useAuthStore()
  const isOAuth = user?.provider === 'google'

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your personal profile and security settings.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card & Avatar */}
        <div className="lg:col-span-1">
          <AvatarUpload />
        </div>
        
        {/* Profile Details & Password Forms */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileForm />
          {!isOAuth && <PasswordChangeForm />}
        </div>
      </div>
    </div>
  )
}
