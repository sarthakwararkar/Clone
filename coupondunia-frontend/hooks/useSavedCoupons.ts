'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'

export function useSavedCoupons() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const { data: savedCoupons = [], isLoading } = useQuery({
    queryKey: ['savedCoupons'],
    queryFn: () => api.getSavedCoupons(),
    enabled: !!user,
  })

  const saveMutation = useMutation({
    mutationFn: (id: string) => api.saveCoupon(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['savedCoupons'] })
      const previous = queryClient.getQueryData(['savedCoupons'])
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['savedCoupons'], context.previous)
      }
      toast.error('Failed to save coupon')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedCoupons'] })
      toast.success('Coupon saved! ✓')
    },
  })

  const unsaveMutation = useMutation({
    mutationFn: (id: string) => api.unsaveCoupon(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['savedCoupons'] })
      const previous = queryClient.getQueryData(['savedCoupons'])
      return { previous, id }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['savedCoupons'], context.previous)
      }
      toast.error('Failed to unsave coupon')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedCoupons'] })
    },
  })

  const isSaved = (couponId: string): boolean => {
    return savedCoupons.some((c) => c.id === couponId)
  }

  return {
    savedCoupons,
    isLoading,
    isSaved,
    save: saveMutation.mutate,
    unsave: unsaveMutation.mutate,
    isSaving: saveMutation.isPending,
    isUnsaving: unsaveMutation.isPending,
  }
}
