'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/Button'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().regex(/^$|^[0-9]{10}$/, 'Phone must be exactly 10 digits').optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  dob: z.string().optional().or(z.literal('')),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function ProfileForm() {
  const { user, setUser, session } = useAuthStore()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: '',
      gender: '',
      dob: '',
    },
  })

  // Load name and local storage values
  useEffect(() => {
    if (!user) return
    
    // Set Name
    setValue('name', user.name ?? '')

    // Set extra local storage values
    const stored = localStorage.getItem(`profile_extra:${user.id}`)
    if (stored) {
      try {
        const extra = JSON.parse(stored)
        setValue('phone', extra.phone ?? '', { shouldDirty: false })
        setValue('gender', extra.gender ?? '', { shouldDirty: false })
        setValue('dob', extra.dob ?? '', { shouldDirty: false })
      } catch {
        // ignore
      }
    }
  }, [user, setValue])

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return
    try {
      // 1. Save name (and avatar) to the backend API
      const updated = await api.updateMe({ name: data.name })
      if (session) setUser(updated, session)

      // 2. Save phone, gender, dob locally
      const extraData = {
        phone: data.phone ?? '',
        gender: data.gender ?? '',
        dob: data.dob ?? '',
      }
      localStorage.setItem(`profile_extra:${user.id}`, JSON.stringify(extraData))

      // Reset form state to not dirty
      reset(data)
      toast.success('Profile updated successfully! ✓')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(onSubmit)(e) }} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-4">
      <h3 className="font-extrabold text-gray-900 text-sm">Personal Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="profile-name" className="block text-[11px] font-bold text-gray-750 mb-1">
            Full Name
          </label>
          <input
            id="profile-name"
            type="text"
            required
            {...register('name')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder="John Doe"
          />
          {errors.name && <p className="mt-1 text-[10px] text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="profile-email" className="block text-[11px] font-bold text-gray-750 mb-1">
            Email address
          </label>
          <input
            id="profile-email"
            type="email"
            value={user?.email ?? ''}
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-gray-50 text-gray-400 cursor-not-allowed"
          />
          <p className="mt-1 text-[9px] text-gray-400 font-medium">Email address cannot be changed</p>
        </div>

        <div>
          <label htmlFor="profile-phone" className="block text-[11px] font-bold text-gray-750 mb-1">
            Mobile Number
          </label>
          <input
            id="profile-phone"
            type="tel"
            maxLength={10}
            {...register('phone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder="9876543210"
          />
          {errors.phone && <p className="mt-1 text-[10px] text-red-500">{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="profile-dob" className="block text-[11px] font-bold text-gray-750 mb-1">
            Date of Birth
          </label>
          <input
            id="profile-dob"
            type="date"
            {...register('dob')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-700"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-gray-750 mb-1.5">Gender</label>
          <div className="flex items-center gap-4">
            {['male', 'female', 'other'].map((genderOption) => (
              <label key={genderOption} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-650 cursor-pointer">
                <input
                  type="radio"
                  value={genderOption}
                  {...register('gender')}
                  className="w-3.5 h-3.5 text-primary border-gray-300 focus:ring-primary/30"
                />
                <span className="capitalize">{genderOption}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={!isDirty}
          className="w-full sm:w-auto text-xs py-2.5 font-bold cursor-pointer"
        >
          Save Changes
        </Button>
      </div>
    </form>
  )
}
