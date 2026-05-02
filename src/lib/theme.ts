import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ThemeName =
  | 'midnight'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'slate'
  | 'cyberpunk'
  | 'cassette'
  | 'eighties'
export type ThemeMode = 'light' | 'dark'
export type FontKey = 'inter' | 'geist-sans' | 'plus-jakarta' | 'lora'

type ThemeContextValue = {
  font: FontKey
  mode: ThemeMode
  setFont: (font: FontKey) => void
  setMode: (mode: ThemeMode) => void
  setTheme: (theme: ThemeName) => void
  theme: ThemeName
  toggleMode: () => void
}

const themeStorageKey = 'flipsite-theme'
const modeStorageKey = 'flipsite-theme-mode'
const legacyModeStorageKey = 'flipsite-theme'
const fontStorageKey = 'font'
const themes: ThemeName[] = [
  'midnight',
  'emerald',
  'amber',
  'rose',
  'slate',
  'cyberpunk',
  'cassette',
  'eighties',
]
const fonts: FontKey[] = ['inter', 'geist-sans', 'plus-jakarta', 'lora']
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export const themeOptions: Array<{ label: string; value: ThemeName }> = [
  { label: 'Midnight Drop', value: 'midnight' },
  { label: 'Forest Glass', value: 'emerald' },
  { label: 'Golden Hour', value: 'amber' },
  { label: 'Cold Brew', value: 'slate' },
  { label: 'Neon Petal', value: 'rose' },
  { label: 'Cyberpunk', value: 'cyberpunk' },
  { label: 'Cassette Futurism', value: 'cassette' },
  { label: 'Colorful 80s', value: 'eighties' },
]

export const fontOptions: Array<{
  family: string
  label: string
  value: FontKey
}> = [
  { family: "'Inter', sans-serif", label: 'Inter', value: 'inter' },
  { family: "'DM Sans', sans-serif", label: 'DM Sans', value: 'geist-sans' },
  {
    family: "'Plus Jakarta Sans', sans-serif",
    label: 'Plus Jakarta',
    value: 'plus-jakarta',
  },
  { family: "'Lora', Georgia, serif", label: 'Lora', value: 'lora' },
]

export function applyStoredTheme() {
  if (typeof window === 'undefined') {
    return
  }

  applyTheme(getStoredMode(), getStoredTheme(), getStoredFont())
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [font, setFontState] = useState<FontKey>(() => getStoredFont())
  const [mode, setModeState] = useState<ThemeMode>(() => getStoredMode())
  const [theme, setThemeState] = useState<ThemeName>(() => getStoredTheme())

  useEffect(() => {
    applyTheme(mode, theme, font)
    window.localStorage.setItem(fontStorageKey, font)
    window.localStorage.setItem(modeStorageKey, mode)
    window.localStorage.setItem(themeStorageKey, theme)
  }, [font, mode, theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      font,
      mode,
      setFont(nextFont) {
        setFontState(nextFont)
        applyFont(nextFont)
        window.localStorage.setItem(fontStorageKey, nextFont)
      },
      setMode: setModeState,
      setTheme: setThemeState,
      theme,
      toggleMode() {
        setModeState((currentMode) =>
          currentMode === 'dark' ? 'light' : 'dark',
        )
      },
    }),
    [font, mode, theme],
  )

  return createElement(ThemeContext.Provider, { value }, children)
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}

function applyTheme(mode: ThemeMode, theme: ThemeName, font: FontKey) {
  const root = document.documentElement
  root.classList.toggle('dark', mode === 'dark')
  root.dataset.theme = theme
  applyFont(font)
}

function applyFont(font: FontKey) {
  document.documentElement.dataset.font = font
}

function getStoredTheme(): ThemeName {
  const storedTheme = window.localStorage.getItem(themeStorageKey)

  return themes.includes(storedTheme as ThemeName)
    ? (storedTheme as ThemeName)
    : 'midnight'
}

function getStoredMode(): ThemeMode {
  const storedMode =
    window.localStorage.getItem(modeStorageKey) ??
    window.localStorage.getItem(legacyModeStorageKey)

  if (storedMode === 'light' || storedMode === 'dark') {
    return storedMode
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function getStoredFont(): FontKey {
  const storedFont = window.localStorage.getItem(fontStorageKey)

  return fonts.includes(storedFont as FontKey)
    ? (storedFont as FontKey)
    : 'inter'
}
