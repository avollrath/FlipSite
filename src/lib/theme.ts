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

type ThemeContextValue = {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  setTheme: (theme: ThemeName) => void
  theme: ThemeName
  toggleMode: () => void
}

const themeStorageKey = 'flipsite-theme'
const modeStorageKey = 'flipsite-theme-mode'
const legacyModeStorageKey = 'flipsite-theme'
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

export function applyStoredTheme() {
  if (typeof window === 'undefined') {
    return
  }

  applyTheme(getStoredMode(), getStoredTheme())
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => getStoredMode())
  const [theme, setThemeState] = useState<ThemeName>(() => getStoredTheme())

  useEffect(() => {
    applyTheme(mode, theme)
    window.localStorage.setItem(modeStorageKey, mode)
    window.localStorage.setItem(themeStorageKey, theme)
  }, [mode, theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      setMode: setModeState,
      setTheme: setThemeState,
      theme,
      toggleMode() {
        setModeState((currentMode) =>
          currentMode === 'dark' ? 'light' : 'dark',
        )
      },
    }),
    [mode, theme],
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

function applyTheme(mode: ThemeMode, theme: ThemeName) {
  const root = document.documentElement
  root.classList.toggle('dark', mode === 'dark')
  root.dataset.theme = theme
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
