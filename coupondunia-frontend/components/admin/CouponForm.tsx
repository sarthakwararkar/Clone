'use client'
import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { Loader2, Search, Check, ChevronsUpDown, X } from 'lucide-react'
import type { Coupon, Store } from '@/types'
import { couponSchema, type CouponSchemaValues } from '@/schemas/couponSchema'
import { api } from '@/lib/api'

interface CouponFormProps {
  initialData?: Coupon
  stores: Store[]
}

export function CouponForm({ initialData, stores }: CouponFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  
  // Searchable select state
  const [storeSearch, setStoreSearch] = useState('')
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const form = useForm<CouponSchemaValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      store_id: initialData?.store_id ?? '',
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      coupon_type: initialData?.coupon_type ?? 'code',
      code: initialData?.code ?? '',
      discount_value: initialData?.discount_value ?? '',
      affiliate_url: initialData?.affiliate_url ?? '',
      expires_at: initialData?.expires_at
        ? new Date(initialData.expires_at).toISOString().split('T')[0]
        : '',
      is_verified: initialData?.is_verified ?? false,
      is_featured: initialData?.is_featured ?? false,
      is_exclusive: initialData?.is_exclusive ?? false,
    },
  })

  const watchType = form.watch('coupon_type')
  const watchStoreId = form.watch('store_id')

  // Find currently selected store
  const selectedStore = stores.find((s) => s.id === watchStoreId)

  // Filter stores based on search query
  const filteredStores = stores.filter((s) =>
    s.name.toLowerCase().includes(storeSearch.toLowerCase())
  )

  // Handle click outside searchable store select to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setStoreDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Auto-fill affiliate URL of selected store if coupon's affiliate URL is empty
  useEffect(() => {
    if (selectedStore && !form.getValues('affiliate_url')) {
      form.setValue('affiliate_url', selectedStore.affiliate_url ?? '')
    }
  }, [watchStoreId, selectedStore, form])

  const generateRandomCode = () => {
    const prefixes = ['SAVE', 'GET', 'OFFER', 'DEAL', 'DD', 'FLAT', 'DISCOUNT']
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const numbers = Math.floor(10 + Math.random() * 90) // e.g. 10 - 99
    const suffix = Math.random().toString(36).substring(2, 5).toUpperCase() // 3 letters
    const generated = `${prefix}${numbers}${suffix}`
    form.setValue('code', generated, { shouldValidate: true })
  }

  const onSubmit = async (values: CouponSchemaValues) => {
    setSubmitting(true)
    try {
      // Format the date to ISO string for backend
      const formattedValues = {
        ...values,
        expires_at: values.expires_at ? new Date(values.expires_at).toISOString() : undefined,
        code: values.coupon_type === 'code' ? values.code : undefined,
      }

      if (initialData) {
        await api.adminUpdateCoupon(initialData.id, formattedValues)
        toast.success('Coupon updated successfully')
      } else {
        await api.adminCreateCoupon(formattedValues)
        toast.success('Coupon created successfully')
      }
      router.push('/admin/coupons' as any)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message ?? 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        {initialData ? 'Edit Coupon' : 'Create New Coupon'}
      </h2>

      <div className="space-y-5">
        {/* Searchable Store Select */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Store
          </label>
          <div
            onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg cursor-pointer bg-white text-sm hover:bg-gray-50 focus-within:ring-2 focus-within:ring-primary/30"
          >
            {selectedStore ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded overflow-hidden bg-white border border-gray-100 flex items-center justify-center p-0.5">
                  {selectedStore.logo_url ? (
                    <img
                      src={selectedStore.logo_url}
                      alt={selectedStore.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-primary">
                      {selectedStore.name[0]}
                    </span>
                  )}
                </div>
                <span className="text-gray-800 font-medium">{selectedStore.name}</span>
              </div>
            ) : (
              <span className="text-gray-400">Select store...</span>
            )}
            <ChevronsUpDown className="w-4 h-4 text-gray-400" />
          </div>

          {storeDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-y-auto p-1">
              <div className="flex items-center border-b border-gray-100 px-2.5 py-1.5 mb-1">
                <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  className="w-full text-xs focus:outline-none py-1 bg-transparent"
                  onClick={(e) => e.stopPropagation()}
                />
                {storeSearch && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setStoreSearch('')
                    }}
                    className="p-0.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {filteredStores.length === 0 ? (
                <div className="text-xs text-gray-500 py-3 text-center">No stores found</div>
              ) : (
                filteredStores.map((store) => (
                  <div
                    key={store.id}
                    onClick={() => {
                      form.setValue('store_id', store.id, { shouldValidate: true })
                      setStoreDropdownOpen(false)
                      setStoreSearch('')
                    }}
                    className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded overflow-hidden bg-white border border-gray-100 flex items-center justify-center p-0.5">
                        {store.logo_url ? (
                          <img
                            src={store.logo_url}
                            alt={store.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-[10px] font-bold text-primary">
                            {store.name[0]}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-800 font-medium">{store.name}</span>
                    </div>
                    {store.id === watchStoreId && <Check className="w-3.5 h-3.5 text-primary" />}
                  </div>
                ))
              )}
            </div>
          )}
          {form.formState.errors.store_id && (
            <p className="text-xs text-red-500 mt-1">{form.formState.errors.store_id.message}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Coupon Title
          </label>
          <input
            type="text"
            {...form.register('title')}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g. Flat 30% Off on Sitewide Orders"
          />
          {form.formState.errors.title && (
            <p className="text-xs text-red-500 mt-1">{form.formState.errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            {...form.register('description')}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Specify coupon details, exclusions, and requirements..."
          />
          {form.formState.errors.description && (
            <p className="text-xs text-red-500 mt-1">{form.formState.errors.description.message}</p>
          )}
        </div>

        {/* Coupon Type Radio */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Coupon Type
          </label>
          <div className="flex gap-4">
            {['code', 'deal', 'cashback'].map((t) => (
              <label
                key={t}
                className="flex items-center gap-2 cursor-pointer border border-gray-100 hover:border-primary/20 rounded-xl px-4 py-3 select-none flex-1 transition-colors hover:bg-gray-50"
              >
                <input
                  type="radio"
                  value={t}
                  {...form.register('coupon_type')}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className="text-sm font-semibold text-gray-700 capitalize">{t}</span>
              </label>
            ))}
          </div>
          {form.formState.errors.coupon_type && (
            <p className="text-xs text-red-500 mt-1">{form.formState.errors.coupon_type.message}</p>
          )}
        </div>

        {/* Code Input (Only visible for CODE type) */}
        {watchType === 'code' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Coupon Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                {...form.register('code')}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                placeholder="e.g. EXTRA30"
              />
              <button
                type="button"
                onClick={generateRandomCode}
                className="px-3 py-2 text-xs border border-primary text-primary hover:bg-primary-light transition-colors font-medium rounded-lg whitespace-nowrap"
              >
                Generate Code
              </button>
            </div>
            {form.formState.errors.code && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.code.message}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Discount Value */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Discount Value (Badge Text)
            </label>
            <input
              type="text"
              {...form.register('discount_value')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. 30% OFF or ₹150 OFF"
            />
            {form.formState.errors.discount_value && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.discount_value.message}
              </p>
            )}
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Expiry Date
            </label>
            <input
              type="date"
              {...form.register('expires_at')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {form.formState.errors.expires_at && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.expires_at.message}</p>
            )}
          </div>
        </div>

        {/* Affiliate URL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Affiliate Link
          </label>
          <input
            type="text"
            {...form.register('affiliate_url')}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g. https://ad.admitad.com/goto/..."
          />
          {form.formState.errors.affiliate_url && (
            <p className="text-xs text-red-500 mt-1">{form.formState.errors.affiliate_url.message}</p>
          )}
        </div>

        {/* Toggles (Verified, Featured, Exclusive) */}
        <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...form.register('is_verified')}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-semibold text-gray-700">Verified</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...form.register('is_featured')}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-semibold text-gray-700">Featured (Home)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...form.register('is_exclusive')}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-semibold text-gray-700">Exclusive Deal</span>
          </label>
        </div>

        {/* Form Buttons */}
        <div className="flex gap-4 pt-4 justify-end border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push('/admin/coupons' as any)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={form.handleSubmit(onSubmit)}
            className="px-5 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {initialData ? 'Save Changes' : 'Create Coupon'}
          </button>
        </div>
      </div>
    </div>
  )
}
