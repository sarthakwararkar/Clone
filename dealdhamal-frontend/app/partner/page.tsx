import type { Metadata } from 'next'
import { PartnerForm } from './PartnerForm'
import { Handshake, Award, Users, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Partner with Us | DealDhamal',
  description: 'Partner with DealDhamal to list your store, run promotional campaigns, or display banner advertisements to millions of active shoppers.',
}

export default function PartnerPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-8 py-12 mb-10 border border-gray-700/50">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #E84141 0%, transparent 60%)' }} />
        <div className="relative flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
            <Handshake className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Partner with Us</h1>
            <p className="text-gray-400 text-sm mt-0.5">Grow your brand and sales with DealDhamal</p>
          </div>
        </div>
        <p className="text-sm text-gray-300 max-w-2xl mt-4 leading-relaxed">
          List your coupons, promote exclusive deals, or run high-impact campaigns on India's premier coupon and cashback aggregation platform. Reach millions of intent-driven shoppers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left side: Info/Value Props */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-black text-gray-900 mb-6">Why Partner with Us?</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 text-primary border border-red-100">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">High-Intent Audience</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Connect directly with shoppers who are actively looking for discount codes and ready to purchase.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 text-accent border border-orange-100">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">Boost Conversions</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Improve your checkout success rate and reduce cart abandonment by displaying validated offers.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 text-success border border-green-100">
                  <Award className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">Premium Placements</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Get featured on our homepage, top store lists, categories, newsletter, or banner ads for maximum visibility.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
            <h3 className="font-extrabold text-sm text-gray-900 mb-2">Need direct assistance?</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              For enterprise inquiries or direct partnership deals, you can also reach us via email.
            </p>
            <a 
              href="mailto:beastultra59@gmail.com" 
              className="text-xs text-primary font-bold hover:underline"
            >
              beastultra59@gmail.com →
            </a>
          </div>
        </div>

        {/* Right side: Form Component */}
        <div className="lg:col-span-2">
          <PartnerForm />
        </div>
      </div>
    </div>
  )
}
