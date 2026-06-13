'use client'
import { useRef } from 'react'
import Image from 'next/image'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/useAuthStore'
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload'
import { api } from '@/lib/api'

export function AvatarUpload() {
  const { user, setUser, session } = useAuthStore()
  const { upload, uploading, progress } = useCloudinaryUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Simple file validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB')
      return
    }

    try {
      toast.info('Uploading avatar...')
      const secureUrl = await upload(file, 'avatars')
      const updated = await api.updateMe({ avatar_url: secureUrl })
      
      if (session) {
        setUser(updated, session)
      }
      toast.success('Profile picture updated!')
    } catch (err) {
      toast.error('Failed to upload profile picture')
    }
  }

  const initials = user?.name 
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email ? user.email.slice(0, 2).toUpperCase() : 'U'

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
      {/* Avatar Display */}
      <div className="relative w-24 h-24 rounded-full border-2 border-primary/10 overflow-hidden flex items-center justify-center bg-primary-light">
        {user?.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={user.name ?? 'User Avatar'}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="text-2xl font-black text-primary tracking-wider">
            {initials}
          </span>
        )}

        {/* Hover Overlay */}
        <button
          onClick={handleButtonClick}
          disabled={uploading}
          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-200"
          aria-label="Upload profile picture"
        >
          <Camera className="w-6 h-6 text-white" />
        </button>

        {/* Uploading State Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-[10px] font-bold mt-1">{progress}%</span>
          </div>
        )}
      </div>

      {/* Button & Info */}
      <div className="text-center space-y-1">
        <h3 className="font-extrabold text-sm text-gray-900 leading-tight">
          {user?.name ?? 'Account User'}
        </h3>
        <p className="text-xs text-gray-400 truncate max-w-[180px]">
          {user?.email}
        </p>
        <button
          onClick={handleButtonClick}
          disabled={uploading}
          className="mt-2 text-xs font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer inline-flex items-center gap-1"
        >
          Change Avatar
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  )
}
