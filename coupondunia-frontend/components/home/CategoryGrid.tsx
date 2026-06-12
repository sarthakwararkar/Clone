import Link from 'next/link'
import Image from 'next/image'
import type { Category } from '@/types'

interface CategoryGridProps {
  categories: Category[]
}

const fallbackEmojis: Record<string, string> = {
  fashion: '👗',
  electronics: '📱',
  food: '🍕',
  travel: '✈️',
  beauty: '💄',
  health: '💊',
  home: '🏠',
  sports: '⚽',
  books: '📚',
  toys: '🎮',
  grocery: '🛒',
  automotive: '🚗',
}

function getCategoryEmoji(name: string): string {
  const key = name.toLowerCase()
  for (const [k, v] of Object.entries(fallbackEmojis)) {
    if (key.includes(k)) return v
  }
  return '🏷️'
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const items = categories.slice(0, 8)

  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
      {items.map((cat) => (
        <Link
          key={cat.id}
          href={`/categories/${cat.slug}`}
          className="bg-white rounded-xl p-3 text-center shadow-sm hover:shadow-md hover:border-primary border border-transparent transition-all group"
        >
          <div className="flex flex-col items-center">
            {cat.icon_url ? (
              <Image
                src={cat.icon_url}
                alt={cat.name}
                width={32}
                height={32}
                className="object-contain"
              />
            ) : (
              <span className="text-2xl">{getCategoryEmoji(cat.name)}</span>
            )}
            <span className="text-xs font-medium text-gray-700 mt-2 group-hover:text-primary transition-colors">
              {cat.name}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
