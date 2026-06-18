export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DealDhamal",
    "url": "https://dealdhamal.vercel.app",
    "logo": "https://dealdhamal.vercel.app/logo.png",
    "description": "India's best coupon and cashback aggregator",
    "sameAs": [
      "https://twitter.com/dealdhamal",
      "https://www.facebook.com/dealdhamal",
      "https://www.instagram.com/dealdhamal"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "support@dealdhamal.in",
      "contactType": "customer service"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
