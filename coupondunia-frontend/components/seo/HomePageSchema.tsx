import type { Store } from '@/types'

interface HomePageSchemaProps {
  featuredStores: Store[]
}

export function HomePageSchema({ featuredStores }: HomePageSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Top Stores on DealDhamal",
    "itemListElement": featuredStores.map((store, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Organization",
        "name": store.name,
        "url": `https://www.dealdhamal.in/stores/${store.slug}`,
        ...(store.logo_url ? { "logo": store.logo_url } : {})
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
