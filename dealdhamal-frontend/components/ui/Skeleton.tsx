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

export function CouponCardSkeleton() {
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
