'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'

export function useDealAlerts() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.getAlerts(),
    enabled: !!user,
  })

  const subscribeMutation = useMutation({
    mutationFn: (data: { email: string; store_id?: string; category_id?: number }) =>
      api.subscribeAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Alert subscribed! ✓')
    },
    onError: () => {
      toast.error('Failed to subscribe to alert')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Alert removed')
    },
    onError: () => {
      toast.error('Failed to remove alert')
    },
  })

  return {
    alerts,
    isLoading,
    subscribe: subscribeMutation.mutate,
    unsubscribe: deleteMutation.mutate,
    isSubscribing: subscribeMutation.isPending,
  }
}
