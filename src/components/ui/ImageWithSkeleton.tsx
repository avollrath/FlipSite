import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ImageWithSkeletonProps {
  src?: string | null
  alt: string
  className?: string
  skeletonClassName?: string
}

export function ImageWithSkeleton({
  src,
  alt,
  className,
  skeletonClassName,
}: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const showSkeleton = !loaded && !error && src
  const showFallback = !src || error

  return (
    <div className={cn('relative overflow-hidden', skeletonClassName)}>
      {/* Skeleton shimmer — shown while image loads */}
      {showSkeleton && (
        <div className="absolute inset-0 skeleton-shimmer" />
      )}

      {/* Fallback icon — shown when no image or load error */}
      {showFallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-2">
          <svg
            className="h-6 w-6 text-muted opacity-40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Actual image — fades in when loaded */}
      {src && !error && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
            className
          )}
        />
      )}
    </div>
  )
}
