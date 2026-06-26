import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  width?: string
  height?: string
  rounded?: string
}

export function Skeleton({ className, width, height, rounded }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200',
        rounded ?? 'rounded-md',
        className
      )}
      style={{ width, height }}
    />
  )
}

export function CouponCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'premium' }) {
  if (variant === 'premium') {
    return (
      <div className="w-full h-[190px] sm:h-[210px] rounded-3xl bg-slate-800/40 animate-pulse relative p-5 sm:p-6 flex flex-col justify-between overflow-hidden border border-white/5 shadow-md">
        {/* Top Header: Logo & Actions */}
        <div className="flex justify-between items-start">
          <Skeleton className="w-11 h-11 rounded-2xl bg-slate-700/60" />
          <div className="flex gap-2">
            <Skeleton className="w-8 h-8 rounded-full bg-slate-700/60" />
            <Skeleton className="w-8 h-8 rounded-full bg-slate-700/60" />
          </div>
        </div>

        {/* Center/Left: Content */}
        <div className="flex-1 flex flex-col justify-end pr-28 sm:pr-32 mt-2 gap-2">
          <Skeleton className="h-3 w-20 bg-slate-700/60 rounded" />
          <Skeleton className="h-5 w-32 bg-slate-700/60 rounded" />
          <Skeleton className="h-4 w-full bg-slate-700/60 rounded" />
          <div className="flex gap-2 mt-1">
            <Skeleton className="h-5 w-14 rounded-full bg-slate-700/60" />
            <Skeleton className="h-5 w-14 rounded-full bg-slate-700/60" />
          </div>
        </div>

        {/* Right: Tilted Image container */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-700/60 rotate-6" />

        {/* Bottom Right: Button */}
        <div className="absolute right-4 bottom-4 w-24 h-9 rounded-full bg-slate-700/60" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
        <div className="space-y-2 flex-shrink-0">
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function StoreCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2">
      <Skeleton className="w-20 h-20 rounded-xl" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}
