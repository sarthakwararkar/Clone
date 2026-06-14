import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | DealDhamal',
  description: 'Read the Terms of Service for DealDhamal — governing your use of our coupon and cashback aggregation platform.',
}

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-8 py-12 mb-10 border border-gray-700/50">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #E84141 0%, transparent 60%)' }} />
        <div className="relative flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Terms of Service</h1>
            <p className="text-gray-400 text-sm mt-0.5">DealDhamal</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-gray-400 mt-2">
          <span><span className="text-gray-500 font-semibold uppercase tracking-wide mr-1">Effective:</span> June 13, 2026</span>
          <span><span className="text-gray-500 font-semibold uppercase tracking-wide mr-1">Last Updated:</span> June 13, 2026</span>
        </div>
      </div>

      {/* Body */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 md:px-10 py-10 space-y-10 text-gray-700 text-sm leading-relaxed">

        {/* Section 1 */}
        <Section id="introduction" number="1" title="Introduction and Acceptance">
          <p>
            Welcome to DealDhamal (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). DealDhamal is an online coupon and cashback aggregator platform operated at www.dealdhamal.in that helps users discover discount coupons, promo codes, cashback offers, and deals from various Indian and international merchants and brands.
          </p>
          <p>
            By accessing or using the DealDhamal website, mobile application, browser extension, or any related services (collectively, the &quot;Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). Please read these Terms carefully before using our Platform. If you do not agree to these Terms, you must not access or use the Platform.
          </p>
          <p>
            These Terms constitute a legally binding agreement between you (&quot;User&quot;, &quot;you&quot;) and DealDhamal. Your continued use of the Platform following any updates to these Terms will constitute your acceptance of such changes.
          </p>
        </Section>

        <Divider />

        {/* Section 2 */}
        <Section id="eligibility" number="2" title="Eligibility">
          <p>To use DealDhamal, you must:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Be at least 18 years of age, or the legal age of majority in your jurisdiction</li>
            <li>Have the legal capacity to enter into a binding contract</li>
            <li>Not be prohibited from using the Platform under applicable Indian law or the laws of your jurisdiction</li>
            <li>Provide accurate, current, and complete information when creating an account</li>
          </ul>
          <p>If you are using the Platform on behalf of a business or organisation, you represent that you have authority to bind that entity to these Terms.</p>
        </Section>

        <Divider />

        {/* Section 3 */}
        <Section id="nature-of-services" number="3" title="Nature of Our Services">
          <p>DealDhamal is a coupon and deal aggregation platform. We do not sell products or services directly. Our Platform:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Aggregates and displays coupon codes, promotional offers, cashback deals, and discount information sourced from merchant websites, affiliate networks, and user submissions</li>
            <li>Provides affiliate tracking links that redirect users to third-party merchant websites</li>
            <li>Earns referral commissions from affiliated merchants when users make purchases through links on our Platform</li>
            <li>Allows users to save coupons, set deal alerts, and subscribe to newsletters</li>
          </ul>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-3 text-yellow-800 text-xs">
            <strong>Important:</strong> We are an independent platform and are not affiliated with, endorsed by, or officially connected to any brand or merchant listed on our site unless explicitly stated. All trademarks, brand names, and product names belong to their respective owners.
          </div>
        </Section>

        <Divider />

        {/* Section 4 */}
        <Section id="affiliate-disclosure" number="4" title="Affiliate Disclosure">
          <p>DealDhamal participates in affiliate marketing programs. This means:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>When you click a coupon or deal link on our Platform and make a purchase on a merchant&apos;s website, we may receive a commission or referral fee from that merchant</li>
            <li>This commission is paid by the merchant and does not result in any additional cost to you</li>
            <li>Our affiliate relationships do not influence our editorial decisions or the accuracy of the deals we display</li>
            <li>We are a participant in affiliate programs including but not limited to Amazon Associates India, Flipkart Affiliate Program, Cuelinks, vCommission, Admitad, Commission Junction (CJ), ShareASale, and Rakuten Advertising</li>
          </ul>
          <p>This disclosure is made in accordance with the guidelines issued by the Advertising Standards Council of India (ASCI) and applicable consumer protection regulations.</p>
        </Section>

        <Divider />

        {/* Section 5 */}
        <Section id="user-accounts" number="5" title="User Accounts">
          <SubSection title="5.1 Account Registration">
            <p>You may create a free account on DealDhamal using your email address or by signing in via Google OAuth. You are responsible for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Notifying us immediately at <a href="mailto:sarthakwararkar2@gmail.com" className="text-primary hover:underline font-medium">sarthakwararkar2@gmail.com</a> if you suspect any unauthorised access</li>
            </ul>
          </SubSection>
          <SubSection title="5.2 Account Restrictions">
            <p>You must not:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Create multiple accounts for the same person</li>
              <li>Share your account credentials with any third party</li>
              <li>Use another user&apos;s account without permission</li>
              <li>Use automated tools to create accounts or access our Platform</li>
            </ul>
          </SubSection>
          <SubSection title="5.3 Account Termination">
            <p>We reserve the right to suspend or terminate your account at any time without notice if you violate these Terms, engage in fraudulent activity, or if your account has been inactive for more than 24 consecutive months.</p>
          </SubSection>
        </Section>

        <Divider />

        {/* Section 6 */}
        <Section id="coupon-information" number="6" title="Coupon and Deal Information">
          <SubSection title="6.1 Accuracy of Information">
            <p>DealDhamal makes reasonable efforts to verify coupon codes and deals before listing them. However:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>We do not guarantee that any coupon code will work, be valid, or provide the advertised discount</li>
              <li>Offers are subject to the terms and conditions of the individual merchant</li>
              <li>Coupons may expire, be discontinued, or be limited to specific users, regions, or product categories</li>
              <li>Discount values shown are approximate and may vary based on the items in your cart, your location, or other merchant conditions</li>
            </ul>
          </SubSection>
          <SubSection title="6.2 Coupon Validity">
            <p>By clicking &quot;Get Code&quot; or &quot;Get Deal&quot; on our Platform, you acknowledge that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The coupon or deal is being provided on an &quot;as is&quot; basis</li>
              <li>DealDhamal is not responsible if a code does not work at checkout</li>
              <li>You should always verify the offer terms on the merchant&apos;s website before completing a purchase</li>
            </ul>
          </SubSection>
          <SubSection title="6.3 User-Reported Accuracy">
            <p>Our Platform includes a feature allowing users to report whether a coupon worked or did not work. This data is used to improve accuracy but does not constitute a guarantee of validity.</p>
          </SubSection>
        </Section>

        <Divider />

        {/* Section 7 */}
        <Section id="prohibited-conduct" number="7" title="Prohibited Conduct">
          <p>You agree not to use DealDhamal for any of the following:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Submitting false, misleading, or fabricated coupon codes or deals</li>
            <li>Scraping, crawling, or data-mining our Platform through automated means without our written permission</li>
            <li>Attempting to reverse-engineer, decompile, or hack our Platform or underlying technology</li>
            <li>Using our Platform to engage in fraudulent transactions or misrepresentation</li>
            <li>Circumventing any technological measures we use to protect our Platform</li>
            <li>Infringing the intellectual property rights of DealDhamal or any third party</li>
            <li>Engaging in any activity that disrupts or interferes with the normal functioning of our Platform</li>
            <li>Using our Platform to send unsolicited commercial communications (spam)</li>
            <li>Impersonating DealDhamal, our staff, or any other user</li>
          </ul>
        </Section>

        <Divider />

        {/* Section 8 */}
        <Section id="intellectual-property" number="8" title="Intellectual Property">
          <div className="space-y-4">
            <UsageItem title="8.1 Our Content">
              <p>All content on DealDhamal including but not limited to text, graphics, logos, icons, images, software code, and the compilation thereof is the property of DealDhamal or its content suppliers and is protected under the Copyright Act, 1957 (India) and applicable intellectual property laws.</p>
            </UsageItem>
            <UsageItem title="8.2 Trademarks">
              <p>The DealDhamal name, logo, and all related marks are trademarks of DealDhamal. Third-party brand names and logos displayed on our Platform belong to their respective owners and are used solely for identification purposes.</p>
            </UsageItem>
            <UsageItem title="8.3 Limited Licence">
              <p>We grant you a limited, non-exclusive, non-transferable, revocable licence to access and use the Platform for personal, non-commercial purposes in accordance with these Terms.</p>
            </UsageItem>
            <UsageItem title="8.4 User Submissions">
              <p>By submitting coupon codes, reviews, or any other content to DealDhamal, you grant us a worldwide, royalty-free, non-exclusive licence to use, reproduce, publish, and display that content on our Platform.</p>
            </UsageItem>
          </div>
        </Section>

        <Divider />

        {/* Section 9 */}
        <Section id="third-party" number="9" title="Third-Party Websites and Merchant Terms">
          <p>Our Platform contains links to third-party merchant websites. When you click a deal or coupon link:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>You will be redirected to the merchant&apos;s website, which is governed by that merchant&apos;s own terms of service and privacy policy</li>
            <li>DealDhamal has no control over, and is not responsible for, the content, policies, or practices of third-party websites</li>
            <li>Any transaction you complete on a merchant&apos;s website is solely between you and that merchant</li>
            <li>DealDhamal is not a party to any purchase, warranty claim, return, or dispute between you and a merchant</li>
            <li>You are responsible for reading and complying with the merchant&apos;s terms and conditions before making a purchase</li>
          </ul>
        </Section>

        <Divider />

        {/* Section 10 */}
        <Section id="deal-alerts" number="10" title="Deal Alerts and Communications">
          <p>By subscribing to deal alerts or our newsletter, you consent to receive:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Email notifications about new coupons and deals matching your preferences</li>
            <li>Promotional communications about special offers on DealDhamal</li>
            <li>Transactional emails related to your account</li>
          </ul>
          <p>You may unsubscribe at any time by clicking the unsubscribe link in any email or by managing your preferences in your account settings. Please allow up to 7 business days for unsubscribe requests to take effect.</p>
        </Section>

        <Divider />

        {/* Section 11 */}
        <Section id="disclaimers" number="11" title="Disclaimers and Limitation of Liability">
          <div className="space-y-4">
            <UsageItem title="11.1 Platform Provided &quot;As Is&quot;">
              <p>DealDhamal is provided on an &quot;as is&quot; and &quot;as available&quot; basis without any warranties of any kind, whether express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
            </UsageItem>
            <UsageItem title="11.2 No Guarantee of Savings">
              <p>We do not guarantee that any coupon, deal, or cashback offer will result in actual savings. Savings depend entirely on the merchant&apos;s terms, your purchase, and other factors outside our control.</p>
            </UsageItem>
            <UsageItem title="11.3 Limitation of Liability">
              <p>To the maximum extent permitted by applicable Indian law, DealDhamal, its directors, employees, affiliates, and partners shall not be liable for:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or goodwill</li>
                <li>Any losses arising from your use of a coupon or deal found on our Platform</li>
                <li>Any losses arising from your reliance on the accuracy or completeness of information on our Platform</li>
                <li>Any losses arising from your interactions with third-party merchants</li>
              </ul>
              <p className="mt-2">Our total aggregate liability to you for any claim arising from your use of DealDhamal shall not exceed <strong>₹1,000 (Indian Rupees One Thousand)</strong>.</p>
            </UsageItem>
          </div>
        </Section>

        <Divider />

        {/* Section 12 */}
        <Section id="indemnification" number="12" title="Indemnification">
          <p>You agree to indemnify, defend, and hold harmless DealDhamal and its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising from:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your violation of these Terms</li>
            <li>Your use of the Platform</li>
            <li>Any content you submit to the Platform</li>
            <li>Your violation of any third-party rights</li>
          </ul>
        </Section>

        <Divider />

        {/* Section 13 */}
        <Section id="governing-law" number="13" title="Governing Law and Dispute Resolution">
          <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in India.</p>
          <p>Before initiating any legal proceedings, you agree to first attempt to resolve any dispute by contacting us at <a href="mailto:sarthakwararkar2@gmail.com" className="text-primary hover:underline font-medium">sarthakwararkar2@gmail.com</a>. We will make reasonable efforts to resolve the dispute amicably within 30 days.</p>
        </Section>

        <Divider />

        {/* Section 14 */}
        <Section id="changes" number="14" title="Changes to These Terms">
          <p>We reserve the right to modify these Terms at any time. When we make material changes, we will:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Update the &quot;Last Updated&quot; date at the top of this page</li>
            <li>Send an email notification to registered users (for significant changes)</li>
            <li>Display a notice on the Platform</li>
          </ul>
          <p>Your continued use of DealDhamal after any changes to these Terms constitutes your acceptance of the updated Terms.</p>
        </Section>

        <Divider />

        {/* Section 15 */}
        <Section id="contact" number="15" title="Contact Us">
          <p>For any questions, concerns, or requests regarding these Terms of Service, please contact us:</p>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mt-3 space-y-1">
            <p className="font-extrabold text-gray-900 text-sm">DealDhamal</p>
            <p>Email: <a href="mailto:sarthakwararkar2@gmail.com" className="text-primary hover:underline font-medium">sarthakwararkar2@gmail.com</a></p>
            <p>Support: <a href="mailto:sarthakwararkar2@gmail.com" className="text-primary hover:underline font-medium">sarthakwararkar2@gmail.com</a></p>
            <p>Website: <a href="https://www.dealdhamal.in" className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">www.dealdhamal.in</a></p>
          </div>
        </Section>

        <Divider />

        {/* Footer note */}
        <p className="text-xs text-gray-400 italic text-center pt-2">
          These Terms of Service were last reviewed and updated on June 13, 2026.
        </p>

        {/* Cross-link */}
        <div className="text-center pt-2">
          <Link href={'/privacy' as any} className="text-primary text-xs font-semibold hover:underline">
            View our Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ────────────────────────────────────────── */

function Section({ id, number, title, children }: { id: string; number: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-5">
        <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center border border-primary/20 flex-shrink-0">
          {number}
        </span>
        <h2 className="text-base font-black text-gray-900">{title}</h2>
      </div>
      <div className="space-y-4 text-sm text-gray-600">{children}</div>
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function UsageItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-primary/30 pl-4">
      <p className="font-extrabold text-gray-800 text-xs mb-2">{title}</p>
      <div className="text-gray-600 text-xs">{children}</div>
    </div>
  )
}

function Divider() {
  return <hr className="border-gray-100" />
}
