import { useTheme } from '@/lib/theme'
import { useMemo } from 'react'

// Simple SVG React component wrapper
function LogoMark(props: { style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 194 99"
      xmlns="http://www.w3.org/2000/svg"
      style={{ ...props.style, fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: 2 }}
    >
      <g transform="matrix(1,0,0,1,-263.935,-152.82)">
        <g transform="matrix(8.91137,0,0,8.91137,-2723.39,-2268.12)">
          <path d="M336.366,280.668L336.366,277.416L338.07,277.416L338.07,276.408L336.366,276.408L336.366,273.708L336.942,273.708L336.942,275.772L338.082,275.772L338.082,272.748L335.226,272.748L335.226,280.668L336.366,280.668Z" style={{ fillRule: 'nonzero' }} />
        </g>
        <g transform="matrix(8.91137,0,0,8.91137,-2723.39,-2268.12)">
          <rect x="338.658" y="271.668" width="1.14" height="9" style={{ fillRule: 'nonzero' }} />
        </g>
        <g transform="matrix(-8.91137,-1.09133e-15,1.09133e-15,-8.91137,3353.17,2658.77)">
          <path d="M341.514,274.068L340.374,274.068L340.374,280.668L341.514,280.668L341.514,274.068ZM340.374,272.436L340.374,273.36C340.374,273.424 340.394,273.476 340.434,273.516C340.474,273.556 340.526,273.576 340.59,273.576L341.286,273.576C341.342,273.576 341.392,273.558 341.436,273.522C341.48,273.486 341.506,273.436 341.514,273.372L341.514,272.436C341.514,272.372 341.492,272.318 341.448,272.274C341.404,272.23 341.35,272.208 341.286,272.208L340.59,272.208C340.526,272.208 340.474,272.23 340.434,272.274C340.394,272.318 340.374,272.372 340.374,272.436Z" style={{ fillRule: 'nonzero' }} />
        </g>
        <g transform="matrix(8.91137,0,0,8.91137,-2723.39,-2268.12)">
          <path d="M344.946,279.132L344.946,274.296C344.946,274.232 344.924,274.178 344.88,274.134C344.836,274.09 344.782,274.068 344.718,274.068L342.09,274.068L342.09,282.708L343.23,282.708L343.23,280.668C343.446,280.668 343.656,280.628 343.86,280.548C344.064,280.468 344.246,280.358 344.406,280.218C344.566,280.078 344.696,279.916 344.796,279.732C344.896,279.548 344.946,279.348 344.946,279.132ZM343.806,275.028L343.806,279.168C343.806,279.328 343.75,279.464 343.638,279.576C343.526,279.688 343.39,279.744 343.23,279.744L343.23,275.028L343.806,275.028Z" style={{ fillRule: 'nonzero' }} />
        </g>
        <g transform="matrix(8.91137,0,0,8.91137,-2723.39,-2268.12)">
          <path d="M347.809,275.387L347.238,274.965L347.238,273.708L346.662,273.708L346.662,276.18L348.15,276.18C348.214,276.18 348.268,276.202 348.312,276.246C348.356,276.29 348.378,276.344 348.378,276.408L348.378,280.452C348.378,280.516 348.356,280.568 348.312,280.608C348.268,280.648 348.214,280.668 348.15,280.668L345.522,280.668L345.522,278.451L346.092,278.029L346.662,278.451L346.662,279.72L347.238,279.72L347.238,277.26L345.75,277.26C345.686,277.26 345.632,277.238 345.588,277.194C345.544,277.15 345.522,277.096 345.522,277.032L345.522,272.976C345.522,272.912 345.542,272.858 345.582,272.814C345.622,272.77 345.674,272.748 345.738,272.748L348.378,272.748L348.378,274.965L347.809,275.387Z" />
        </g>
        <g transform="matrix(8.91137,0,0,8.91137,-2723.39,-2268.12)">
          <path d="M350.094,274.068L348.954,274.068L348.954,280.668L350.094,280.668L350.094,274.068ZM348.954,272.436L348.954,273.36C348.954,273.424 348.974,273.476 349.014,273.516C349.054,273.556 349.106,273.576 349.17,273.576L349.866,273.576C349.922,273.576 349.972,273.558 350.016,273.522C350.06,273.486 350.086,273.436 350.094,273.372L350.094,272.436C350.094,272.372 350.072,272.318 350.028,272.274C349.984,272.23 349.93,272.208 349.866,272.208L349.17,272.208C349.106,272.208 349.054,272.23 349.014,272.274C348.974,272.318 348.954,272.372 348.954,272.436Z" style={{ fillRule: 'nonzero' }} />
        </g>
        <g transform="matrix(8.91137,0,0,8.91137,-2723.39,-2268.12)">
          <path d="M353.526,280.668L353.526,271.668L352.386,271.668L352.386,274.068L350.886,274.068C350.822,274.068 350.77,274.088 350.73,274.128C350.69,274.168 350.67,274.22 350.67,274.284L350.67,279.312C350.67,279.472 350.708,279.634 350.784,279.798C350.86,279.962 350.964,280.108 351.096,280.236C351.228,280.364 351.386,280.468 351.57,280.548C351.754,280.628 351.954,280.668 352.17,280.668L353.526,280.668ZM352.386,279.744L352.278,279.744C352.142,279.744 352.03,279.704 351.942,279.624C351.854,279.544 351.81,279.436 351.81,279.3L351.81,275.028L352.386,275.028L352.386,279.744Z" style={{ fillRule: 'nonzero' }} />
        </g>
        <g transform="matrix(8.91137,0,0,8.91137,-2723.39,-2268.12)">
          <path d="M355.602,280.668L356.958,280.668L356.958,278.304L355.818,278.304L355.818,279.744L355.71,279.744C355.574,279.744 355.462,279.702 355.374,279.618C355.286,279.534 355.242,279.42 355.242,279.276L355.242,277.872L356.73,277.872C356.794,277.872 356.848,277.852 356.892,277.812C356.936,277.772 356.958,277.72 356.958,277.656L356.958,274.296C356.958,274.232 356.936,274.178 356.892,274.134C356.848,274.09 356.794,274.068 356.73,274.068L354.318,274.068C354.254,274.068 354.202,274.09 354.162,274.134C354.122,274.178 354.102,274.232 354.102,274.296L354.102,279.312C354.102,279.472 354.142,279.634 354.222,279.798C354.302,279.962 354.41,280.108 354.546,280.236C354.682,280.364 354.84,280.468 355.02,280.548C355.2,280.628 355.394,280.668 355.602,280.668ZM355.818,275.028L355.818,276.924L355.242,276.924L355.242,275.028L355.818,275.028Z" style={{ fillRule: 'nonzero' }} />
        </g>
      </g>
    </svg>
  )
}

