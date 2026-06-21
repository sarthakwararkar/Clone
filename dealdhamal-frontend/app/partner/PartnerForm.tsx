'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { CheckCircle2, AlertCircle, Building, Mail, User, Globe, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

const partnerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid business email'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  website: z.string().url('Please enter a valid URL (including http:// or https://)').optional().or(z.literal('')),
  type: z.string().min(1, 'Please select a partnership type'),
  message: z.string().min(10, 'Proposal details must be at least 10 characters'),
})

type PartnerFormValues = z.infer<typeof partnerFormSchema>

export function PartnerForm() {
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      website: '',
      type: '',
      message: '',
    }
  })

  const onSubmit = async (values: PartnerFormValues) => {
    setSubmitError(null)
    try {
      const response = await fetch('/api/partner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json() as any

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong while submitting the proposal.')
      }

      toast.success('Partnership proposal submitted successfully!')
      setSubmitted(true)
      reset()
    } catch (err: any) {
      const msg = err.message || 'Failed to submit proposal. Please try again later.'
      setSubmitError(msg)
      toast.error(msg)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-green-50 text-success rounded-full flex items-center justify-center mb-6 border border-green-100">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-3">Proposal Sent Successfully!</h2>
        <p className="text-sm text-gray-500 max-w-md mb-8 leading-relaxed">
          Thank you for reaching out to DealDhamal. We have received your partnership inquiry and will review it. Our team will get back to you within 2 business days.
        </p>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => setSubmitted(false)}>
            Send Another Request
          </Button>
          <Link href="/" passHref legacyBehavior>
            <a className="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 px-4 py-2 text-sm bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-sm hover:shadow-md">
              Go to Homepage
            </a>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-10">
      <div className="mb-8">
        <h2 className="text-lg font-black text-gray-900 mb-1">Partnership Form</h2>
        <p className="text-xs text-gray-400">Fill in the details below to propose a partnership with us.</p>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl mb-6 flex gap-3 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-bold">Submission Failed</p>
            <p className="mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(onSubmit)(e) }} className="space-y-6" autoComplete="off">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label htmlFor="partner-name" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Contact Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input
                id="partner-name"
                type="text"
                autoComplete="off"
                {...register('name')}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-450"
                placeholder="John Doe"
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="partner-email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Business Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="partner-email"
                type="email"
                autoComplete="off"
                {...register('email')}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-450"
                placeholder="partner@company.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Name */}
          <div>
            <label htmlFor="partner-company" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Company / Brand Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Building className="w-4 h-4" />
              </span>
              <input
                id="partner-company"
                type="text"
                autoComplete="off"
                {...register('company')}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-450"
                placeholder="Acme Corp"
              />
            </div>
            {errors.company && <p className="mt-1 text-xs text-red-500 font-medium">{errors.company.message}</p>}
          </div>

          {/* Website URL */}
          <div>
            <label htmlFor="partner-website" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Website URL (Optional)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Globe className="w-4 h-4" />
              </span>
              <input
                id="partner-website"
                type="url"
                autoComplete="off"
                {...register('website')}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-450"
                placeholder="https://company.com"
              />
            </div>
            {errors.website && <p className="mt-1 text-xs text-red-500 font-medium">{errors.website.message}</p>}
          </div>
        </div>

        {/* Partnership Type */}
        <div>
          <label htmlFor="partner-type" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Partnership Type
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <FileText className="w-4 h-4" />
            </span>
            <select
              id="partner-type"
              {...register('type')}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-450 appearance-none"
            >
              <option value="" disabled>Select partnership type</option>
              <option value="Store Listing (Add my store/coupons)">Submit Store / Coupons</option>
              <option value="Promotional Campaign (Featured placement)">Featured Promotional Campaign</option>
              <option value="Banner Ads / Advertising">Banner Ads & Placements</option>
              <option value="Affiliate Network / Agency Deal">Affiliate Network Integration</option>
              <option value="Other">Other Cooperation Inquiry</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
          {errors.type && <p className="mt-1 text-xs text-red-500 font-medium">{errors.type.message}</p>}
        </div>

        {/* Message */}
        <div>
          <label htmlFor="partner-message" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Proposal Details / Message
          </label>
          <textarea
            id="partner-message"
            rows={5}
            {...register('message')}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-450"
            placeholder="Please detail your campaign plans, target commission rates, preferred stores, or coupon submissions..."
          />
          {errors.message && <p className="mt-1 text-xs text-red-500 font-medium">{errors.message.message}</p>}
        </div>

        <Button type="submit" variant="primary" className="w-full py-3" loading={isSubmitting}>
          Submit Proposal
        </Button>
      </form>
    </div>
  )
}
