'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/Button'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function ProfileForm() {
  const { user, setUser, session } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '' },
  })

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const updated = await api.updateMe(data)
      if (session) setUser(updated, session)
      toast.success('Profile updated! ✓')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(onSubmit)(e) }} className="bg-white rounded-xl p-6 shadow-sm space-y-5">
      <h2 className="text-lg font-bold text-gray-900">Profile Settings</h2>

      <div>
        <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1.5">
          Email address
        </label>
        <input
          id="profile-email"
          type="email"
          value={user?.email ?? ''}
          disabled
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
      </div>

      <div>
        <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1.5">
          Full Name
        </label>
        <input
          id="profile-name"
          type="text"
          {...register('name')}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <Button
        type="submit"
        variant="primary"
        loading={isSubmitting}
        disabled={!isDirty}
        className="w-full sm:w-auto"
      >
        Save Changes
      </Button>
    </form>
  )
}
