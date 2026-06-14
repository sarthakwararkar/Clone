import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="w-full">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
              )}
              {isLast || !item.href ? (
                <span className="text-sm text-gray-900 font-medium truncate max-w-[240px]">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href as any}
                  className="text-sm text-gray-500 hover:text-primary transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
