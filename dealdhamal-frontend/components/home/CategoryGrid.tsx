import Link from 'next/link'
import Image from 'next/image'
import type { Category } from '@/types'

interface CategoryGridProps {
  categories: Category[]
}

const fallbackIcons: Record<string, string> = {
  fashion: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/T-Shirt/3D/t-shirt_3d.png',
  electronics: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Mobile%20phone/3D/mobile_phone_3d.png',
  food: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hamburger/3D/hamburger_3d.png',
  travel: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Airplane/3D/airplane_3d.png',
  beauty: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Lipstick/3D/lipstick_3d.png',
  health: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pill/3D/pill_3d.png',
  home: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/House/3D/house_3d.png',
  sports: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Soccer%20ball/3D/soccer_ball_3d.png',
  books: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Books/3D/books_3d.png',
  toys: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Video%20game/3D/video_game_3d.png',
  grocery: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Shopping%20cart/3D/shopping_cart_3d.png',
  automotive: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Automobile/3D/automobile_3d.png',
  'ai tools': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Robot/3D/robot_3d.png',
}

function getCategoryIcon(name: string): string {
  const key = name.toLowerCase()
  for (const [k, v] of Object.entries(fallbackIcons)) {
    if (key.includes(k)) return v
  }
  return 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Shopping%20bags/3D/shopping_bags_3d.png'
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const items = categories.slice(0, 8)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
      {items.map((cat) => {
        const iconSrc = cat.icon_url || getCategoryIcon(cat.name)
        // Simulate a deal count based on string length to make it dynamic
        const dealCount = (cat.name.length * 153) % 2000 + 500 
        
        return (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group relative flex flex-col items-center justify-center p-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 border border-white/40"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            
            <div className="relative w-16 h-16 mb-3 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 drop-shadow-md">
              <Image
                src={iconSrc}
                alt={cat.name}
                fill
                sizes="64px"
                className="object-contain"
              />
            </div>
            
            <span className="text-sm font-bold text-gray-800 text-center leading-tight group-hover:text-primary transition-colors">
              {cat.name}
            </span>
            
            <span className="text-[10px] font-semibold text-gray-400 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
              {dealCount.toLocaleString()} Deals <span className="text-primary text-[8px]">▶</span>
            </span>
          </Link>
        )
      })}
    </div>
  )
}
