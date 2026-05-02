import { useMemo } from 'react'
import LogoMark from '../../assets/flipsite_logo.svg?react'
import { useTheme } from '@/lib/theme'

const getCSSVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim()

const getGradientColors = () => {
  const raw = getCSSVar('--accent')
  const parts = raw.replace(/%/g, '').split(/\s+/).map(Number)
  const h = parts[0] || 220
  const s = Math.min(parts[1] || 70, 85)

  return {
    from: `hsl(${h} ${s}% 28%)`,
    to: `hsl(${(h + 15) % 360} ${Math.min(s + 5, 90)}% 18%)`,
  }
}

const SquircleClip = ({ id, w, h }: { id: string; w: number; h: number }) => {
  const r = Math.min(w, h) * 0.45
  const path = [
    `M ${r} 0`,
    `L ${w - r} 0`,
    `C ${w * 0.75} 0 ${w} ${h * 0.25} ${w} ${r}`,
    `L ${w} ${h - r}`,
    `C ${w} ${h * 0.75} ${w * 0.75} ${h} ${w - r} ${h}`,
    `L ${r} ${h}`,
    `C ${w * 0.25} ${h} 0 ${h * 0.75} 0 ${h - r}`,
    `L 0 ${r}`,
    `C 0 ${h * 0.25} ${w * 0.25} 0 ${r} 0`,
    'Z',
  ].join(' ')

  return (
    <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }}>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <path d={path} />
        </clipPath>
      </defs>
    </svg>
  )
}

interface LogoProps {
  className?: string
  size?: number
}

export function Logo({ className = '', size = 36 }: LogoProps) {
  const { mode, theme } = useTheme()
  const { from, to } = useMemo(() => getGradientColors(), [mode, theme])

  const h = size
  const w = Math.round(size * 1.96)
  const pad = Math.round(size * 0.16)
  const clipId = `squircle-${size}`

  return (
    <div
      className={`relative inline-flex flex-shrink-0 ${className}`}
      style={{ height: h, width: w }}
    >
      <SquircleClip id={clipId} w={w} h={h} />
      <div
        style={{
          alignItems: 'center',
          background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
          boxSizing: 'border-box',
          clipPath: `url(#${clipId})`,
          display: 'flex',
          height: h,
          justifyContent: 'center',
          padding: pad,
          width: w,
        }}
      >
        <LogoMark
          style={{
            color: 'white',
            fill: 'currentColor',
            height: '100%',
            width: '100%',
          }}
        />
      </div>
    </div>
  )
}
