import type { ReactNode } from 'react'

interface TooltipProps {
  children: ReactNode
  content: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

export function Tooltip({ children, content, side = 'right', className = '' }: TooltipProps) {
  const sideClasses = {
    top: 'bottom-full mb-2 -translate-x-1/2 left-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    bottom: 'top-full mt-2 -translate-x-1/2 left-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
  }

  return (
    <div className={`group relative inline-flex ${className}`}>
      {children}
      <div
        className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-border-base bg-card px-2 py-1 text-xs font-medium text-base shadow-md opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${sideClasses[side]}`}
      >
        {content}
      </div>
    </div>
  )
}
