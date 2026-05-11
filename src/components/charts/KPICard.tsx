import {
 ArrowDownRight,
 ArrowRight,
 ArrowUpRight,
 type LucideIcon,
} from 'lucide-react'
import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react'

type KPICardProps = {
 title: string
 value: number | string
 subtitle: ReactNode
 icon: LucideIcon
 trend: 'up' | 'down' | 'neutral'
 color: 'violet' | 'indigo' | 'blue' | 'green' | 'amber' | 'rose'
 formatter?: (value: number) => string
 onClick?: () => void
 valueTitle?: string
}

export function KPICard({
 formatter,
 icon: Icon,
 onClick,
 subtitle,
 title,
 trend,
 value,
 valueTitle,
}: KPICardProps) {
 const numericValue = typeof value === 'number' ? value : null
 const animatedValue = useCountUp(numericValue ?? 0)
 const displayValue =
 numericValue === null ? value : formatter ? formatter(animatedValue) : animatedValue.toFixed(0)
 const TrendIcon =
 trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : ArrowRight

 const interactiveProps = onClick
 ? {
  onClick,
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
  if (event.key === 'Enter' || event.key === ' ') {
  event.preventDefault()
  onClick()
  }
  },
  role: 'button',
  tabIndex: 0,
 }
 : {}

 return (
 <article
 className={`relative min-h-[100px] overflow-hidden rounded-lg border border-layout bg-card p-5 shadow-xl shadow-layout/40 backdrop-blur transition hover:shadow-2xl ${
  onClick ? 'cursor-pointer focus-visible:ring-4 focus-visible:ring-accent/20' : ''
 }`}
 {...interactiveProps}
 >
 <div
  className="pointer-events-none absolute inset-0"
  style={{
  background:
   'radial-gradient(ellipse 80% 60% at 50% 0%, hsl(var(--accent) / 0.13) 0%, transparent 70%)',
  }}
 />
 <div className="relative z-10">
  <div className="flex items-start justify-between gap-4">
  <div className="min-w-0">
  <p className="text-xs font-medium uppercase tracking-widest text-muted">
   {title}
  </p>
  <p
   className="mt-3 truncate text-2xl font-bold tracking-tight text-base md:text-3xl"
   title={valueTitle}
  >
   {displayValue}
  </p>
  </div>
  <div
  className={`grid h-11 w-11 place-items-center rounded-lg shadow-lg ${iconColorClassName(title)}`}
  >
  <Icon className="h-5 w-5" aria-hidden="true" />
  </div>
  </div>
  <div className="mt-4 flex items-center gap-2 text-sm text-muted">
  <TrendIcon
  className={`h-4 w-4 ${trendClassName(trend)}`}
  aria-hidden="true"
  />
  <span>{subtitle}</span>
  </div>
 </div>
 </article>
 )
}

function iconColorClassName(title: string) {
 if (title === 'Biggest Loss') {
 return 'bg-negative/15 text-negative shadow-negative/20'
 }

 return 'bg-accent/15 text-accent shadow-accent/20'
}

function useCountUp(value: number) {
 const [displayValue, setDisplayValue] = useState(0)

 useEffect(() => {
 const duration = 700
 const startTime = performance.now()
 let frameId = 0

 function updateFrame(now: number) {
 const progress = Math.min((now - startTime) / duration, 1)
 const easedProgress = 1 - Math.pow(1 - progress, 3)
 setDisplayValue(value * easedProgress)

 if (progress < 1) {
  frameId = requestAnimationFrame(updateFrame)
 }
 }

 frameId = requestAnimationFrame(updateFrame)

 return () => cancelAnimationFrame(frameId)
 }, [value])

 return displayValue
}

function trendClassName(trend: KPICardProps['trend']) {
 if (trend === 'up') {
 return 'text-positive'
 }

 if (trend === 'down') {
 return 'text-negative'
 }

 return 'text-muted'
}
