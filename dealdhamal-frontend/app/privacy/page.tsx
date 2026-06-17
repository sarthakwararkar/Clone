import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | DealDhamal',
  description: 'Learn how DealDhamal collects, uses, and protects your personal data in compliance with Indian data protection laws.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-8 py-12 mb-10 border border-gray-700/50">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #E84141 0%, transparent 60%)' }} />
        <div className="relative flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Privacy Policy</h1>
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
        <Section id="introduction" number="1" title="Introduction">
          <p>
            DealDhamal (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;, &quot;DealDhamal&quot;) is committed to protecting your privacy and handling your personal data with transparency and care. This Privacy Policy explains how we collect, use, store, share, and protect your personal information when you use the DealDhamal website, mobile application, browser extension, and related services (collectively, the &quot;Platform&quot;).
          </p>
          <p>This Privacy Policy is published in compliance with:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The Information Technology Act, 2000 (India) and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</li>
            <li>The Digital Personal Data Protection Act, 2023 (DPDP Act), India</li>
            <li>Any other applicable data protection laws in India</li>
          </ul>
          <p>
            Please read this Privacy Policy carefully. By using our Platform, you consent to the collection and use of your information as described in this Policy. If you do not agree, please discontinue use of the Platform.
          </p>
        </Section>

        <Divider />

        {/* Section 2 */}
        <Section id="information-we-collect" number="2" title="Information We Collect">
          <SubSection title="2.1 Information You Provide Directly">
            <p>When you interact with DealDhamal, you may provide us with:</p>
            <InfoCard title="Account Information">
              <ul className="list-disc pl-5 space-y-1">
                <li>Full name</li>
                <li>Email address</li>
                <li>Password (stored in encrypted form — we never store plain-text passwords)</li>
                <li>Profile picture (optional)</li>
              </ul>
            </InfoCard>
            <InfoCard title="Communications">
              <ul className="list-disc pl-5 space-y-1">
                <li>Messages you send to our support team</li>
                <li>Feedback, reviews, or coupon reports you submit on the Platform</li>
                <li>Responses to surveys or contests if you participate</li>
              </ul>
            </InfoCard>
            <InfoCard title="Deal Alert Preferences">
              <ul className="list-disc pl-5 space-y-1">
                <li>Email address for deal alert subscriptions</li>
                <li>Preferred stores or categories for alerts</li>
              </ul>
            </InfoCard>
          </SubSection>

          <SubSection title="2.2 Information Collected Automatically">
            <p>When you use our Platform, we automatically collect:</p>
            <InfoCard title="Usage Data">
              <ul className="list-disc pl-5 space-y-1">
                <li>Pages visited, coupons clicked, and deals viewed</li>
                <li>Search queries entered on DealDhamal</li>
                <li>Time and date of your visits</li>
                <li>Which coupon codes you revealed or copied</li>
                <li>Whether a coupon was reported as working or not working</li>
              </ul>
            </InfoCard>
            <InfoCard title="Device and Technical Information">
              <ul className="list-disc pl-5 space-y-1">
                <li>IP address (stored in anonymised/hashed form for analytics)</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Device type (mobile, tablet, desktop)</li>
                <li>Screen resolution</li>
                <li>Referring URL (the website that brought you to DealDhamal)</li>
              </ul>
            </InfoCard>
            <InfoCard title="Cookies and Tracking Technologies">
              <p>We use cookies, web beacons, and similar tracking technologies as described in Section 6 below.</p>
            </InfoCard>
          </SubSection>

          <SubSection title="2.3 Information from Third Parties">
            <InfoCard title="Authentication Providers">
              <p>If you sign in using Google OAuth, we receive from Google your:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Name</li>
                <li>Email address</li>
                <li>Profile picture URL</li>
                <li>Google account ID (used only to link your account)</li>
              </ul>
              <p className="mt-2">We do not receive your Google password.</p>
            </InfoCard>
            <InfoCard title="Affiliate Networks">
              <p>Our affiliate partners (such as Cuelinks, vCommission, Admitad, Amazon Associates) may share aggregate or anonymised conversion data with us (e.g. that a click from our Platform resulted in a purchase). This data is used to verify commissions and does not identify you personally to us.</p>
            </InfoCard>
          </SubSection>
        </Section>

        <Divider />

        {/* Section 3 */}
        <Section id="how-we-use" number="3" title="How We Use Your Information">
          <p>We use the information we collect for the following purposes:</p>
          <div className="space-y-4">
            <UsageItem title="3.1 To Provide Our Services">
              <ul className="list-disc pl-5 space-y-1">
                <li>Creating and managing your DealDhamal account</li>
                <li>Displaying personalised coupon and deal recommendations</li>
                <li>Sending deal alerts and newsletters you have subscribed to</li>
                <li>Processing coupon click tracking to record affiliate conversions</li>
                <li>Allowing you to save coupons to your account</li>
              </ul>
            </UsageItem>
            <UsageItem title="3.2 To Improve Our Platform">
              <ul className="list-disc pl-5 space-y-1">
                <li>Analysing which coupons and deals are most popular</li>
                <li>Understanding how users navigate our Platform</li>
                <li>Identifying and fixing bugs or technical issues</li>
                <li>Developing new features and improving existing ones</li>
                <li>Measuring the effectiveness of our coupon verification system</li>
              </ul>
            </UsageItem>
            <UsageItem title="3.3 To Communicate With You">
              <ul className="list-disc pl-5 space-y-1">
                <li>Sending transactional emails (account confirmation, password reset)</li>
                <li>Sending deal alert emails and newsletters (only if subscribed)</li>
                <li>Responding to your support queries or feedback</li>
                <li>Notifying you of changes to our Terms of Service or this Privacy Policy</li>
              </ul>
            </UsageItem>
            <UsageItem title="3.4 For Legal and Safety Purposes">
              <ul className="list-disc pl-5 space-y-1">
                <li>Detecting and preventing fraud, abuse, or unauthorised access</li>
                <li>Complying with applicable Indian laws and legal obligations</li>
                <li>Enforcing our Terms of Service</li>
                <li>Protecting the rights, property, and safety of DealDhamal, our users, and the public</li>
              </ul>
            </UsageItem>
            <UsageItem title="3.5 For Business Analytics">
              <ul className="list-disc pl-5 space-y-1">
                <li>Generating aggregated, anonymised reports about Platform usage</li>
                <li>Measuring affiliate commission performance</li>
                <li>Understanding traffic sources and user acquisition channels</li>
              </ul>
            </UsageItem>
          </div>
        </Section>

        <Divider />

        {/* Section 4 */}
        <Section id="how-we-share" number="4" title="How We Share Your Information">
          <p>We <strong>do not sell</strong> your personal data to third parties. We share your information only in the following circumstances:</p>

          <SubSection title="4.1 Affiliate and Marketing Networks">
            <p>When you click a deal or coupon link on DealDhamal, you are redirected to a merchant&apos;s website through an affiliate tracking link. The affiliate network and the merchant may receive:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>A unique click identifier (not your name or email)</li>
              <li>Anonymised browser and device information</li>
              <li>The fact that you came from DealDhamal</li>
            </ul>
            <p>This is necessary for us to earn commissions and verify that our links are working correctly.</p>
          </SubSection>

          <SubSection title="4.2 Service Providers">
            <p>We share data with trusted third-party service providers who help us operate the Platform, under strict data processing agreements:</p>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-xs border border-gray-200 rounded-xl overflow-hidden border-collapse">
                <thead>
                  <tr>
                    <th className="bg-gray-50 px-3 py-2.5 text-left font-bold text-gray-700 border-b border-gray-200">Service Provider</th>
                    <th className="bg-gray-50 px-3 py-2.5 text-left font-bold text-gray-700 border-b border-gray-200">Purpose</th>
                    <th className="bg-gray-50 px-3 py-2.5 text-left font-bold text-gray-700 border-b border-gray-200">Data Shared</th>
                  </tr>
                </thead>
                <tbody>
                  {[['Neon (neon.tech)', 'Database hosting', 'Account data, usage data'],['Supabase', 'Authentication', 'Email, name, auth tokens'],['Cloudinary', 'Image hosting', 'Store logos and banners only'],['Resend.com', 'Email delivery', 'Email address, name'],['Upstash', 'Caching', 'Anonymised request data'],['Sentry', 'Error monitoring', 'Anonymised error logs, device info'],['Vercel', 'Frontend hosting', 'Anonymised access logs'],['Cloudflare', 'Backend hosting, CDN', 'Anonymised request data, IP']].map(([provider, purpose, data], i, arr) => (
                    <tr key={provider} className="hover:bg-gray-50">
                      <td className={`px-3 py-2 text-gray-600 align-top${i < arr.length - 1 ? ' border-b border-gray-100' : ''}`}>{provider}</td>
                      <td className={`px-3 py-2 text-gray-600 align-top${i < arr.length - 1 ? ' border-b border-gray-100' : ''}`}>{purpose}</td>
                      <td className={`px-3 py-2 text-gray-600 align-top${i < arr.length - 1 ? ' border-b border-gray-100' : ''}`}>{data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>These providers are not permitted to use your data for their own purposes beyond what is necessary to provide services to us.</p>
          </SubSection>

          <SubSection title="4.3 Legal Requirements">
            <p>We may disclose your information when required by law, including in response to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Court orders or legal proceedings</li>
              <li>Requests from law enforcement authorities in India</li>
              <li>To protect the rights or safety of DealDhamal or others</li>
              <li>To investigate suspected fraud or violations of our Terms</li>
            </ul>
          </SubSection>

          <SubSection title="4.4 Business Transfers">
            <p>If DealDhamal is involved in a merger, acquisition, or sale of assets, your personal data may be transferred as part of that transaction. We will notify you via email or a prominent notice on our Platform before your data is transferred and becomes subject to a different privacy policy.</p>
          </SubSection>

          <SubSection title="4.5 With Your Consent">
            <p>We may share your information with other parties when you have given us explicit consent to do so.</p>
          </SubSection>
        </Section>

        <Divider />

        {/* Section 5 */}
        <Section id="data-retention" number="5" title="Data Retention">
          <p>We retain your personal data for as long as necessary to fulfil the purposes described in this Policy:</p>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-xs border border-gray-200 rounded-xl overflow-hidden border-collapse">
              <thead>
                <tr>
                  <th className="bg-gray-50 px-3 py-2.5 text-left font-bold text-gray-700 border-b border-gray-200">Data Type</th>
                  <th className="bg-gray-50 px-3 py-2.5 text-left font-bold text-gray-700 border-b border-gray-200">Retention Period</th>
                </tr>
              </thead>
              <tbody>
                {[['Account information', 'Until you delete your account + 30 days'],['Coupon click logs', '24 months (anonymised after 12 months)'],['Email communications', '3 years'],['Deal alert subscriptions', 'Until you unsubscribe + 30 days'],['Error and crash logs (Sentry)', '90 days'],['Analytics data (aggregated)', 'Indefinitely (anonymised)']].map(([type, period], i, arr) => (
                  <tr key={type} className="hover:bg-gray-50">
                    <td className={`px-3 py-2 text-gray-600 align-top${i < arr.length - 1 ? ' border-b border-gray-100' : ''}`}>{type}</td>
                    <td className={`px-3 py-2 text-gray-600 align-top${i < arr.length - 1 ? ' border-b border-gray-100' : ''}`}>{period}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>After the applicable retention period, we securely delete or anonymise your data so it can no longer be linked to you.</p>
        </Section>

        <Divider />

        {/* Section 6 */}
        <Section id="cookies" number="6" title="Cookies and Tracking Technologies">
          <SubSection title="6.1 What Are Cookies">
            <p>Cookies are small text files stored on your device when you visit a website. We use cookies and similar technologies to make our Platform work properly and to improve your experience.</p>
          </SubSection>
          <SubSection title="6.2 Types of Cookies We Use">
            <InfoCard title="Strictly Necessary Cookies">
              <p>These are essential for the Platform to function. They include session cookies for keeping you logged in and security cookies. You cannot opt out of these.</p>
            </InfoCard>
            <InfoCard title="Analytics Cookies">
              <p>We use Vercel Analytics to understand how users interact with our Platform. These cookies collect anonymised data about page views, traffic sources, and usage patterns. No personally identifiable information is tracked.</p>
            </InfoCard>
            <InfoCard title="Preference Cookies">
              <p>These remember your preferences such as your selected coupon filters, view mode (grid/list), and notification settings.</p>
            </InfoCard>
            <InfoCard title="Affiliate Tracking Cookies">
              <p>When you click a coupon or deal link, affiliate network cookies may be set by the merchant&apos;s website or affiliate network to track whether your visit resulted in a purchase. This tracking happens on the merchant&apos;s website and is governed by their privacy policy.</p>
            </InfoCard>
          </SubSection>
          <SubSection title="6.3 Managing Cookies">
            <p>You can control cookies through your browser settings. Most browsers allow you to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>View cookies currently stored</li>
              <li>Delete all or specific cookies</li>
              <li>Block cookies from certain or all websites</li>
            </ul>
            <p>Please note that disabling cookies may affect the functionality of DealDhamal, including keeping you logged in.</p>
          </SubSection>
        </Section>

        <Divider />

        {/* Section 7 */}
        <Section id="data-security" number="7" title="Data Security">
          <p>We take the security of your personal data seriously and implement appropriate technical and organisational measures, including:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Encryption in transit:</strong> All data transmitted between your browser and our Platform is encrypted using TLS (HTTPS)</li>
            <li><strong>Password security:</strong> Passwords are hashed using industry-standard algorithms via Supabase Auth — we never store plain-text passwords</li>
            <li><strong>Database security:</strong> Our Neon PostgreSQL database uses SSL connections and is not publicly accessible</li>
            <li><strong>Access controls:</strong> Only authorised team members have access to personal data, on a need-to-know basis</li>
            <li><strong>IP anonymisation:</strong> IP addresses used for analytics are hashed and anonymised</li>
            <li><strong>Regular security reviews:</strong> We periodically review our security practices</li>
          </ul>
          <p>Despite our best efforts, no method of transmission over the internet or method of electronic storage is 100% secure. We cannot guarantee absolute security of your data.</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4 text-yellow-800 text-xs">
            <strong>Data Breach Notification:</strong> In the event of a data breach that poses a risk to your rights and freedoms, we will notify you and the relevant Indian data protection authority as required by the DPDP Act, 2023.
          </div>
        </Section>

        <Divider />

        {/* Section 8 */}
        <Section id="your-rights" number="8" title="Your Rights Under the DPDP Act, 2023">
          <p>Under the Digital Personal Data Protection Act, 2023 (India), you have the following rights regarding your personal data:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {[
              { title: '8.1 Right to Access', desc: 'Request a summary of the personal data we hold about you and the purposes for which it is processed.' },
              { title: '8.2 Right to Correction', desc: 'Request correction of inaccurate or incomplete personal data we hold about you.' },
              { title: '8.3 Right to Erasure', desc: 'Request deletion of your personal data in certain circumstances, including when the data is no longer necessary.' },
              { title: '8.4 Right to Withdraw Consent', desc: 'Withdraw consent for processing at any time. Withdrawal will not affect lawfulness of prior processing.' },
              { title: '8.5 Right to Grievance Redressal', desc: 'Have your grievances regarding our data processing practices addressed promptly.' },
              { title: '8.6 Right to Nominate', desc: 'Nominate an individual who shall exercise your rights in the event of your death or incapacity.' },
            ].map((r) => (
              <div key={r.title} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="font-bold text-gray-900 text-xs mb-1">{r.title}</p>
                <p className="text-gray-600 text-xs">{r.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-4 text-xs text-gray-700">
            <strong>To exercise any of these rights,</strong> please contact us at{' '}
            <a href="mailto:beastultra59@gmail.com" className="text-primary font-semibold hover:underline">beastultra59@gmail.com</a>. We will respond within 30 days. We may need to verify your identity before processing your request.
          </div>
        </Section>

        <Divider />

        {/* Section 9 */}
        <Section id="childrens-privacy" number="9" title="Children's Privacy">
          <p>DealDhamal is not intended for use by individuals under the age of 18. We do not knowingly collect personal data from children under 18. If we become aware that we have inadvertently collected personal data from a child under 18, we will take immediate steps to delete such data.</p>
          <p>If you are a parent or guardian and believe your child has provided us with personal data, please contact us at <a href="mailto:beastultra59@gmail.com" className="text-primary font-semibold hover:underline">beastultra59@gmail.com</a>.</p>
        </Section>

        <Divider />

        {/* Section 10 */}
        <Section id="third-party-links" number="10" title="Links to Third-Party Websites">
          <p>Our Platform contains links to third-party merchant websites and affiliate networks. This Privacy Policy applies only to DealDhamal. When you click a deal link and visit a merchant&apos;s website:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>That website is governed by its own privacy policy</li>
            <li>We are not responsible for the privacy practices of third-party websites</li>
            <li>We encourage you to read the privacy policy of any website you visit through our links</li>
          </ul>
        </Section>

        <Divider />

        {/* Section 11 */}
        <Section id="changes" number="11" title="Changes to This Privacy Policy">
          <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make changes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>We will update the &quot;Last Updated&quot; date at the top of this page</li>
            <li>For significant changes, we will send an email notification to registered users</li>
            <li>We will display a banner or notice on the Platform</li>
          </ul>
          <p>Your continued use of DealDhamal after any changes constitutes your acceptance of the updated Policy. If you do not agree with the changes, you should stop using the Platform and may request deletion of your account.</p>
        </Section>

        <Divider />

        {/* Section 12 */}
        <Section id="grievance-officer" number="12" title="Grievance Officer">
          <p>In accordance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023, we have appointed a Grievance Officer to address any concerns or complaints regarding the processing of your personal data.</p>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mt-3 space-y-1">
            <p className="font-extrabold text-gray-900 text-sm">Grievance Officer — DealDhamal</p>
            <p>Email: <a href="mailto:beastultra59@gmail.com" className="text-primary hover:underline font-medium">beastultra59@gmail.com</a></p>
            <p className="text-gray-500 text-xs">Response time: Within 30 days of receipt of complaint</p>
          </div>
          <p>If you are not satisfied with our response, you may approach the Data Protection Board of India once it is operational under the DPDP Act, 2023.</p>
        </Section>

        <Divider />

        {/* Section 13 */}
        <Section id="contact" number="13" title="Contact Us">
          <p>For any questions, concerns, or requests regarding this Privacy Policy or how we handle your personal data, please contact us:</p>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mt-3 space-y-1">
            <p className="font-extrabold text-gray-900 text-sm">DealDhamal Privacy Team</p>
            <p>Email: <a href="mailto:beastultra59@gmail.com" className="text-primary hover:underline font-medium">beastultra59@gmail.com</a></p>
            <p>Support: <a href="mailto:beastultra59@gmail.com" className="text-primary hover:underline font-medium">beastultra59@gmail.com</a></p>
            <p>Website: <a href="https://www.dealdhamal.in" className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">www.dealdhamal.in</a></p>
          </div>
        </Section>

        <Divider />

        {/* Footer note */}
        <p className="text-xs text-gray-400 italic text-center pt-2">
          This Privacy Policy was last reviewed and updated on June 13, 2026.
        </p>

        {/* Cross-link */}
        <div className="text-center pt-2">
          <Link href={'/terms' as any} className="text-primary text-xs font-semibold hover:underline">
            View our Terms of Service →
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

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mt-3">
      <p className="font-bold text-gray-800 text-xs mb-2">{title}</p>
      <div className="text-gray-600 text-xs space-y-1">{children}</div>
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
