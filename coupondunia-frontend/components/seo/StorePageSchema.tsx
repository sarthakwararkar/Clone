import type { Store, Coupon } from '@/types'

interface StorePageSchemaProps {
  store: Store
  coupons: Coupon[]
}

export function StorePageSchema({ store, coupons }: StorePageSchemaProps) {
  // Schema 1: ItemList of coupons
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${store.name} Coupons & Promo Codes`,
    "url": `https://dealdhamal.vercel.app/stores/${store.slug}`,
    "numberOfItems": coupons.length,
    "itemListElement": coupons.map((coupon, index) => {
      const offer = {
        "@type": "Offer",
        "name": coupon.title,
        "url": `https://dealdhamal.vercel.app/coupons/${coupon.id}`,
        "seller": {
          "@type": "Organization",
          "name": store.name,
          ...(store.website_url ? { "url": store.website_url } : {})
        },
        ...(coupon.expires_at ? { "validThrough": coupon.expires_at } : {}),
        ...(coupon.description ? { "description": coupon.description } : {})
      }

      return {
        "@type": "ListItem",
        "position": index + 1,
        "item": offer
      }
    })
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
        "name": "Stores",
        "item": "https://dealdhamal.vercel.app/stores"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${store.name} Coupons`,
        "item": `https://dealdhamal.vercel.app/stores/${store.slug}`
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}
