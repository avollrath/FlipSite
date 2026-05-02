import {
 ArrowDownRight,
 ArrowRight,
 ArrowUpRight,
 type LucideIcon,
} from 'lucide-react'
import { useEffect, useState, type KeyboardEvent } from 'react'

type KPICardProps = {
 title: string
 value: number | string
 subtitle: string
 icon: LucideIcon
 trend: 'up' | 'down' | 'neutral'
 color: 'violet' | 'indigo' | 'blue' | 'green' | 'amber' | 'rose'
 formatter?: (value: number) => string
 onClick?: () => void
}

const colorStyles = {
 amber: 'from-accent/20 to-accent/5 text-accent shadow-accent/20',
 blue: 'from-accent/20 to-accent/5 text-accent shadow-accent/20',
 green: 'from-positive/20 to-positive/5 text-positive shadow-positive/20',
 indigo: 'from-accent/20 to-accent/5 text-accent shadow-accent/20',
 rose: 'from-negative/20 to-negative/5 text-negative shadow-negative/20',
 violet: 'from-accent/20 to-accent/5 text-accent shadow-accent/20',
}

export function KPICard({
 color,
 formatter,
 icon: Icon,
 onClick,
 subtitle,
 title,
 trend,
 value,
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
 className={`relative overflow-hidden rounded-lg border border-border-base bg-card/70 p-5 shadow-xl shadow-border-base/40 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-2xl ${
  onClick ? 'cursor-pointer focus-visible:ring-4 focus-visible:ring-accent/20' : ''
 }`}
 {...interactiveProps}
 >
 <div
  className={`absolute inset-x-8 -top-16 h-28 rounded-full bg-gradient-to-b blur-3xl ${colorStyles[color]}`}
 />
 <div className="relative">
  <div className="flex items-start justify-between gap-4">
  <div>
  <p className="text-sm font-medium text-muted ">
   {title}
  </p>
  <p className="mt-3 text-3xl font-semibold tracking-tight text-base ">
   {displayValue}
  </p>
  </div>
  <div
  className={`grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br shadow-lg ${colorStyles[color]}`}
  >
  <Icon className="h-5 w-5" aria-hidden="true" />
  </div>
  </div>
  <div className="mt-5 flex items-center gap-2 text-sm text-muted ">
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
