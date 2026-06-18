import type { Category, Store } from '@/types'

interface CategoryPageSchemaProps {
  category: Category
  stores: Store[]
}

export function CategoryPageSchema({ category, stores }: CategoryPageSchemaProps) {
  // Schema 1: ItemList of stores in this category
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Best ${category.name} Stores & Coupons`,
    "itemListElement": stores.map((store, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Organization",
        "name": store.name,
        "url": `https://dealdhamal.vercel.app/stores/${store.slug}`,
        ...(store.logo_url ? { "logo": store.logo_url } : {})
      }
    }))
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
        "name": "Categories",
        "item": "https://dealdhamal.vercel.app/categories"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": category.name,
        "item": `https://dealdhamal.vercel.app/categories/${category.slug}`
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
