'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload, X, Loader2 } from 'lucide-react'
import type { Store, Category } from '@/types'
import { storeSchema, type StoreSchemaValues } from '@/schemas/storeSchema'
import { api } from '@/lib/api'

interface StoreFormProps {
  initialData?: Store
  categories: Category[]
}

export function StoreForm({ initialData, categories }: StoreFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo_url ?? null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const form = useForm<StoreSchemaValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      slug: initialData?.slug ?? '',
      website_url: initialData?.website_url ?? '',
      affiliate_url: initialData?.affiliate_url ?? '',
      affiliate_network: (initialData?.affiliate_network as any) ?? 'manual',
      description: initialData?.description ?? '',
      category_id: initialData?.category_id ?? undefined,
      cashback_rate: initialData?.cashback_rate ?? '',
      is_featured: initialData?.is_featured ?? false,
      logo_url: initialData?.logo_url ?? '',
      banner_url: initialData?.banner_url ?? '',
    },
  })

  const watchName = form.watch('name')

  // Auto-generate slug from name (only when creating or if slug is empty)
  useEffect(() => {
    if (!initialData && watchName) {
      const generatedSlug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      form.setValue('slug', generatedSlug, { shouldValidate: true })
    }
  }, [watchName, initialData, form])

  const handleFileChange = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size exceeds 2MB limit')
      return
    }
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      toast.error('Invalid file type. PNG, JPG or WebP only.')
      return
    }

    setSelectedFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const removeLogo = () => {
    setSelectedFile(null)
    setLogoPreview(null)
    form.setValue('logo_url', '')
  }

  const onSubmit = async (values: StoreSchemaValues) => {
    setSubmitting(true)
    try {
      // Build FormData for backend API call (as backend expects multipart/form-data with a "logo" file)
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('slug', values.slug)
      if (values.website_url) formData.append('website_url', values.website_url)
      if (values.affiliate_url) formData.append('affiliate_url', values.affiliate_url)
      if (values.affiliate_network) formData.append('affiliate_network', values.affiliate_network)
      if (values.description) formData.append('description', values.description)
      if (values.category_id !== undefined) formData.append('category_id', String(values.category_id))
      if (values.cashback_rate) formData.append('cashback_rate', values.cashback_rate)
      formData.append('is_featured', String(values.is_featured))
      formData.append('banner_url', values.banner_url ?? '')
      formData.append('logo_url', values.logo_url ?? '')

      if (selectedFile) {
        formData.append('logo', selectedFile)
      }

      if (initialData) {
        await api.adminUpdateStore(initialData.id, formData)
        toast.success('Store updated successfully')
      } else {
        await api.adminCreateStore(formData)
        toast.success('Store created successfully')
      }
      router.push('/admin/stores' as any)
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
        {initialData ? 'Edit Store' : 'Add New Store'}
      </h2>

      {/* Form trigger is a custom onClick handler to respect guidelines */}
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Store Name
          </label>
          <input
            type="text"
            {...form.register('name')}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g. Amazon India"
          />
          {form.formState.errors.name && (
            <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Slug
          </label>
          <input
            type="text"
            {...form.register('slug')}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono text-xs"
            placeholder="e.g. amazon-india"
          />
          {form.formState.errors.slug && (
            <p className="text-xs text-red-500 mt-1">{form.formState.errors.slug.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Website URL
            </label>
            <input
              type="text"
              {...form.register('website_url')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="https://amazon.in"
            />
            {form.formState.errors.website_url && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.website_url.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Affiliate URL
            </label>
            <input
              type="text"
              {...form.register('affiliate_url')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="https://c.track.com/..."
            />
            {form.formState.errors.affiliate_url && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.affiliate_url.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Affiliate Network
            </label>
            <select
              {...form.register('affiliate_network')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="manual">Manual</option>
              <option value="vcommission">vCommission</option>
              <option value="admitad">Admitad</option>
              <option value="cj">CJ Affiliate</option>
            </select>
            {form.formState.errors.affiliate_network && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.affiliate_network.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Category
            </label>
            <select
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value, 10) : undefined
                form.setValue('category_id', val, { shouldValidate: true })
              }}
              value={form.watch('category_id') ?? ''}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {form.formState.errors.category_id && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.category_id.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Cashback Rate
            </label>
            <input
              type="text"
              {...form.register('cashback_rate')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. Up to 8% Cashback"
            />
            {form.formState.errors.cashback_rate && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.cashback_rate.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <input
              type="checkbox"
              id="is_featured"
              {...form.register('is_featured')}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label
              htmlFor="is_featured"
              className="text-sm font-semibold text-gray-700 cursor-pointer select-none"
            >
              Featured Store (Show on homepage)
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            {...form.register('description')}
            rows={4}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Describe the store and savings terms..."
          />
          {form.formState.errors.description && (
            <p className="text-xs text-red-500 mt-1">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Banner Image URL
          </label>
          <input
            type="text"
            {...form.register('banner_url')}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g. https://images.unsplash.com/photo-..."
          />
          {form.formState.errors.banner_url && (
            <p className="text-xs text-red-500 mt-1">{form.formState.errors.banner_url.message}</p>
          )}
        </div>

        {/* Logo Upload Dropzone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Store Logo
          </label>
          {logoPreview ? (
            <div className="relative w-32 h-32 border border-gray-200 rounded-xl overflow-hidden bg-white p-2 flex items-center justify-center">
              <img
                src={logoPreview}
                alt="Store logo preview"
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={removeLogo}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                aria-label="Remove logo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => {
                const el = document.getElementById('logo-file-input')
                if (el) el.click()
              }}
              className="border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors rounded-xl p-8 text-center cursor-pointer bg-gray-50 flex flex-col items-center"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Click or drag store logo here
              </p>
              <p className="text-xs text-gray-400">PNG, JPG, WebP up to 2MB</p>
              <input
                type="file"
                id="logo-file-input"
                className="hidden"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileChange(file)
                }}
              />
            </div>
          )}
        </div>

        {/* Form Submission Button */}
        <div className="flex gap-4 pt-4 justify-end">
          <button
            type="button"
            onClick={() => router.push('/admin/stores' as any)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={form.handleSubmit(onSubmit)}
            className="px-5 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {initialData ? 'Save Changes' : 'Create Store'}
          </button>
        </div>
      </div>
    </div>
  )
}
