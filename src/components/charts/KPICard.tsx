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
  violet:
    'from-violet-500/20 to-violet-500/5 text-violet-600 shadow-violet-500/20 dark:text-violet-300',
  indigo:
    'from-indigo-500/20 to-indigo-500/5 text-indigo-600 shadow-indigo-500/20 dark:text-indigo-300',
  blue: 'from-blue-500/20 to-blue-500/5 text-blue-600 shadow-blue-500/20 dark:text-blue-300',
  green:
    'from-green-500/20 to-green-500/5 text-green-600 shadow-green-500/20 dark:text-green-300',
  amber:
    'from-amber-500/20 to-amber-500/5 text-amber-600 shadow-amber-500/20 dark:text-amber-300',
  rose: 'from-rose-500/20 to-rose-500/5 text-rose-600 shadow-rose-500/20 dark:text-rose-300',
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
      className={`relative overflow-hidden rounded-lg border border-zinc-200/80 bg-white/70 p-5 shadow-xl shadow-zinc-200/60 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-2xl dark:border-white/10 dark:bg-[#13131a]/75 dark:shadow-black/30 ${
        onClick ? 'cursor-pointer focus-visible:ring-4 focus-visible:ring-violet-500/20' : ''
      }`}
      {...interactiveProps}
    >
      <div
        className={`absolute inset-x-8 -top-16 h-28 rounded-full bg-gradient-to-b blur-3xl ${colorStyles[color]}`}
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {title}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              {displayValue}
            </p>
          </div>
          <div
            className={`grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br shadow-lg ${colorStyles[color]}`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-5 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
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
    return 'text-green-500'
  }

  if (trend === 'down') {
    return 'text-red-500'
  }

  return 'text-zinc-400'
}