// Reads a CSS variable value from the document root
const getCSSVar = (name: string) =>
  getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()

// Parse "H S% L%" into numeric H, S, L
const parseHSL = (raw: string): [number, number, number] => {
  const parts = raw.replace(/%/g, '').split(/\s+/).map(Number)
  return [parts[0] ?? 220, parts[1] ?? 70, parts[2] ?? 55]
}

// WCAG relative luminance for HSL
const luminanceFromHSL = (h: number, s: number, l: number): number => {
  // Convert HSL to RGB then to relative luminance
  const s1 = s / 100
  const l1 = l / 100
  const a = s1 * Math.min(l1, 1 - l1)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l1 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    const c = Math.max(0, Math.min(1, color))
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(0) + 0.7152 * f(8) + 0.0722 * f(4)
}

// Returns either a very dark or very bright variant of the accent color
// whichever has better contrast against the accent background
const getLogoColor = (h: number, s: number): { color: string; useDark: boolean } => {
  // Accent background luminance (mid lightness ~55%)
  const bgLuminance = luminanceFromHSL(h, s, 55)
  // Dark variant: same hue, low saturation, very dark
  const darkLuminance = luminanceFromHSL(h, Math.min(s, 30), 12)
  // Light variant: same hue, low saturation, very light
  const lightLuminance = luminanceFromHSL(h, Math.min(s, 20), 94)

  const contrastDark =
    (Math.max(bgLuminance, darkLuminance) + 0.05) /
    (Math.min(bgLuminance, darkLuminance) + 0.05)
  const contrastLight =
    (Math.max(bgLuminance, lightLuminance) + 0.05) /
    (Math.min(bgLuminance, lightLuminance) + 0.05)

  const useDark = contrastDark > contrastLight
  const [cl, cs, ll] = useDark
    ? [h, Math.min(s, 30), 12]
    : [h, Math.min(s, 20), 94]

  return {
    color: `hsl(${cl} ${cs}% ${ll}%)`,
    useDark,
  }
}

interface LogoProps {
  /** Height of the whole logo container. Width scales with aspect ratio. Default: 32px */
  size?: number
  className?: string
}

export function Logo({ size = 32, className = '' }: LogoProps) {
  const { theme, mode } = useTheme()

  const { gradientFrom, gradientTo, logoColor } = useMemo(() => {
    const raw = getCSSVar('--accent')
    const [h, s, l] = parseHSL(raw)

    // Gradient: from accent at full saturation to a slightly shifted hue, darker
    const from = `hsl(${h} ${s}% ${l}%)`
    const to = `hsl(${(h + 20) % 360} ${Math.min(s + 10, 100)}% ${Math.max(l - 12, 20)}%)`
    const { color } = getLogoColor(h, s)

    return { gradientFrom: from, gradientTo: to, logoColor: color }
  }, [theme, mode])

  // Container is a square; logo SVG viewBox is 194x99 (≈ 1.96:1 ratio)
  // So container width = size * 1.96 to keep the logo from being squished
  const containerH = size
  const containerW = Math.round(size * 1.96)
  const padding = Math.round(size * 0.18)
  const radius = Math.round(size * 0.22)

  return (
    <div
      className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{
        width: containerW,
        height: containerH,
        borderRadius: radius,
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        padding,
      }}
    >
      <LogoMark style={{ color: logoColor, width: '100%', height: '100%' }} />
    </div>
  )
}
