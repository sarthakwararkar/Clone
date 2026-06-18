import type { Coupon } from '@/types'

interface CouponPageSchemaProps {
  coupon: Coupon
}

export function CouponPageSchema({ coupon }: CouponPageSchemaProps) {
  // Schema 1: Offer
  const offerSchema = {
    "@context": "https://schema.org",
    "@type": "Offer",
    "name": coupon.title,
    "url": `https://dealdhamal.vercel.app/coupons/${coupon.id}`,
    "seller": {
      "@type": "Organization",
      "name": coupon.store.name,
      ...(coupon.store.website_url ? { "url": coupon.store.website_url } : {})
    },
    ...(coupon.description ? { "description": coupon.description } : {}),
    ...(coupon.expires_at ? { "validThrough": coupon.expires_at } : {}),
    ...(coupon.discount_value ? { "discount": coupon.discount_value } : {})
  }

  // Schema 2: BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://dealdhamal.vercel.app"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": coupon.store.name,
        "item": `https://dealdhamal.vercel.app/stores/${coupon.store.slug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": coupon.title,
        "item": `https://dealdhamal.vercel.app/coupons/${coupon.id}`
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}
