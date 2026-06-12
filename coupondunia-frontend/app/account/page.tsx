'use client'
import { ProfileForm } from '@/components/account/ProfileForm'

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your personal information and contact details.
        </p>
      </div>
      
      <ProfileForm />
    </div>
  )
}
